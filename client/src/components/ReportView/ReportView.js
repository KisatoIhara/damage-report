import React, { Component } from "react";
import styled from "styled-components";

class ReportView extends Component {
  render() {
    let data = this.props.data;
    let icon = this.props.icon;
    //console.log(icon)
    const players = data.character.map((pc, i) => {
      return (
        <Row key={i}>
          <IconWrapper>{icon[pc.id]}</IconWrapper>
          <Col>
            <Small>{pc.name}</Small>
            <End>{pc.damage}</End>
          </Col>
        </Row>
      );
    });
    const boss = (
      <Row>
        <IconWrapper>{this.props.bossicon[data.boss.id]}</IconWrapper>
        <Col>
          <Small>{data.boss.name}</Small>
          <End>{data.boss.damage}</End>
        </Col>
      </Row>
    );
    return (
      <Wrapper>
        <Col>
          <Name>{this.props.name}</Name>
          <Row>
            <ColHalf>{data.date}</ColHalf>
            <ColHalf>{data.lap}周目</ColHalf>
          </Row>
          <Row>
            <ColHalf>{players}</ColHalf>
            <ColHalf>
              {boss}
              <Bottom>
                <Col>
                  <div>凸タイプ：</div>
                  <Type>{data.type}</Type>
                </Col>
              </Bottom>
              <Row>
                <Col>
                  <div>総ダメージ：</div>
                  <End>{data.total}</End>
                </Col>
              </Row>
            </ColHalf>
          </Row>
        </Col>
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
const Name = styled.div`
  padding-left: 5%;
`
const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 10px;
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
const Type = styled(End)`
  font-weight: normal;
`;
const Bottom = styled(Row)`
  margin: auto 0 0 0;
`;
export default ReportView;
