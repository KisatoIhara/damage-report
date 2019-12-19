import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import {
  Button,
  Col,
  Form,
  FormControl,
  FormGroup,
  Alert
} from "react-bootstrap";
import { All, Well } from "../../components/Style/Wrapper";
import Header from "../../components/Header";
import firebase from "../../firebase";
import * as routes from "../../constants/routes.js";

const db = firebase.firestore();
const batch = db.batch();

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "", email: "", password: "", error: null };
  }
  async handleSignUp(e) {
    e.preventDefault();
    this.setState({ error: null });
    const { name, email, password } = this.state;
    const self = this;
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        let user = firebase.auth().currentUser;
        user.updateProfile({ displayName: name }).then(() => {
          user.sendEmailVerification();
          batch.set(db.collection("users").doc(user.uid), {
            name: name,
            icon: null
          });
          batch.set(db.collection("status").doc(user.uid), {
            admin: false,
            redias: false
          });
          batch.commit();
          self.props.history.push(routes.CONFIRMATION);
        });
      })
      .catch(error => {
        self.setState({ error: error.code });
      });
  }
  render() {
    const { name, email, password } = this.state;
    const isInvalid = password === "" || email === "" || name === "";
    const Warning = () => {
      switch (this.state.error) {
        case "auth/weak-password":
          return "パスワードは6文字以上にする必要があります。";
        case "auth/email-already-in-use":
          return "既に使用されているメールアドレスです。";
        default:
          return "エラーが発生しました。";
      }
    };
    return (
      <All>
        <Header title="ダメレポ投稿所" />
        <Well>
          <Form onSubmit={this.handleSignUp.bind(this)}>
            <FormGroup>
              <Col>ニックネーム(10字以内)</Col>
              <Col>
                <FormControl
                  value={name}
                  type="text"
                  maxLength="10"
                  onChange={e => this.setState({ name: e.target.value })}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="formHorizontalEmail">
              <Col>メールアドレス</Col>
              <Col>
                <FormControl
                  value={email}
                  type="email"
                  onChange={e => this.setState({ email: e.target.value })}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="formHorizontalPassword">
              <Col>パスワード(6字以上)</Col>
              <Col>
                <FormControl
                  value={password}
                  type="password"
                  onChange={e => this.setState({ password: e.target.value })}
                />
              </Col>
            </FormGroup>
            {this.state.error ? (
              <Alert variant="warning">{Warning()}</Alert>
            ) : null}
            <FormGroup>
              <Col>
                <Button disabled={isInvalid} type="submit">
                  作成
                </Button>
              </Col>
            </FormGroup>
          </Form>
        </Well>
      </All>
    );
  }
}

export default withRouter(SignUp);
