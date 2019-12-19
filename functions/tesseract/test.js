const Tesseract = require("tesseract.js");
const { Storage } = require("@google-cloud/storage");

const storage = new Storage();

let damageList = [0, 0, 0, 0, 0];
let total = 0;
let bossDamage = 0;

const test = async folder => {
  const storage = new Storage();
  let list = ["damage", "bossDamage"];
  let gcsPromises = [];

  console.time("promise")
  const getDamage = result => {
    let damagePromises = [];
    result.forEach(data => {
      let p = Tesseract.recognize(data[0], {
        tessedit_char_whitelist: "0123456789"
      });
      damagePromises.push(p);
    });
    return damagePromises;
  };
  list.forEach(file => {
    let p = storage
      .bucket("redias-report.appspot.com")
      .file(`${folder}/${file}.jpg`)
      .download();
    gcsPromises.push(p);
  });
  await Promise.all(gcsPromises).then(async result => {
    await Promise.all(getDamage(result)).then(result => {
      let count = 0;
      for (let i = 0; i < result[0].lines.length; i += 2) {
        let replaced = result[0].lines[i].text.replace(/ /g, "");
        total += Number(replaced);
        damageList[count] = Number(replaced);
        count++;
      }
      let replaced = result[1].lines[0].text.replace(/ /g, "");
      bossDamage = Number(replaced);
    });
  });
  console.log({ damage: damageList, total: total, boss: bossDamage })
  console.timeEnd("promise")
 /*
  console.time("test")
  await storage
    .bucket("redias-report.appspot.com")
    .file(`${folder}/damage.jpg`)
    .download()
    .then(async data => {
      await Tesseract.recognize(data[0], {
        tessedit_char_whitelist: "0123456789"
      }).then(result => {
        let count = 0;
        for (let i = 0; i < result.lines.length; i += 2) {
          let replaced = result.lines[i].text.replace(/ /g, "");
          total += Number(replaced);
          damageList[count] = Number(replaced);
          count++;
        }
        console.log(damageList);
        console.log(total);
      });
    });

  await storage
    .bucket("redias-report.appspot.com")
    .file("test/bossDamage.jpg")
    .download()
    .then(async data => {
      await Tesseract.recognize(data[0], {
        tessedit_char_whitelist: "0123456789"
      }).then(result => {
        let replaced = result.lines[0].text.replace(/ /g, "");
        bossDamage = Number(replaced);
        console.log(bossDamage);
      });
    });

  console.log({ damage: damageList, total: total, boss: bossDamage });
  console.timeEnd("test")
  */
};

test("test");
