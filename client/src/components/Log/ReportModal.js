import React, { Component } from "react";
import styled from "styled-components";
import { Modal, Button } from "react-bootstrap";
import ReportView from "../ReportView";
import ReportEdit from "./ReportEdit";
import firebase from "../../firebase";
import _ from "lodash";

const db = firebase.firestore();
const batch = db.batch();
var copyData;
var allData;

class ReportModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      deleteModal: false
    };
  }

  modalClose() {
    /* 差分取得
    const diffProps = _.reduce(
      this.props.data,
      (result, value, key) => {
        return _.isEqual(value, copyData[key]) ? result : result.concat(key);
      },
      []
    );
    */
    this.props.self.setState({ modalShow: false });
    this.setState({ isEdit: false, deleteModal: false });
  }

  postData() {
    delete copyData.docId;
    let YM = copyData.date.replace(/-/g, "").slice(0, 6);
    if (YM !== this.props.ym) {
      let prevReportRef = db
        .collection("report")
        .doc(this.props.ym)
        .collection(copyData.user)
        .doc(this.props.docid);
      batch.delete(prevReportRef);
      delete allData[`${this.props.ym}`][`${this.props.docid}`];
      let prevRediasRef = db.collection("redias").doc(this.props.ym);
      batch.update(prevRediasRef, {
        [`${copyData.user}.${
          this.props.docid
        }`]: firebase.firestore.FieldValue.delete()
      });
    }
    let reportRef = db
      .collection("report")
      .doc(YM)
      .collection(copyData.user)
      .doc(this.props.docid);
    batch.set(reportRef, copyData);
    let rediasRef = db.collection("redias").doc(YM);
    batch.set(
      rediasRef,
      { [copyData.user]: { [this.props.docid]: copyData } },
      { merge: true }
    );
    batch.commit().then(() => {
      this.modalClose();
      window.location.reload();
    });
  }

  handleDelete() {
    let prevReportRef = db
      .collection("report")
      .doc(this.props.ym)
      .collection(copyData.user)
      .doc(this.props.docid);
    batch.delete(prevReportRef);
    let prevRediasRef = db.collection("redias").doc(this.props.ym);
    batch.update(prevRediasRef, {
      [`${copyData.user}.${
        this.props.docid
      }`]: firebase.firestore.FieldValue.delete()
    });
    batch.commit().then(() => {
      this.modalClose();
      window.location.reload();
    });
  }

  render() {
    const uid = firebase.auth().currentUser.uid;
    allData = this.props.alldata;
    //console.log(allData);
    copyData = _.cloneDeep(this.props.data);
    //console.log(copyData)
    //console.log(this.props.docid)
    if (this.props.data !== null) {
      return (
        <Modal show={this.props.show} centered onHide={this.modalClose.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {this.state.isEdit ? "編集中" : "ダメージレポート"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.isEdit ? (
              <ReportEdit
                data={copyData}
                icon={this.props.icon}
                bossicon={this.props.bossicon}
              />
            ) : (
              <ReportView
                data={this.props.data}
                icon={this.props.icon}
                bossicon={this.props.bossicon}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <ButtonWrapper>
              <Button
                variant="secondary"
                size="sm"
                onClick={
                  this.state.isEdit
                    ? () => this.setState({ isEdit: false })
                    : this.modalClose.bind(this)
                }
              >
                {this.state.isEdit ? "キャンセル" : "閉じる"}
              </Button>
              {this.state.isEdit ? (
                <Button
                  variant="danger"
                  onClick={() => this.setState({ deleteModal: true })}
                >
                  削除
                </Button>
              ) : null}
              {this.props.data.user === uid ||
              this.props.isadmin === true ? (
                <Button
                  onClick={
                    this.state.isEdit
                      ? this.postData.bind(this)
                      : () => this.setState({ isEdit: true })
                  }
                >
                  {this.state.isEdit ? "投稿" : "編集"}
                </Button>
              ) : (
                <Button disabled>編集不可</Button>
              )}
            </ButtonWrapper>
          </Modal.Footer>
          <Modal
            show={this.state.deleteModal}
            size="sm"
            centered
            animation={false}
            onHide={() => this.setState({ deleteModal: false })}
          >
            <Modal.Header closeButton>
              <Modal.Title>確認</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              ダメレポは一度削除すると復元できません。削除してよろしいですか？
            </Modal.Body>
            <Modal.Footer>
              <ButtonWrapper>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => this.setState({ deleteModal: false })}
                >
                  キャンセル
                </Button>
                <Button variant="danger" onClick={this.handleDelete.bind(this)}>
                  削除
                </Button>
              </ButtonWrapper>
            </Modal.Footer>
          </Modal>
        </Modal>
      );
    } else {
      return null;
    }
  }
}

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
export default ReportModal;
