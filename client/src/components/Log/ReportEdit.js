import React, { Component } from "react";
import styled from "styled-components";
import { Form } from "react-bootstrap";
import Holder from "../../img/holder.svg";
import IconModal from "../IconModal/IconModal";

var copy;
class ReportEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      modalShow: false,
      selected: Number
    };
    copy = this.state.data;
  }

  handleDamage(e, i) {
    if (!isNaN(e.target.value)) {
      if (i < 5) {
        copy.character[i].damage = Number(e.target.value);
        var sum = arr => {
          return arr.reduce((prev, current, i, arr) => {
            return prev + current;
          });
        };
        let damage = [];
        copy.character.forEach(value => {
          damage.push(value.damage);
        });
        copy.total = sum(damage);
        this.setState({
          data: copy
        });
      } else {
        copy.boss.damage = Number(e.target.value);
        this.setState({ data: copy });
      }
    }
  }

  handleDate(e) {
    copy.date = e.target.value;
    this.setState({ data: copy });
  }

  handleLap(e) {
    if (!isNaN(e.target.value)) {
      copy.lap = Number(e.target.value);
      this.setState({ data: copy });
    }
  }

  modalClose() {
    this.setState({
      modalShow: false
    });
  }

  render() {
    const players = this.state.data.character.map((pc, i) => {
      return (
        <Row key={i}>
          <IconWrapper
            onClick={() => {
              this.setState({ modalShow: true, selected: i });
            }}
          >
            {this.state.data.character[i].id !== null ? (
              this.props.icon[this.state.data.character[i].id]
            ) : (
              <Img src={Holder} />
            )}
          </IconWrapper>
          <Col>
            <Small>{pc.name}</Small>
            <Form.Control
              type="tel"
              style={{ textAlign: "right" }}
              value={this.state.data.character[i].damage}
              onChange={e => this.handleDamage(e, i)}
            />
          </Col>
        </Row>
      );
    });
    const boss = (
      <Row>
        <IconWrapper
          onClick={() => {
            this.setState({ modalShow: true, selected: 5 });
          }}
        >
          {this.state.data.boss.id !== null ? (
            this.props.bossicon[this.state.data.boss.id]
          ) : (
            <Img src={Holder} />
          )}
        </IconWrapper>
        <Col>
          <Small>{this.state.data.boss.name}</Small>
          <Form.Control
            type="tel"
            style={{ textAlign: "right" }}
            value={this.state.data.boss.damage}
            onChange={e => this.handleDamage(e, 5)}
          />
        </Col>
      </Row>
    );
    return (
      <Wrapper>
        <Col>
          <Row>
            <ColHalf>
              <Form.Control
                required
                type="date"
                value={this.state.data.date}
                onChange={this.handleDate.bind(this)}
              />
            </ColHalf>
            <ColHalf>
              <Row>
                <Form.Control
                  id="lap"
                  type="number"
                  min="1"
                  value={this.state.data.lap}
                  style={{ width: 50 }}
                  onChange={this.handleLap.bind(this)}
                />
                <div style={{ margin: "auto auto auto 5px" }}>周目</div>
              </Row>
            </ColHalf>
          </Row>
          <Row>
            <ColHalf>{players}</ColHalf>
            <ColHalf>
              {boss}
              <Bottom>
                <Col>
                  <div>凸タイプ：</div>
                  <select
                    value={this.state.data.type}
                    onChange={e => {
                      copy.type = e.target.value;
                      this.setState({ data: copy });
                    }}
                  >
                    <option>通常</option>
                    <option>持ち越し</option>
                    <option>ラスアタ</option>
                  </select>
                </Col>
              </Bottom>
              <Row>
                <Col>
                  <div>総ダメージ：</div>
                  <End>{this.state.data.total}</End>
                </Col>
              </Row>
            </ColHalf>
          </Row>
        </Col>
        <IconModal
          show={this.state.modalShow}
          onHide={this.modalClose.bind(this)}
          list={this.state.selected < 5 ? this.props.icon : this.props.bossicon}
          num={this.state.selected}
          id={
            this.state.selected < 5
              ? this.state.data.character[this.state.selected].id
              : this.state.data.boss.id
          }
          self={this}
          isform="false"
          size="sm"
        />
      </Wrapper>
    );
  }
}
const Row = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
`;
const Wrapper = styled(Row)`
  min-width: 200px;
`;
const Col = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
const ColHalf = styled(Col)`
  padding-left: 5%;
  width: 50%;
`;
const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 10px;
  &:hover {
    cursor: pointer;
  }
`;
const Small = styled.div`
  font-size: 12px;
  width: 100%;
`;
const End = styled.div`
  text-align: end;
  width: 100%;
  padding-right: 10px;
  font-weight: bold;
`;
const Bottom = styled(Row)`
  margin: auto 0 0 0;
`;
const Img = styled.img`
  border-radius: 10px;
  transform: scale(0.5, 0.5) translate(-50%, -50%);
`;
export default ReportEdit;
