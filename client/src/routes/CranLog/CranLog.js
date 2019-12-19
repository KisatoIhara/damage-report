import React, { Component } from "react";
import firebase from "../../firebase";
import { All } from "../../components/Style/Wrapper";
import Header from "../../components/Header";
import Log from "../../components/Log/Log";

const db = firebase.firestore();

class CranLog extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    var data = { users: {} };
    db.collection("redias").onSnapshot(
      { includeMetadataChanges: true },
      snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "removed") {
            delete data[change.doc.id];
            //console.log(change.doc.id)
            //console.log(snapshot.metadata.fromCache)
          } else {
            Object.keys(change.doc.data()).forEach(value => {
              let usersData = change.doc.data()[value];
              if (data[change.doc.id] === undefined) {
                data[change.doc.id] = {};
              }
              Object.keys(change.doc.data()[value]).forEach(value => {
                data[change.doc.id][value] = {};
                data[change.doc.id][value] = usersData[value];
              });
            });
            //console.log(change.doc.id, "=>", change.doc.data())
            //console.log(snapshot.metadata.fromCache)
          }
        });
        db.collection("users").onSnapshot(
          { includeMetadataChanges: true },
          snapshot => {
            snapshot.docChanges().forEach(change => {
              if (change.type === "removed") {
                delete data.users[change.doc.id];
              } else {
                data.users[change.doc.id] = change.doc.data();
              }
            });
            this.setState(data);
          }
        );
      }
    );
  }

  render() {
    let keys = Object.keys(this.state);
    var idx = keys.indexOf("users");
    if (idx >= 0) {
      keys.splice(idx, 1);
    }
    return (
      <All>
        <Header title="クランログ" />
        {keys.length ? (
          <Log data={this.state} isAdmin={this.props.isAdmin} isCran={true} />
        ) : (
          <div>データがありません</div>
        )}
        {/*
        <button onClick={() => console.log(this.state)}>test</button>
        */}
      </All>
    );
  }
}

export default CranLog;
