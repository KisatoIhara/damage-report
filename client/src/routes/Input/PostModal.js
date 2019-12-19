import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { Modal, Button } from "react-bootstrap";
import ReportView from "../../components/ReportView";
import firebase from "../../firebase";
import * as routes from "../../constants/routes";

const db = firebase.firestore();
const batch = db.batch();
var dataObj;

class PostModal extends Component {
  handlePost() {
    document.getElementById("save").disabled = true;
    let date = dataObj.date;
    let YM = date.replace(/-/g, "").slice(0, 6);
    let postData = { ...dataObj };
    postData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let reportId = db.collection("report").doc().id;
    let reportRef = db
      .collection("report")
      .doc(YM)
      .collection(dataObj.user)
      .doc(reportId);
    batch.set(reportRef, postData);
    let rediasRef = db.collection("redias").doc(YM);
    batch.set(
      rediasRef,
      { [dataObj.user]: { [reportId]: postData } },
      { merge: true }
    );
    batch
      .commit()
      .then(() => {
        this.props.history.push({
          pathname: routes.DONE,
          state: {
            dataObj: { ...dataObj },
            user: this.props.data.user.displayName
          }
        });
      })
      .catch(err => {
        console.log(err);
        document.getElementById("save").disabled = false;
      });
  }
  render() {
    let props = { ...this.props };
    delete props.staticContext;
    let data = this.props.data;
    dataObj = {
      user: data.user,
      date: data.date,
      lap: data.lap,
      boss: data.boss,
      character: [],
      total: data.total,
      type: data.type
    };
    for (let i = 0; i < 5; i++) {
      let obj = {};
      obj.id = data.id[i];
      obj.name = data.name[i];
      obj.damage = data.damage[i];
      dataObj.character.push(obj);
    }
    return (
      <Modal {...props}>
        <Modal.Header closeButton>
          <Modal.Title>投稿内容確認</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReportView
            data={dataObj}
            name={this.props.name}
            icon={this.props.icon}
            bossicon={this.props.bossicon}
          />
        </Modal.Body>
        <Modal.Footer>
          <ButtonWrapper>
            <Button variant="secondary" size="sm" onClick={this.props.onHide}>
              キャンセル
            </Button>
            <Button id="save" onClick={this.handlePost.bind(this)}>
              投稿する
            </Button>
          </ButtonWrapper>
        </Modal.Footer>
      </Modal>
    );
  }
}

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
export default withRouter(PostModal);
