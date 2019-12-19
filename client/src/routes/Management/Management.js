import React, { Component } from "react";
import styled from "styled-components";
import { All, Container, Row } from "../../components/Style/Wrapper";
import Header from "../../components/Header";
import { Table, Button, Alert } from "react-bootstrap";
import firebase from "../../firebase";
import _ from "lodash";
import moment from "moment";

const db = firebase.firestore();

class Management extends Component {
  constructor(props) {
    super(props);
    this.state = { users: [], loading: true, err: false };
    db.collection("users")
      .get()
      .then(querySnapshot => {
        let users = {};
        querySnapshot.forEach(usersDoc => {
          users[usersDoc.id] = usersDoc.data();
        });
        db.collection("status")
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(statusDoc => {
              users[statusDoc.id] = {
                ...users[statusDoc.id],
                ...statusDoc.data(),
                id: statusDoc.id
              };
            });
            this.setState({ users: users, loading: false });
          });
      });
    this.saveStatus = this.saveStatus.bind(this);
  }

  CSVDownload(cran) {
    let data = cran.map(obj => {
      let arr = [obj.name, obj.id];
      return arr;
    });
    let keys = ["名前", "ID"];
    let arr = [];
    arr.push(keys);
    data.forEach(data => {
      arr.push(data);
    });
    let output = arr.map(line => line.join()).join("\r\n");
    let bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    let blob = new Blob([bom, output], { type: "text/csv" });
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(
        blob,
        `${moment().format("YYYYMMDD_HHmm")}.csv`
      );
      window.navigator.msSaveOrOpenBlob(
        blob,
        `${moment().format("YYYYMMDD_HHmm")}.csv`
      );
    } else {
      document.getElementById("csv-download").href = window.URL.createObjectURL(
        blob
      );
    }
  }

  handleChange(uid, key) {
    let user = firebase.auth().currentUser;
    if (uid !== user.uid) {
      let copy = this.state.users;
      if (key === "redias" && copy[uid][key]) {
        copy[uid].admin = false;
      }
      if (key === "admin" && !copy[uid][key]) {
        copy[uid].redias = true;
      }
      copy[uid][key] = !copy[uid][key];
      this.setState({ users: copy });
    }
  }

  saveStatus() {
    let users = this.state.users;
    let batch = db.batch();
    Object.keys(users).forEach(id => {
      let Ref = db.collection("status").doc(id);
      let data = { admin: users[id].admin, redias: users[id].redias };
      batch.set(Ref, data);
    });
    batch
      .commit()
      .then(() => {
        window.location.reload();
      })
      .catch(err => {
        this.state({ err: true });
      });
  }

  render() {
    let cran = _.filter(this.state.users, { redias: true });
    let admin = _.filter(this.state.users, { admin: true });
    if (this.state.loading) return <p>loading...</p>;
    return (
      <All>
        <Header title="管理画面" />
        <Wrapper>
          <Text>
            クランメンバーの権限管理をするページです。
            <li>
              管理者：　管理画面での権限管理、自分以外のログの編集・削除、代筆投稿、CSVダウンロードができます。
            </li>
            <li>クラメン：　ダメレポの投稿、ログの閲覧ができます。</li>
          </Text>
          <StatusWrapper>
            <Status>管理者： {admin.length}人</Status>
            <Status>クラメン： {cran.length}人</Status>
          </StatusWrapper>
          <Button
            variant="link"
            id="csv-download"
            href="/management"
            onClick={() => this.CSVDownload(cran)}
            download={`${moment().format("YYYYMMDD")}_対応表.csv`}
          >
            対応表CSV出力
          </Button>
          <Table bordered responsive striped>
            <thead>
              <tr>
                <th>名前・ID</th>
                <th>管理者</th>
                <th>クラメン</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.state.users).map((key, i) => {
                let user = this.state.users[key];
                return (
                  <tr key={i}>
                    <td>
                      {user.name}
                      <br />
                      {key}
                    </td>
                    <td>
                      <SwitchWrapper>
                        <input
                          id={key}
                          type="checkbox"
                          checked={user.admin}
                          onChange={this.handleChange.bind(this, key, "admin")}
                        />
                        <label htmlFor={key} />
                      </SwitchWrapper>
                    </td>
                    <td>
                      <SwitchWrapper>
                        <input
                          id={key}
                          type="checkbox"
                          checked={user.redias}
                          onChange={this.handleChange.bind(this, key, "redias")}
                        />
                        <label htmlFor={key} />
                      </SwitchWrapper>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <ButtonWrapper>
            <Button onClick={this.saveStatus}>保存</Button>
          </ButtonWrapper>
          <ButtonWrapper>
            {this.state.err ? (
              <Alert variant="warning">エラーが発生しました。</Alert>
            ) : null}
          </ButtonWrapper>
        </Wrapper>
      </All>
    );
  }
}

const Wrapper = styled(Container)`
  width: 80%;
`;
const Text = styled.div`
  margin: 10px;
`;
const Status = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin: 10px;
`;
const StatusWrapper = styled(Row)`
  width: 100%;
  justify-content: start;
`;
const ButtonWrapper = styled(Row)`
  width: 100%;
  margin-bottom: 10px;
  justify-content: flex-end;
`;
const SwitchWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 42px;
  margin: auto;
  & input {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    opacity: 0;
    cursor: pointer;
  }
  & label {
    width: 100px;
    height: 42px;
    background: #ccc;
    position: relative;
    display: inline-block;
    border-radius: 46px;
    transition: 0.4s;
    box-sizing: border-box;
    &:before {
      content: "OFF";
      position: absolute;
      left: 50px;
      top: 8px;
      color: white;
      font-weight: bold;
    }
    &:after {
      content: "";
      position: absolute;
      width: 42px;
      height: 42px;
      border-radius: 100%;
      left: 0;
      top: 0;
      z-index: 2;
      background: #fff;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
      transition: 0.4s;
    }
  }

  & input:checked {
    + label {
      background-color: #4bd865;
      &:before {
        content: "ON";
        left: 20px;
      }
      &:after {
        content: "";
        left: 58px;
      }
    }
  }
`;

export default Management;
