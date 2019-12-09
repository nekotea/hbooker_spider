import axios                          from 'axios';
import * as express                   from 'express';
import * as aesjs                     from 'aes-js';
import {createHash, createDecipheriv} from 'crypto';
import * as fs                        from 'fs';
import * as path                      from 'path';
import moment                         from "moment";

const router = express.Router();
const key = createHash('sha256')
  .update('zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn', 'utf8')
  .digest()
  .toJSON()
  .data;
const iv = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

let dataDirPath = path.join(__dirname, '../data');

function decrypt(data, key) {
  data = Buffer.from(data, 'base64');
  let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv);
  let bytes = aesCbc.decrypt(data);
  let text = aesjs.utils.utf8.fromBytes(bytes);
  let jsonText = text.slice(0, text.lastIndexOf('}') + 1);
  return JSON.parse(jsonText);
}

/* GET home page. */
router.get('/*', function (req, res, next) {
  let baseUrl = 'https://app.hbooker.com';
  let url = `${baseUrl}${req.url}`;
  console.log('url:', url);
  axios.get(url, {
    headers: {
      'User-Agent'     : 'Android',
      'Host'           : 'app.hbooker.com',
      'Connection'     : 'Keep-Alive',
      'Accept-Encoding': 'gzip',
    },
  }).then(
    (hbRes) => {
      let raw = hbRes.data;
      let data = decrypt(raw, key);
      const {page, count} = req.query;
      let fileName = path.join(dataDirPath, req.path.slice(1).replace(/\//g, '#') + '####' + `page_${page}#count_${count}` + '####' + moment().format('YYYY-MM-DD_HH-mm-ss') + '.json');
      fs.writeFile(fileName, JSON.stringify(data), (err) => {
        if (err) console.log(err);
        else console.log('write to ', fileName);
        res.send(data);
      });
    },
    error => {
      res.status(error.response.status).send(error.response.data);
    },
  );
});

module.exports = router;
