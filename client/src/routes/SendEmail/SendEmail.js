import React, { Component } from "react";
import Header from "../../components/Header";
import { All } from "../../components/Style/Wrapper";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import * as routes from "../../constants/routes"

class SendEmail extends Component {
  render() {
    if (this.props.emailVerified) {
      return (
        <All>
          <Header title="ダメレポ投稿所" />
          <Text>
            アカウントの登録が完了しました。
          </Text>
          <Button href={routes.INPUT}>本戦入力フォームへ</Button>
        </All>
      );
    } else {
      return (
        <All>
          <Header title="ダメレポ投稿所" />
          <Text>
            メールアドレスに確認メールを送信しました。メールの内容を確認し、登録を完了してください。
          </Text>
        </All>
      );
    }
  }
}

const Text = styled.div`
  width: 80%;
  margin: 20px;
`;
export default SendEmail;
