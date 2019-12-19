import React, { Component } from "react";
import styled from "styled-components";
import { Modal, Button } from "react-bootstrap";
import ResultLog from "../../img/sample/ResultLog.png";
import SelectLog from "../../img/sample/SelectLog.jpg";
import MyLog from "../../img/sample/MyLog.jpg";

class HowToUse extends Component {
  render() {
    return (
      <Modal
        {...this.props}
        scrollable
        onHide={() => this.props.self.setState({ useModal: false })}
      >
        <Modal.Header closeButton>
          <Modal.Title>使い方</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            「画像を選択」ボタンから「ダメージレポート」画面のスクリーンショットを選択してください。加工されている場合や一部端末のスクリーンショットではダメージレポートを検出できない場合があります。
          </p>
          <p>
            画像を選択すると解析が始まります。
            解析終了後、誤認識がないことを確認した上で、周回数と凸タイプを入力し、投稿ボタンから投稿してください。
          </p>
          <p>
            キャラクターやダメージ値に誤認識があった場合は手動で修正できます。
          </p>
          <p>◆「ダメージレポート」画面の例</p>
          <Img src={ResultLog} />
          <p>戦闘終了後、画面右上のボタンから</p>
          <Img src={SelectLog} />
          <p>ボス選択画面右下のログから</p>
          <Img src={MyLog} />
          <p>ゲーム内の「マイログ」から</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => this.props.self.setState({ useModal: false })}
          >
            閉じる
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const Img = styled.img`
  width: 80%;
  margin: 0 auto;
`;
export default HowToUse;
