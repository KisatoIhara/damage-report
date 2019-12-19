import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { All, Row, Col } from "../../components/Style/Wrapper";
import { Form, Table, Button, Collapse } from "react-bootstrap";
import Header from "../../components/Header";
import firebase from "../../firebase";
import { makeIconImage } from "../../components/utils/MakeIconImage";
import moment from "moment";
import "moment/locale/ja";
import _ from "lodash";

const db = firebase.firestore();

const Progress = () => {
  moment.locale("ja");
  const today = moment();
  const real = moment(today);
  if (real.hours() <= 4) real.subtract(1, "days");
  const todayStr = real.format("YYYY-MM-DD");
  const month = real.format("YYYYMM");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [data, setData] = useState([]);
  const [daily, setDaily] = useState([]);
  const [user, setUser] = useState(null);
  const [icon] = useState(makeIconImage(false, false));
  const [open, setOpen] = useState([]);

  useEffect(() => {
    db.collection("period").onSnapshot(
      { includeMetadataChanges: true },
      snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.doc.id === month) {
            if (change.doc.data().start !== undefined) {
              setStart(moment(change.doc.data().start.toDate()).add(5, "h"));
            }
            if (change.doc.data().end !== undefined) {
              setEnd(moment(change.doc.data().end.toDate()).endOf("days"));
            }
          }
        });
      }
    );
    db.collection("redias").onSnapshot(
      { includeMetadataChanges: true },
      snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.doc.id === month) {
            let arr = [];
            Object.keys(change.doc.data()).forEach(uid => {
              let userData = Object.keys(change.doc.data()[uid]).map(id => {
                return change.doc.data()[uid][id];
              });
              arr = [...arr, ...userData];
            });
            arr = _.reject(arr, { type: "持ち越し" });
            setData(arr);
            let dailyData = _.filter(arr, { date: todayStr });
            setDaily(dailyData);
          }
        });
      }
    );
    db.collection("users")
      .get()
      .then(querySnapshot => {
        let users = {};
        querySnapshot.forEach(usersDoc => {
          users[usersDoc.id] = usersDoc.data();
        });
        db.collection("status")
          .get()
          .then(querySnapshot => {
            querySnapshot.forEach(statusDoc => {
              users[statusDoc.id] = {
                ...users[statusDoc.id],
                ...statusDoc.data()
              };
            });
            setUser(users);
          });
      });
  }, [month, todayStr]);

  const handleSelect = e => {
    setDaily(_.filter(data, { date: e.target.value }));
  };

  const handleCollapse = id => {
    let copy = [...open];
    if (copy.indexOf(id) >= 0) {
      copy = copy.filter(value => {
        return value !== id;
      });
    } else {
      copy.push(id);
    }
    setOpen(copy);
  };

  return (
    <All>
      <Header title="凸状況" />
      <h3>{`${today.format("M")}月クランバトル`}</h3>
      <h6>
        {start === null || end === null
          ? "まだ"
          : `${start.format("M/D(ddd)")}～${end.format("M/D(ddd)")}`}
      </h6>
      {start !== null && end !== null ? (
        !(today.isSameOrAfter(start) && today.isSameOrBefore(end)) ? (
          <h3>開催期間外</h3>
        ) : (
          daily !== null &&
          user !== null && (
            <Wrapper>
              <Row>
                <Form.Group>
                  <Form.Control as="select" onChange={handleSelect}>
                    {[...Array(today.diff(start, "days") + 1).keys()].map(i => {
                      let date = moment(real);
                      date.subtract(i, "d");
                      return (
                        <option key={i} value={date.format("YYYY-MM-DD")}>
                          {date.format("MM/DD")}
                        </option>
                      );
                    })}
                  </Form.Control>
                </Form.Group>
                <Text>の凸合計：</Text>
                <Sum>{daily.length}/90</Sum>
              </Row>
              <StyleTable bordered striped responsive>
                <thead>
                  <tr>
                    <Th>名前</Th>
                    <Th>
                      <nobr>残凸</nobr>
                    </Th>
                    <Th>使用編成</Th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(user).map(id => {
                    let obj = user[id];
                    let data = _.filter(daily, { user: id });
                    return (
                      <React.Fragment key={id}>
                        {obj.redias && (
                          <tr>
                            <Td>{obj.name}</Td>
                            <Td>{3 - data.length}</Td>
                            <Td>
                              <Collapse in={open.indexOf(id) >= 0}>
                                <div>
                                  {data.map((report, i) => {
                                    let sort = [];
                                    report.character.forEach(character => {
                                      sort.push(icon[character.id]);
                                    });
                                    sort = _.orderBy(
                                      sort,
                                      "props.sortid",
                                      "desc"
                                    );
                                    return (
                                      <IconWrapper key={i}>
                                        {sort.map((icon, i) => {
                                          return <Icon key={i}>{icon}</Icon>;
                                        })}
                                      </IconWrapper>
                                    );
                                  })}
                                </div>
                              </Collapse>
                              {data.length > 0 && (
                                <Button
                                  variant="link"
                                  onClick={() => handleCollapse(id)}
                                >
                                  {open.indexOf(id) >= 0 ? "隠す" : "表示"}
                                </Button>
                              )}
                            </Td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </StyleTable>
            </Wrapper>
          )
        )
      ) : null}
    </All>
  );
};

const Wrapper = styled(Col)`
  width: 80%;
  justify-content: center;
  align-items: center;
`;
const Text = styled.div`
  height: 38px;
  margin-left: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Sum = styled(Text)`
  font-size: 20px;
  font-weight: bold;
`;
const StyleTable = styled(Table)`
  background: white;
`;
const Th = styled.th`
  text-align: center;
`;
const Td = styled.td`
  text-align: center;
`;
const IconWrapper = styled(Row)`
  width: 206px;
  height: 46px;
  border: 1px solid black;
  background: #fff2cc;
  padding: 3px;
  margin: 3px;
  border-radius: 10px;
`;
const Icon = styled.div`
  width: 38px;
  height: 38px;
  margin: 0 auto;
`;

export default Progress;
