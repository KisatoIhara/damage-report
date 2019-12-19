import React, { Component } from "react";
import LabelList from "../../label/LabelList";
import LabelList2 from "../../label/LabelList2";
import BossLabelList from "../../label/BossLabelList";
import Holder from "../../img/holder.svg";
import Axios from "axios";
import firebase from "../../firebase";
import _ from "lodash";

import { Spinner, Form, Alert, Col, Button } from "react-bootstrap";
import styled, { createGlobalStyle } from "styled-components";
import Header from "../../components/Header";
import { All, Container } from "../../components/Style/Wrapper";
import IconModal from "../../components/IconModal/IconModal";
import PostModal from "../Input/PostModal";
import { makeIconImage } from "../../components/utils/MakeIconImage";
import HowToUse from "../Input/HowToUse";
import DateFormat from "../../components/utils/DateFormat";

const db = firebase.firestore();

var createObjectURL =
  (window.URL || window.webkitURL).createObjectURL || window.createObjectURL;
const CLASSES = [];
const CLASSES_SIX = [];
var checkValidation;

class Alternative extends Component {
  constructor(props) {
    super(props);
    let date = new Date();
    if (date.getHours() <= 4) {
      date.setDate(date.getDate() - 1);
    }
    this.state = {
      isLoad: false,
      miss: false,
      userList: [],
      userMap: {},
      user: "",
      date: DateFormat(date, "yyyy-MM-dd"),
      lap: Number(),
      boss: { id: null, name: "未選択", damage: 0 },
      bossIconList: makeIconImage(true, false, DateFormat(date, "yyyyMM")),
      bossIconListLarge: makeIconImage(true, true, DateFormat(date, "yyyyMM")),
      bossLabelList: BossLabelList[DateFormat(date, "yyyyMM")],
      id: [null, null, null, null, null],
      name: ["未選択", "未選択", "未選択", "未選択", "未選択"],
      damage: [0, 0, 0, 0, 0],
      total: 0,
      iconList: makeIconImage(false, false),
      iconListLarge: makeIconImage(false, true),
      type: null,
      selected: Number,
      modalShow: false,
      postModalShow: false,
      useModal: false
    };

    db.collection("status")
      .where("redias", "==", true)
      .get()
      .then(querySnapshot => {
        let users = [];
        let members = [];
        querySnapshot.forEach(doc => {
          members.push(doc.id);
        });
        db.collection("users")
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(doc => {
              if (members.indexOf(doc.id) >= 0) {
                let obj = doc.data();
                obj.id = doc.id;
                users.push(obj);
              }
            });
            users = _.orderBy(users, "name", "asc");
            let userMap = {};
            users.forEach(obj => {
              userMap[obj.id] = obj.name;
            });
            this.setState({ userList: users, userMap: userMap });
          });
      });

    let x = 0;
    for (let i = 0; i < LabelList.length; i++) {
      CLASSES[x] = LabelList[i];
      CLASSES[x + 1] = LabelList[i];
      x += 2;
    }
    for (let i = 0; i < LabelList2.length; i++) {
      CLASSES_SIX[i] = LabelList2[i];
    }

    this.handleFile = this.handleFile.bind(this);
    this.handleDamage = this.handleDamage.bind(this);
    this.modalClose = this.modalClose.bind(this);
  }
  componentDidUpdate() {
    let lap = document.getElementById("lap").validationMessage;
    let radio = document.getElementById("custom-radio-1").validationMessage;
    let user = document.getElementById("user").validationMessage;
    let validation = !(lap || radio || user);
    checkValidation = validation;
  }

  handleFile(e) {
    let files = e.target.files;
    if (files.length) {
      this.setState({
        isLoad: true,
        miss: false,
        boss: { id: null, name: "未選択", damage: 0 },
        id: [null, null, null, null, null],
        name: ["未選択", "未選択", "未選択", "未選択", "未選択"],
        damage: [0, 0, 0, 0, 0],
        total: 0
      });
      let image_url = createObjectURL(files[0]);
      let showImg = new Image();
      showImg.src = image_url;
      showImg.id = "showImg";
      var area = document.getElementById("inputImgArea");
      while (area.firstChild) area.removeChild(area.firstChild);
      area.appendChild(showImg);

      let file = files[0];
      let params = new FormData();
      params.append("file", file);
      Axios.post(process.env.REACT_APP_INFERENCE, params)
        .then(response => {
          let boss = response.data.boss;
          let name = ["未選択", "未選択", "未選択", "未選択", "未選択"];
          let idList = [null, null, null, null, null];
          response.data.id.forEach((id, i) => {
            if (id !== null) {
              if (id >= CLASSES.length) {
                let sixId = id - CLASSES.length;
                name[i] = CLASSES_SIX[sixId];
                idList[i] = LabelList.indexOf(CLASSES_SIX[sixId]);
              } else {
                name[i] = CLASSES[id];
                idList[i] = LabelList.indexOf(CLASSES[id]);
              }
            }
          });
          this.setState({
            isLoad: false,
            boss: {
              id: boss.id,
              name: this.state.bossLabelList[boss.id],
              damage: boss.damage
            },
            id: idList,
            name: name,
            damage: response.data.damage,
            total: response.data.total
          });
        })
        .catch(err => {
          console.log(err);
          this.setState({
            isLoad: false,
            miss: true
          });
        });
    }
  }

  handleDamage(e, i) {
    if (!isNaN(e.target.value)) {
      if (i < 5) {
        let copy = [...this.state.damage];
        copy[i] = Number(e.target.value);
        var sum = arr => {
          return arr.reduce((prev, current, i, arr) => {
            return prev + current;
          });
        };
        this.setState({
          damage: copy,
          total: sum(copy)
        });
      } else {
        let copy = { ...this.state.boss };
        copy.damage = Number(e.target.value);
        this.setState({ boss: copy });
      }
    }
  }

  modalClose() {
    this.setState({
      modalShow: false,
      postModalShow: false
    });
  }

  render() {
    return (
      <All>
        <GlobalStyle />
        <Header title={"本戦入力フォーム"} />
        <Container>
          <Wrapper>
            <Use onClick={() => this.setState({ useModal: true })}>使い方</Use>
            <HowToUse show={this.state.useModal} self={this} />
            <ButtonWrapper>
              <label className="btn btn-primary btn-block">
                画像を選択
                <InvisibleInput
                  type="file"
                  accept="image/*"
                  onChange={this.handleFile}
                />
              </label>
            </ButtonWrapper>
            <div id="inputImgArea" />
            {this.state.isLoad ? (
              <div>
                <Spinner animation="border" />
                <div>解析中…</div>
              </div>
            ) : null}
            {this.state.miss ? (
              <Alert variant="warning">
                ダメージレポートを見つけられませんでした。
              </Alert>
            ) : null}
            <ReportWrapper>
              <Form onSubmit={e => e.preventDefault()}>
                <Form.Group as={Col}>
                  <Form.Control
                    id="user"
                    as="select"
                    required
                    onChange={e => this.setState({ user: e.target.value })}
                  >
                    <option value="" hidden>
                      凸者を選択
                    </option>
                    {this.state.userList.map((user, i) => {
                      return (
                        <option key={i} value={user.id}>
                          {user.name}
                        </option>
                      );
                    })}
                  </Form.Control>
                </Form.Group>
                <ReportRow>
                  <Form.Group as={Col}>
                    <Form.Label>日付</Form.Label>
                    <Form.Control
                      required
                      type="date"
                      value={this.state.date}
                      onChange={e => this.setState({ date: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label style={{ minWidth: "48px" }}>周回数</Form.Label>
                    <Form.Control
                      id="lap"
                      type="number"
                      min="1"
                      value={this.state.lap}
                      onChange={e =>
                        !isNaN(e.target.value)
                          ? this.setState({ lap: Number(e.target.value) })
                          : null
                      }
                    />
                  </Form.Group>
                </ReportRow>
                <ReportRow space>
                  <IconWrapper
                    onClick={() =>
                      this.setState({ modalShow: true, selected: 5 })
                    }
                  >
                    {this.state.boss.id !== null ? (
                      this.state.bossIconListLarge[this.state.boss.id]
                    ) : (
                      <Img src={Holder} />
                    )}
                  </IconWrapper>
                  <ReportCol>
                    <Form.Group>
                      <Form.Label>{this.state.boss.name}</Form.Label>
                      <Form.Control
                        type="tel"
                        style={{ textAlign: "right" }}
                        value={this.state.boss.damage}
                        onChange={e => this.handleDamage(e, 5)}
                      />
                    </Form.Group>
                  </ReportCol>
                </ReportRow>
                {[...Array(5).keys()].map(i => (
                  <ReportRow key={i}>
                    <IconWrapper
                      onClick={() =>
                        this.setState({ modalShow: true, selected: i })
                      }
                    >
                      {this.state.id[i] !== null ? (
                        this.state.iconListLarge[this.state.id[i]]
                      ) : (
                        <Img src={Holder} />
                      )}
                    </IconWrapper>
                    <ReportCol>
                      <Form.Group>
                        <Form.Label>{this.state.name[i]}</Form.Label>
                        <Form.Control
                          type="tel"
                          style={{ textAlign: "right" }}
                          value={this.state.damage[i]}
                          onChange={e => this.handleDamage(e, i)}
                        />
                      </Form.Group>
                    </ReportCol>
                  </ReportRow>
                ))}
                <ReportRow>
                  <IconWrapper style={{ minWidth: "90px" }}>
                    <Form.Check
                      required
                      custom
                      id="custom-radio-1"
                      name="type"
                      type="radio"
                      label={"通常"}
                      onChange={() => this.setState({ type: "通常" })}
                    />
                    <Form.Check
                      custom
                      id="custom-radio-2"
                      name="type"
                      type="radio"
                      label={"持ち越し"}
                      onChange={() => this.setState({ type: "持ち越し" })}
                    />
                    <Form.Check
                      custom
                      id="custom-radio-3"
                      name="type"
                      type="radio"
                      label={"ラスアタ"}
                      onChange={() => this.setState({ type: "ラスアタ" })}
                    />
                  </IconWrapper>
                  <ReportCol>
                    <Form.Group>
                      <Form.Label>合計</Form.Label>
                      <Form.Control
                        type="tel"
                        style={{ textAlign: "right" }}
                        value={this.state.total}
                        readOnly
                      />
                    </Form.Group>
                  </ReportCol>
                </ReportRow>
                <SubmitButtonWrapper>
                  <Button
                    type="submit"
                    onClick={() =>
                      this.setState({ postModalShow: checkValidation })
                    }
                    disabled={
                      this.state.boss.id === null || this.state.id[0] === null
                    }
                  >
                    投稿する
                  </Button>
                </SubmitButtonWrapper>
              </Form>
            </ReportWrapper>
            {/*
            <button onClick={() => console.log(this.state)}>test</button>
             */}
          </Wrapper>
        </Container>
        <IconModal
          show={this.state.modalShow}
          onHide={this.modalClose}
          list={
            this.state.selected < 5
              ? this.state.iconList
              : this.state.bossIconList
          }
          num={this.state.selected}
          id={
            this.state.selected < 5
              ? this.state.id[this.state.selected]
              : this.state.boss.id
          }
          self={this}
          isform="true"
        />
        <PostModal
          show={this.state.postModalShow}
          onHide={this.modalClose}
          data={this.state}
          name={this.state.userMap[this.state.user]}
          icon={this.state.iconList}
          bossicon={this.state.bossIconList}
          style={{ minWidth: "300px" }}
        />
      </All>
    );
  }
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
const Use = styled.div`
  color: #007bff;
  &:hover {
    cursor: pointer;
  }
`;
const ButtonWrapper = styled.div`
  width: 80%;
  min-width: 300px;
  max-width: 400px;
  margin-top: 20px;
`;
const InvisibleInput = styled(Form.Control)`
  display: none;
`;
const ReportWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  max-width: 350px;
  min-width: 300px;
  margin-top: 20px;
`;
const ReportCol = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;
`;
const ReportRow = styled.div`
  display: flex;
  min-height: 90px;
  ${props => (props.space ? "margin-bottom: 20px" : null)}
`;

const RadioWrapper = styled.div`
  margin: 0 auto;
  border-radius: 1em;
  min-width: 90px;
`;
const IconWrapper = styled(RadioWrapper)`
  &:hover {
    cursor: pointer;
  }
`;
const Img = styled.img`
  border-radius: 10px;
`;
const SubmitButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 50px;
`;
const GlobalStyle = createGlobalStyle`
  #inputImgArea{
    width: 80%;
    min-width: 300px;
    max-width: 400px;
    margin-bottom: 10px;
  }
  #showImg{
    width: 100%;
  }
`;

export default Alternative;
