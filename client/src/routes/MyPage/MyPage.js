import React, { Component } from "react";
import styled from "styled-components";
import firebase from "../../firebase";
import Header from "../../components/Header";
import { All, Col, Row } from "../../components/Style/Wrapper";
import { Button, Form, Modal } from "react-bootstrap";
import Holder from "../../img/holder.svg";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

const db = firebase.firestore();
const storageRef = firebase.storage().ref();
var createObjectURL =
  (window.URL || window.webkitURL).createObjectURL || window.createObjectURL;
var cropper;

class MyPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: null,
      name: null,
      icon: null,
      url: null,
      blob: null,
      loading: true,
      isEdit: false,
      showModal: false,
      data: {
        name: String,
        icon: String
      }
    };
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        db.collection("users")
          .doc(user.uid)
          .get()
          .then(doc => {
            let data = doc.data();
            this.setState({
              uid: user.uid,
              name: data.name,
              icon: data.icon,
              loading: false
            });
          });
      }
    });
    this.handleFile = this.handleFile.bind(this);
    this.handleCrop = this.handleCrop.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleName = this.handleName.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleFile(e) {
    let files = [...e.target.files];
    e.target.value = "";
    if (files.length) {
      this.setState({ showModal: true }, () => {
        let image_url = createObjectURL(files[0]);
        let showImg = document.getElementById("showImage");
        showImg.src = image_url;
        cropper = new Cropper(showImg, {
          aspectRatio: 1 / 1,
          viewMode: 3
        });
      });
    }
  }

  handleCrop() {
    let canvas = cropper.getCroppedCanvas();
    canvas.toBlob(blob => {
      let url = URL.createObjectURL(blob);
      this.setState({ url: url, blob: blob });
    }, "image/jpeg");
    this.handleClose();
  }

  handleClose() {
    this.setState({ showModal: false });
  }

  handleName(e) {
    let copy = { ...this.state.data };
    copy.name = e.target.value;
    this.setState({ data: copy });
  }

  handleSave() {
    document.getElementById("save").disabled = true;
    let user = firebase.auth().currentUser;
    let data = this.state.data;
    if (this.state.url !== null) {
      let iconRef = storageRef.child(`users/${user.uid}/icon.jpg`);
      iconRef.put(this.state.blob).then(() => {
        data.icon = `https://storage.googleapis.com/${process.env.REACT_APP_PROJECT}.appspot.com/users/${this.state.uid}/icon.jpg`;
        user
          .updateProfile({ displayName: this.state.data.name })
          .then(() => {
            db.collection("users")
              .doc(user.uid)
              .update(this.state.data)
              .then(() => {
                this.setState({
                  isEdit: false,
                  name: data.name,
                  icon: data.icon
                });
              })
              .catch(err => {
                console.log(err);
                document.getElementById("save").disabled = false;
              });
          })
          .catch(err => {
            console.log(err);
            document.getElementById("save").disabled = false;
          });
      });
    } else {
      user
        .updateProfile({ displayName: this.state.data.name })
        .then(() => {
          db.collection("users")
            .doc(user.uid)
            .update(this.state.data)
            .then(() => {
              this.setState({
                isEdit: false,
                name: data.name,
                icon: data.icon
              });
            })
            .catch(err => {
              console.log(err);
              document.getElementById("save").disabled = false;
            });
        })
        .catch(err => {
          console.log(err);
          document.getElementById("save").disabled = false;
        });
    }
  }

  render() {
    const disabled = this.state.data.name === "";
    if (this.state.loading) return <p>loading...</p>;
    if (this.state.isEdit) {
      return (
        <>
          <All>
            <Header title="マイページ" />
            <Wrapper>
              {this.state.url === null ? (
                this.state.data.icon === null ? (
                  <Img id="icon" src={Holder} margin="20px 0 10px 0" />
                ) : (
                  <Img
                    id="icon"
                    src={this.state.data.icon}
                    margin="20px 0 10px 0"
                  />
                )
              ) : (
                <Img id="icon" src={this.state.url} margin="20px 0 10px 0" />
              )}
              <Label className="btn btn-primary btn-sm">
                画像を選択
                <InvisibleInput
                  type="file"
                  accept="image/*"
                  onChange={this.handleFile}
                />
              </Label>
              <Row>
                <div>ニックネーム：</div>
                <input
                  value={this.state.data.name}
                  type="text"
                  maxLength="10"
                  onChange={this.handleName}
                />
              </Row>
              <div>ID： {this.state.uid}</div>
              <Row>
                <Button
                  variant="secondary"
                  style={{ margin: "20px" }}
                  onClick={() => {
                    this.setState({ isEdit: false });
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  id="save"
                  variant="outline-primary"
                  style={{ margin: "20px" }}
                  onClick={this.handleSave}
                  disabled={disabled}
                >
                  保存
                </Button>
              </Row>
            </Wrapper>
          </All>
          <Modal show={this.state.showModal} onHide={this.handleClose}>
            <Modal.Header>
              <Modal.Title>メディアを編集</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div>
                <ShowImg id="showImage" />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <ButtonWrapper>
                <Button variant="secondary" onClick={this.handleClose}>
                  キャンセル
                </Button>
                <Button onClick={this.handleCrop}>トリミング</Button>
              </ButtonWrapper>
            </Modal.Footer>
          </Modal>
        </>
      );
    } else {
      return (
        <All>
          <Header title="マイページ" />
          <Wrapper>
            {this.state.icon === null ? (
              <Img src={Holder} margin="20px 0" />
            ) : (
              <Img src={this.state.icon} />
            )}
            <div>ニックネーム： {this.state.name}</div>
            <div>ID： {this.state.uid}</div>
            <Button
              variant="outline-primary"
              style={{ margin: "20px" }}
              onClick={() =>
                this.setState({
                  isEdit: true,
                  url: null,
                  data: { name: this.state.name, icon: this.state.icon }
                })
              }
            >
              編集
            </Button>
          </Wrapper>
        </All>
      );
    }
  }
}

const Wrapper = styled(Col)`
  width: auto;
  align-items: center;
`;
const Img = styled.img`
  width: 76px;
  margin: ${props => props.margin};
`;
const Label = styled.label`
  margin-bottom: 20px;
  &:hover {
    cursor: pointer;
  }
`;
const InvisibleInput = styled(Form.Control)`
  display: none;
`;
const ShowImg = styled.img`
  max-width: 100%;
`;
const ButtonWrapper = styled(Row)`
  width: 100%;
  justify-content: space-between;
`;

export default MyPage;
