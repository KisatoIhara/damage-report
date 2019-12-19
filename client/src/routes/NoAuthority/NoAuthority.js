import React, { Component } from "react";
import Header from "../../components/Header";
import { All } from "../../components/Style/Wrapper";

class NoAuthority extends Component {
  render() {
    return (
      <All>
        <Header title="ダメレポ投稿所" />
        <div>権限がないため利用できません。</div>
      </All>
    );
  }
}

export default NoAuthority;