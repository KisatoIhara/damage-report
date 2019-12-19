import React, { Component } from "react";
import styled from "styled-components";
import { Navbar, Nav } from "react-bootstrap";
import firebase from "../../firebase";

import * as routes from "../../constants/routes";

const db = firebase.firestore();

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = { admin: false };
    let user = firebase.auth().currentUser;
    if (user !== null) {
      db.collection("status")
        .doc(user.uid)
        .get()
        .then(doc => {
          this.setState({ admin: doc.data().admin });
        });
    }
  }
  handleSignOut() {
    firebase.auth().onAuthStateChanged(() => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          window.location.reload();
        })
        .catch(error => {
          console.log(error);
        });
    });
  }
  render() {
    return (
      <Wrapper bg="light" expand="false">
        <H1>{this.props.title}</H1>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav>
            <Menu href={routes.INPUT}>本戦入力フォーム</Menu>
            {this.state.admin ? (
              <Menu href={routes.ALTERNATIVE}>代筆用フォーム</Menu>
            ) : null}
            <Menu href={routes.MY}>マイログの確認/編集</Menu>
            <Menu href={routes.CRAN}>
              クランログの確認{this.state.admin && "/編集"}
            </Menu>
            <Menu href={routes.PROGRESS}>凸状況</Menu>
            {this.state.admin ? (
              <Menu href={routes.MANAGEMENT}>管理画面</Menu>
            ) : null}
            <Menu href={routes.MYPAGE}>マイページ</Menu>
            <Menu onClick={this.handleSignOut}>ログアウト</Menu>
          </Nav>
        </Navbar.Collapse>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Navbar)`
  display: flex;
  align-items: center;
  width: 100%;
  box-shadow: 0px 5px 5px #cbcbdc;
  padding: 5px;
  margin-bottom: 20px;
`;
const H1 = styled.h1`
  font-size: 1.5em;
  font-weight: bold;
  margin: 0 auto;
`;
const Menu = styled(Nav.Link)`
  display: inline-block;
  text-align: end;
  margin-right: 20px;
`;
export default Header;
