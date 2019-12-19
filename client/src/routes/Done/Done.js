import React, { Component } from "react";
import styled from "styled-components";
import { Redirect, withRouter } from "react-router-dom";
import { All } from "../../components/Style/Wrapper";
import Header from "../../components/Header";
import ReportView from "../../components/ReportView";
import { makeIconImage } from "../../components/utils/MakeIconImage";

import * as routes from "../../constants/routes";
import { Button } from "react-bootstrap";
import DateFormat from "../../components/utils/DateFormat";

class Done extends Component {
  render() {
    if (this.props.location.state) {
      let date = new Date();
      if (date.getHours() <= 4) {
        date.setDate(date.getDate() - 1);
      }
      let iconList = makeIconImage(false, false);
      let bossiconList = makeIconImage(true, false, DateFormat(date, "yyyyMM"));
      let data = this.props.location.state;
      return (
        <All>
          <Header title="本戦入力フォーム" />
          <Complete>投稿完了</Complete>
          <Text>以下の内容で投稿完了しました。</Text>
          <ReportWrapper>
            <ReportView
              data={data.dataObj}
              icon={iconList}
              bossicon={bossiconList}
            />
          </ReportWrapper>
          <StyledButton href={routes.INPUT}>続けて入力する</StyledButton>
          <Wrapper>
            <LeftButton href={routes.MY}>マイログへ</LeftButton>
            <RightButton href={routes.CRAN}>クランログへ</RightButton>
          </Wrapper>
        </All>
      );
    } else {
      return <Redirect to={routes.INPUT} />;
    }
  }
}
const Complete = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 20px 0;
`;
const Text = styled.div`
  width: 90%;
  text-align: center;
  margin-bottom: 10px;
`;
const ReportWrapper = styled.div`
  width: 90%;
  min-width: 200px;
  max-width: 400px;
  padding: 10px;
  border: 2px solid blue;
  margin-bottom: 10px;
`;
const Wrapper = styled.div`
  display: flex;
  width: 90%;
  max-width: 400px;
`;
const StyledButton = styled(Button)`
  margin: 5px 0;
  width: 90%;
  max-width: 400px;
`;
const LeftButton = styled(StyledButton)`
  margin: 0 2.5px 0 0;
`;
const RightButton = styled(StyledButton)`
  margin: 0 0 0 2.5px;
`;
export default withRouter(Done);
