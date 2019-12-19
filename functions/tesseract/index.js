/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const path = require("path");
const os = require("os");
const fs = require("fs");
const Busboy = require("busboy");
const Tesseract = require("tesseract.js");

exports.tesseract = async (req, res) => {
  if (req.method === "POST") {
    const busboy = new Busboy({ headers: req.headers });
    const uploads = {};
    const tmpdir = os.tmpdir();

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const filepath = path.join(tmpdir, filename);
      uploads[fieldname] = filepath;
      file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on("finish", async () => {
      let damageList = [0, 0, 0, 0, 0];
      let total = 0;
      let bossDamage = 0;

      let promises = [];
      let keys = ["/tmp/damage.jpg", "/tmp/bossDamage.jpg"];

      for (let i = 0; i < keys.length; i++) {
        const file = keys[i];
        let p = Tesseract.recognize(fs.readFileSync(file), {
          tessedit_char_whitelist: "0123456789"
        });
        promises.push(p);
        fs.unlinkSync(file);
      }

      await Promise.all(promises)
        .then(result => {
          let count = 0;
          for (let i = 0; i < result[0].lines.length; i += 2) {
            let replaced = result[0].lines[i].text.replace(/ /g, "");
            total += Number(replaced);
            damageList[count] = Number(replaced);
            count++;
          }
          let replaced = result[1].lines[0].text.replace(/ /g, "");
          bossDamage = Number(replaced);
        })
        .catch(err => {
          res.status(400).send(err);
        });

      let data = { damage: damageList, total: total, boss: bossDamage };
      res.status(200).send(data);
    });

    busboy.end(req.rawBody);
  } else {
    res.status(405).end();
  }
};
