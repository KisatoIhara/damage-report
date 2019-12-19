import React, { Component } from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import {
  Button,
  Col,
  Form,
  FormControl,
  FormGroup,
  Alert,
  Row
} from "react-bootstrap";
import firebase from "../../firebase";
import Header from "../../components/Header";
import * as routes from "../../constants/routes";
import { All, Well } from "../../components/Style/Wrapper";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { email: "", password: "", error: false };
    this.handleLogin = this.handleLogin.bind(this);
  }
  async handleLogin(e) {
    e.preventDefault();
    this.setState({ error: false });
    const { email, password } = this.state;
    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => this.props.history.push(routes.INPUT))
      .catch(error => {
        console.log(error)
        this.setState({ error: error.code });
      });
  }
  render() {
    const { email, password } = this.state;
    const isInvalid = password === "" || email === "";
    const Warning = () => {
      switch (this.state.error) {
        case "auth/wrong-password":
          return "パスワードが間違っています。";
        case "auth/user-not-found":
          return "メールアドレスが間違っているか、ユーザーが削除された可能性があります。";
        default:
          return "エラーが発生しました。時間をおいて再度お試しください。";
      }
    };
    return (
      <All>
        <Header title={"ダメレポ投稿所"} />
        <Well>
          <Form onSubmit={this.handleLogin}>
            <FormGroup>
              <Col>メールアドレス</Col>
              <Col>
                <FormControl
                  value={email}
                  type="email"
                  onChange={e => this.setState({ email: e.target.value })}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col>パスワード</Col>
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
            <FormGroup style={{ margin: 15 }}>
              <Col>
                <Row>
                  <Button disabled={isInvalid} type="submit">
                    ログイン
                  </Button>
                  <Center>
                    <a href={routes.SIGN_UP}>新規作成</a>
                  </Center>
                </Row>
              </Col>
            </FormGroup>
          </Form>
        </Well>
      </All>
    );
  }
}

const Center = styled.div`
  margin: auto 15px auto auto;
`;
export default withRouter(Login);
