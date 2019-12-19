import React, { Component } from "react";
import styled from "styled-components";
import {
  Tabs,
  Tab,
  Dropdown,
  DropdownButton,
  ButtonGroup,
  Badge,
  Button
} from "react-bootstrap";
import { makeIconImage } from "../utils/MakeIconImage";
import ReportModal from "./ReportModal";
import Holder from "../../img/holder.svg";
import _ from "lodash";
import moment from "moment";

import * as routes from "../../constants/routes";

import Filter from "./Filter";
import DamageSort from "./DamageSort";

var month = [];
var sort = ["時系列順", "ダメージ順"];

class Log extends Component {
  constructor(props) {
    super(props);
    const users = this.props.data.users;
    let keys = Object.keys(this.props.data);
    //console.log(this.props.data);
    //console.log(keys);

    var idx = keys.indexOf("users");
    if (idx >= 0) {
      keys.splice(idx, 1);
    }
    function compareFunc(a, b) {
      return b - a;
    }
    keys.sort(compareFunc);
    keys.forEach(value => {
      let op = value.slice(0, 4) + "年" + value.slice(4, 7) + "月";
      month.push(op);
    });
    this.state = {
      user: users,
      bossIcon: keys.length ? makeIconImage(true, false, keys[0]) : null,
      characterIcon: makeIconImage(false, false),
      key: keys,
      month: 0,
      sort: 0,
      refine: 0,
      modalShow: false,
      data: null,
      isEdit: false,
      filterModal: false,
      filter: {
        stage3: false,
        stage2: false,
        stage1: false,
        normal: false,
        over: false,
        last: false
      }
    };
    this.closeFilter = this.closeFilter.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.month !== this.state.month) {
      this.setState({
        bossIcon: makeIconImage(true, false, this.state.key[this.state.month])
      });
    }
  }
  CSVDownload(data, userlist) {
    data = _.orderBy(data, "timestamp.seconds", "asc");
    let dataList = data.map(obj => {
      let d = moment(`${obj.date} 12:00:00`);
      let type = obj.type === "ラスアタ" ? "ラストアタック" : obj.type;
      let sort = obj.character.map(value => {
        if (value !== null) {
          let character = this.state.characterIcon[value.id];
          return character;
        } else {
          return null;
        }
      });
      sort = _.orderBy(sort, "props.sortid", "asc");
      let character = '"';
      sort.forEach((obj, i) => {
        if (obj !== undefined) {
          character += obj.props.title;
          character += ", ";
        }
      });
      character = character.slice(0, -2);
      character += '"';

      let arr = [
        d.format("YYYY/MM/DD HH:mm:ss"),
        obj.boss.name,
        obj.lap,
        obj.user,
        type,
        obj.total,
        character
      ];
      return arr;
    });
    let keys = [
      "タイムスタンプ",
      "１．叩いたボスは？",
      "２．何周目？",
      "３．叩いたプレイヤー名は？",
      "４．叩いた状況は？",
      "５．総ダメージは？",
      "６．使用したパーティメンバーを選んでください"
    ];
    let arr = [];
    arr.push(keys);
    dataList.forEach(data => {
      arr.push(data);
    });
    let output = arr.map(line => line.join()).join("\r\n");
    let bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    let blob = new Blob([bom, output], { type: "text/csv" });
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(
        blob,
        `${moment().format("YYYYMMDD_HHmm")}.csv`
      );
      window.navigator.msSaveOrOpenBlob(
        blob,
        `${moment().format("YYYYMMDD_HHmm")}.csv`
      );
    } else {
      document.getElementById("csv-download").href = window.URL.createObjectURL(
        blob
      );
    }
  }

  closeFilter(filter) {
    this.setState({
      filter: filter,
      filterModal: false
    });
  }

  render() {
    //console.log(this.state);
    //console.log(this.props.data)
    let data = this.props.data[this.state.key[this.state.month]];
    let filter = this.state.filter;
    const stage3 = obj => obj.lap >= 11;
    const stage2 = obj => obj.lap < 11 && obj.lap >= 4;
    const stage1 = obj => obj.lap < 4;
    const normal = obj => obj.type === "通常";
    const over = obj => obj.type === "持ち越し";
    const last = obj => obj.type === "ラスアタ";

    if (filter.stage3 || filter.stage2 || filter.stage1) {
      data = _.filter(data, obj => {
        return (
          (filter.stage3 && stage3(obj)) ||
          (filter.stage2 && stage2(obj)) ||
          (filter.stage1 && stage1(obj))
        );
      });
    }
    if (filter.normal || filter.over || filter.last) {
      data = _.filter(data, obj => {
        return (
          (filter.normal && normal(obj)) ||
          (filter.over && over(obj)) ||
          (filter.last && last(obj))
        );
      });
    }

    let copyData = _.cloneDeep(this.state.data);
    let userlist = this.props.data["users"];

    const dropDownItem = (array, type) => {
      return array.map((value, i) => (
        <Dropdown.Item key={i} onSelect={() => this.setState({ [type]: i })}>
          {value}
        </Dropdown.Item>
      ));
    };

    const reportContent = (data, isCran, docId) => {
      let sortCharacter = () => {
        let character = [];
        data.character.forEach(value => {
          character.push(this.state.characterIcon[value.id]);
        });
        return _.orderBy(character, "props.sortid", "desc");
      };
      let level;
      if (data.lap < 4) {
        level = "1";
      } else if (data.lap < 11) {
        level = "2";
      } else {
        level = "3";
      }
      return (
        <ReportContent
          key={docId}
          onClick={() =>
            this.setState({ modalShow: true, data: data, docId: docId })
          }
          type={data.type}
        >
          {isCran ? (
            <Col>
              <UserWrapper>
                <IconWrapper>
                  {userlist[data.user].icon !== null ? (
                    <Icon src={userlist[data.user].icon} />
                  ) : (
                    <Icon src={Holder} />
                  )}
                </IconWrapper>
                <Small>{userlist[data.user].name}</Small>
              </UserWrapper>
            </Col>
          ) : null}
          <Col>
            <BossWrapper>
              <IconWrapper>{this.state.bossIcon[data.boss.id]}</IconWrapper>
              <Small>{data.boss.name}</Small>
              <SmallBadge pill variant="danger">
                {level}段階目
              </SmallBadge>
            </BossWrapper>
          </Col>
          <Col>
            <Row>
              {sortCharacter().map((value, i) => (
                <IconWrapper key={i}>{value}</IconWrapper>
              ))}
            </Row>
            <TotalWrapper>
              <SmallBadge variant="primary">与えたダメージ</SmallBadge>
              <Total>{data.total}</Total>
            </TotalWrapper>
            <TotalWrapper>
              <SmallBadge variant="info">{data.type}</SmallBadge>
              <SmallBadge>{data.date}</SmallBadge>
            </TotalWrapper>
          </Col>
        </ReportContent>
      );
    };

    const lapContent = (obj, isAll) => {
      if (obj.sortLapData.length) {
        if (isAll) {
          return obj.sortLapData.map((lapData, i) => {
            let count = 0;
            lapData.forEach(data => {
              data.forEach(data => {
                if (data.type !== "持ち越し") count++;
              });
            });
            return (
              <div key={i}>
                <LapContent>
                  {obj.lapList[i]}週目<div>{count}凸</div>
                </LapContent>
                {lapData.map(data => {
                  return data.map(data =>
                    reportContent(data, this.props.isCran, data.docId)
                  );
                })}
              </div>
            );
          });
        } else {
          return obj.lapList.map((lap, i) => {
            let count = 0;
            obj.sortLapData.forEach(data => {
              data.forEach(data => {
                if (data.lap === lap && data.type !== "持ち越し") count++;
              });
            });
            return (
              <div key={i}>
                <LapContent>
                  {lap}週目<div>{count}凸</div>
                </LapContent>
                {obj.sortLapData.map(data => {
                  if (_.filter(data, { lap: lap }).length) {
                    return data.map(data =>
                      reportContent(data, this.props.isCran, data.docId)
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            );
          });
        }
      } else {
        return null;
      }
    };

    const lapSort = data => {
      let lapList = [];
      _.forEach(data, (value, key) => {
        value.docId = key;
      });
      _.forEach(_.orderBy(data, "lap", "desc"), value => {
        lapList.push(value.lap);
      });
      lapList = _.uniq(lapList);
      let sortLapData = [];
      let lapData = [];
      lapList.forEach(value => {
        lapData.push(_.filter(data, { lap: value }));
      });
      //console.log(lapData)
      lapData.forEach(everyLapData => {
        let bossArray = [];
        _.orderBy(everyLapData, "boss.id", "desc").forEach(value => {
          bossArray.push(value.boss.id);
        });
        let sortBossData = [];
        let bossData = [];
        _.uniq(bossArray).forEach(value => {
          bossData.push(_.filter(everyLapData, { boss: { id: value } }));
        });
        bossData.forEach(everyBossData => {
          let temp = [];
          temp.push(_.filter(everyBossData, { type: "ラスアタ" }));
          temp.push(_.filter(everyBossData, { type: "通常" }));
          temp.push(_.filter(everyBossData, { type: "持ち越し" }));
          temp.forEach(value => {
            if (value.length) {
              sortBossData.push(value);
            }
          });
        });
        sortLapData.push(sortBossData);
      });
      return { sortLapData, lapList };
    };

    const bossSort = (data, i) => {
      _.forEach(data, (value, key) => {
        value.docId = key;
      });
      let bossData = _.orderBy(
        _.filter(data, { boss: { id: i } }),
        "lap",
        "desc"
      );
      let lapList = [];
      _.forEach(bossData, value => {
        lapList.push(value.lap);
      });
      lapList = _.uniq(lapList);
      let sortLapData = [];
      let lapData = [];
      lapList.forEach(value => {
        lapData.push(_.filter(bossData, { lap: value }));
      });
      lapData.forEach(everyLapData => {
        let temp = [];
        temp.push(_.filter(everyLapData, { type: "ラスアタ" }));
        temp.push(_.filter(everyLapData, { type: "通常" }));
        temp.push(_.filter(everyLapData, { type: "持ち越し" }));
        temp.forEach(value => {
          if (value.length) {
            sortLapData.push(value);
          }
        });
      });
      return { sortLapData, lapList };
    };

    if (data !== undefined && userlist !== undefined) {
      //console.log(this.state.data);
      return (
        <Wrapper>
          <ButtonGroup size="sm" style={{ marginBottom: 10 }}>
            <DropdownButton
              as={ButtonGroup}
              title={month[this.state.month]}
              variant="info"
            >
              {dropDownItem(month, "month")}
            </DropdownButton>
            <DropdownButton
              as={ButtonGroup}
              title={sort[this.state.sort]}
              variant="info"
            >
              {dropDownItem(sort, "sort")}
            </DropdownButton>
            <Button
              variant="info"
              onClick={() => this.setState({ filterModal: true })}
            >
              絞り込み
            </Button>
          </ButtonGroup>
          {this.props.isAdmin && this.props.isCran && (
            <ButtonWrapper>
              <a
                id="csv-download"
                href={routes.CRAN}
                onClick={() => this.CSVDownload(data, userlist)}
                download={`${month[this.state.month]}ダメージレポート.csv`}
              >
                CSVダウンロード
              </a>
            </ButtonWrapper>
          )}
          <Tabs defaultActiveKey="all" id="controlled">
            <Tab eventKey="all" title="一覧">
              {this.state.sort === 0 ? (
                lapContent(lapSort(data), true)
              ) : (
                <DamageSort
                  key={data.docId}
                  data={data}
                  boss={null}
                  reportContent={reportContent}
                  isCran={this.props.isCran}
                />
              )}
            </Tab>
            {[...Array(5)].map((_, i) => (
              <Tab eventKey={i} title={i + 1} key={i}>
                {this.state.sort === 0 ? (
                  lapContent(bossSort(data, i), false)
                ) : (
                  <DamageSort
                    data={data}
                    boss={i}
                    reportContent={reportContent}
                    isCran={this.props.isCran}
                  />
                )}
              </Tab>
            ))}
          </Tabs>
          <ReportModal
            show={this.state.modalShow}
            alldata={this.props.data}
            data={copyData}
            docid={this.state.docId}
            ym={this.state.key[this.state.month]}
            icon={this.state.characterIcon}
            bossicon={this.state.bossIcon}
            isadmin={this.props.isAdmin}
            self={this}
          />
          <Filter show={this.state.filterModal} close={this.closeFilter} />
        </Wrapper>
      );
    } else {
      return (
        <Wrapper>
          <ButtonGroup size="sm" style={{ marginBottom: 10 }}>
            <DropdownButton
              as={ButtonGroup}
              title={month[this.state.month]}
              variant="info"
            >
              {dropDownItem(month, "month")}
            </DropdownButton>
            <DropdownButton
              as={ButtonGroup}
              title={sort[this.state.sort]}
              variant="info"
            >
              {dropDownItem(sort, "sort")}
            </DropdownButton>
            <Button
              variant="info"
              onClick={() => this.setState({ filterModal: true })}
            >
              絞り込み
            </Button>
          </ButtonGroup>
          <div>{month[this.state.month]}のデータがありません</div>
          <Filter show={this.state.filterModal} close={this.closeFilter} />
        </Wrapper>
      );
    }
  }
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-bottom: 50px;
`;
const Col = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
`;
const LapContent = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-weight: bold;
  padding: 0 20px;
`;
const ReportContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid black;
  background: white;
  margin: 10px;
  box-shadow: 2px 2px 2px #cbcbdc;
  &:hover {
    box-shadow: none;
    transform: translate3d(0, 1px, 0);
    cursor: pointer;
  }
  background: ${props => {
    let color = null;
    switch (props.type) {
      case "持ち越し":
        color = "#cfe2f3";
        break;
      case "通常":
        color = "#fff2cc";
        break;
      case "ラスアタ":
        color = "#f4cccc";
        break;
      default:
        break;
    }
    return color;
  }};
`;
const UserWrapper = styled.div`
  width: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const BossWrapper = styled(UserWrapper)`
  width: 60px;
  justify-content: space-between;
`;
const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  margin: 0 auto;
`;
const Icon = styled.img`
  width: 40px;
`;
const SmallBadge = styled(Badge)`
  font-size: 10px;
  line-height: 14px;
`;
const Small = styled.div`
  font-size: 10px;
  font-weight: bold;
  text-align: center;
`;
const TotalWrapper = styled(Row)`
  justify-content: space-between;
  margin: 1px 0;
`;
const Total = styled.div`
  width: 100%;
  font-size: 14px;
  text-align: end;
  font-weight: bold;
  border-bottom: 1px dashed #007bff;
`;
const ButtonWrapper = styled.div`
  width: 100%;
  padding-bottom: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export default Log;
