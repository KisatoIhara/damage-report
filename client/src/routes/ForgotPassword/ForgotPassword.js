import React, { Component } from "react";
import styled from "styled-components"
import {
  Button,
  Col,
  Form,
  FormControl,
  FormGroup,
} from "react-bootstrap";
import { All, Well } from "../../components/Wrapper";
import Header from "../../components/Header";
import firebase from "../../firebase";
import * as routes from "../../constants/routes.js";

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = { name: "", email: "", password: "", error: null };
  }
  async handleSend(e) {
    e.preventDefault();
  }
  render() {
    const { email, password } = this.state;
    const isInvalid = password === "" || email === "";
    return (
      <All>
        <Header title="ダメレポ投稿所" />
          <Text>パスワード再設定用のメールを送信します。アカウント登録したメールアドレスを入力してください。</Text>
        <Well>
          <Form onSubmit={this.handleSend.bind(this)}>
            <FormGroup controlId="formHorizontalEmail">
              <Col>メールアドレス</Col>
              <Col sm={8}>
                <FormControl
                  value={email}
                  type="email"
                  onChange={e => this.setState({ email: e.target.value })}
                />
              </Col>
            </FormGroup>
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

const Text = styled.div`
  width: 80%;
`

export default ForgotPassword;
