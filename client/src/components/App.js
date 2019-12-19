import React, { Component } from "react";
import { BrowserRouter, Route, Redirect } from "react-router-dom";
import firebase from "../firebase";

import ScrollToTop from "./ScrollToTop";
import Login from "../routes/Login";
import SignUp from "../routes/SignUp";
import SendEmail from "../routes/SendEmail";
//import ForgotPassword from "../routes/ForgotPassword";
import Input from "../routes/Input";
import Alternative from "../routes/Alternative";
import Done from "../routes/Done";
import Progress from "../routes/Progress";
import MyLog from "../routes/MyLog";
import CranLog from "../routes/CranLog";
import Management from "../routes/Management";
import MyPage from "../routes/MyPage";
import NoAuthority from "../routes/NoAuthority";

import * as routes from "../constants/routes";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      authenticated: false,
      emailVerified: false,
      isRedias: false,
      isAdmin: false
    };
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        const db = firebase.firestore();
        db.collection("status")
          .doc(user.uid)
          .get()
          .then(doc => {
            this.setState({
              authenticated: true,
              emailVerified: user.emailVerified,
              loading: false,
              isRedias: doc.exists ? doc.data().redias : null,
              isAdmin: doc.exists ? doc.data().admin : null
            });
          });
      } else {
        this.setState({
          authenticated: false,
          emailVerified: false,
          loading: false
        });
      }
    });
  }

  render() {
    const {
      authenticated,
      loading,
      emailVerified,
      isRedias,
      isAdmin
    } = this.state;
    if (loading) return <p>loading..</p>;
    return (
      <BrowserRouter>
        <ScrollToTop>
          <div>
            <Route
              exact
              path={routes.LOGIN}
              render={() =>
                emailVerified ? (
                  <Redirect to={routes.INPUT} />
                ) : authenticated ? (
                  <Redirect to={routes.CONFIRMATION} />
                ) : (
                  <Login />
                )
              }
            />
            <Route exact path={routes.SIGN_UP} render={() => <SignUp />} />
            <Route
              path={routes.CONFIRMATION}
              render={() =>
                authenticated ? (
                  <SendEmail emailVerified={emailVerified} />
                ) : (
                  <Redirect to={routes.SIGN_UP} />
                )
              }
            />
            {/*
            <Route
              path={routes.FORGOT_PASSWORD}
              render={() => <ForgotPassword />}
            />
            */}
            <Route
              exact
              path={routes.INPUT}
              render={() =>
                emailVerified ? (
                  isRedias ? (
                    <Input />
                  ) : (
                    <NoAuthority />
                  )
                ) : authenticated ? (
                  <Redirect to={routes.CONFIRMATION} />
                ) : (
                  <Redirect to={routes.LOGIN} />
                )
              }
            />
            <Route
              exact
              path={routes.PROGRESS}
              render={() =>
                emailVerified ? (
                  isRedias ? (
                    <Progress />
                  ) : (
                    <NoAuthority />
                  )
                ) : authenticated ? (
                  <Redirect to={routes.CONFIRMATION} />
                ) : (
                  <Redirect to={routes.LOGIN} />
                )
              }
            />
            <Route
              path={routes.ALTERNATIVE}
              render={() =>
                emailVerified ? (
                  isAdmin ? (
                    <Alternative />
                  ) : (
                    <NoAuthority />
                  )
                ) : authenticated ? (
                  <Redirect to={routes.CONFIRMATION} />
                ) : (
                  <Redirect to={routes.LOGIN} />
                )
              }
            />
            <Route
              path={routes.DONE}
              render={() =>
                emailVerified ? (
                  isRedias ? (
                    <Done />
                  ) : (
                    <NoAuthority />
                  )
                ) : authenticated ? (
                  <Redirect to={routes.CONFIRMATION} />
                ) : (
                  <Redirect to={routes.LOGIN} />
                )
              }
            />
            <Route
              path={routes.MY}
              render={() =>
                emailVerified ? (
                  isRedias ? (
                    <MyLog isAdmin={isAdmin} />
                  ) : (
                    <NoAuthority />
                  )
                ) : authenticated ? (
                  <Redirect to={routes.CONFIRMATION} />
                ) : (
                  <Redirect to={routes.LOGIN} />
                )
              }
            />
            <Route
              path={routes.CRAN}
              render={() =>
                emailVerified ? (
                  isRedias ? (
                    <CranLog isAdmin={isAdmin} />
                  ) : (
                    <NoAuthority />
                  )
                ) : authenticated ? (
                  <Redirect to={routes.CONFIRMATION} />
                ) : (
                  <Redirect to={routes.LOGIN} />
                )
              }
            />
            <Route
              path={routes.MANAGEMENT}
              render={() =>
                emailVerified ? (
                  isAdmin ? (
                    <Management />
                  ) : (
                    <NoAuthority />
                  )
                ) : authenticated ? (
                  <Redirect to={routes.CONFIRMATION} />
                ) : (
                  <Redirect to={routes.LOGIN} />
                )
              }
            />
            <Route
              path={routes.MYPAGE}
              render={() =>
                emailVerified ? (
                  <MyPage />
                ) : authenticated ? (
                  <Redirect to={routes.CONFIRMATION} />
                ) : (
                  <Redirect to={routes.LOGIN} />
                )
              }
            />
          </div>
        </ScrollToTop>
      </BrowserRouter>
    );
  }
}

export default App;
