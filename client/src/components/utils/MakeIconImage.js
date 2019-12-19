import React from "react"
import LabelList from "../../label/LabelList";
import SortList from "../../label/SortList";
import CharactersImage from "../../img/characters.jpg";
import BossLabelList from "../../label/BossLabelList";
import BossImageObj from "./BossImageObj.js"

var labelList
var sortList
var image

export function makeIconImage(isBoss, large, ym) {
  if(isBoss){
    labelList = BossLabelList[ym]
    sortList = BossLabelList[ym]
    image = BossImageObj[ym]
  }else{
    labelList = LabelList
    sortList = SortList
    image = CharactersImage
  }
  let offset = isBoss ? 1 : 2;
  let iconList = [];
  let col = 0;
  let row = 0;
  for (let i = 0; i < labelList.length; i++) {
    let sortId = sortList.indexOf(labelList[i]);
    if (i === 8 * (col + 1)) {
      col++;
      row = 0;
    }
    let window = React.createElement("div", {
      style: {
        width: "76px",
        height: "76px",
        backgroundImage: `url(${image})`,
        backgroundPosition: `${-76 * (row * offset)}px ${-76 * col}px`,
        borderRadius: "10px",
        transform: large ? "" : "scale(0.5, 0.5) translate(-50%, -50%)",
        border: "1px solid black"
      },
      sortid: sortId,
      characterid: i,
      title: labelList[i]
    });
    iconList[i] = window;
    row++;
  }
  return iconList;
}