import React, { Component } from "react";
import styled from "styled-components";
import { Modal, Button } from "react-bootstrap";

class IconModal extends Component {
  handleSelect(id, name) {
    if (this.props.isform === "true") {
      if (this.props.num < 5) {
        let idList = [...this.props.self.state.id];
        let nameList = [...this.props.self.state.name];
        if (idList[this.props.num] === id) {
          idList[this.props.num] = null;
          nameList[this.props.num] = "未選択";
        } else {
          idList[this.props.num] = id;
          nameList[this.props.num] = name;
        }
        this.props.self.setState({
          id: idList,
          name: nameList
        });
      } else {
        let copy = {...this.props.self.state.boss};
        if (copy.id === id) {
          copy.id = null;
          copy.name = "未選択";
        } else {
          copy.id = id;
          copy.name = name;
        }
        this.props.self.setState({ boss: copy });
      }
    } else {
      var copy = this.props.self.state.data;
      if (this.props.num < 5) {
        if (copy.character[this.props.num].id === id) {
          copy.character[this.props.num].id = null;
          copy.character[this.props.num].name = "未選択";
        } else {
          copy.character[this.props.num].id = id;
          copy.character[this.props.num].name = name;
        }
        this.props.self.setState({
          data: copy
        });
      } else {
        if (copy.boss.id === id) {
          copy.boss.id = null;
          copy.boss.name = "未選択";
        } else {
          copy.boss.id = id;
          copy.boss.name = name;
        }
        this.props.self.setState({ data: copy });
      }
    }
  }

  render() {
    let sortList = [...this.props.list];
    sortList.sort((a, b) => {
      return a.props.sortid > b.props.sortid ? 1 : -1;
    });
    const Palette = sortList.map((icon, i) => {
      return (
        <IconWrapper
          key={i}
          selected={icon.props.characterid === this.props.id}
          onClick={this.handleSelect.bind(
            this,
            icon.props.characterid,
            icon.props.title
          )}
        >
          {icon}
        </IconWrapper>
      );
    });
    return (
      <Modal {...this.props} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            {this.props.num < 5 ? `${this.props.num + 1}人目` : `ボス`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PaletteWrapper>{Palette}</PaletteWrapper>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.onHide}>
            閉じる
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const PaletteWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;
const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  opacity: ${props => (props.selected ? "1" : "0.6")};
  &:hover {
    cursor: pointer;
  }
`;
export default IconModal;
