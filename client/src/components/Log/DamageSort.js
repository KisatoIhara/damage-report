import React from "react";
import _ from "lodash";

const DamageSort = props => {
  let data = _.orderBy(props.data, "total", "desc");
  if (props.boss !== null) {
    data = _.filter(data, obj => obj.boss.id === props.boss);
  }
  return (
    <>
      {data.map(obj => {
        return props.reportContent(obj, props.isCran, obj.docId);
      })}
    </>
  );
};

export default DamageSort;
