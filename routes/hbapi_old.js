import axios from 'axios'
var crypto = require('crypto')
var cryptojs = require('crypto-js')
var express = require('express');
var router = express.Router();

let sha256 = crypto.createHash('sha256')
sha256.update(new Buffer('zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn', 'utf8'))
let key1 = sha256.digest('hex');
let key = cryptojs.enc.Utf8.parse(key1)

let sha2 = require('crypto-js/sha256')
console.log(sha2('zG2nSeEfSHfvTCHy5LCcqtBbQehKNLXn').toString())
console.log(key1)

function decrypt(data, key) {
    data = new Buffer(data, 'base64') .toString('utf-8')
    data = cryptojs.enc.Utf8.parse(data)
    console.log('data', data)
    let z16 = '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0';
    let iv = cryptojs.enc.Utf8.parse(z16);
    let decrypted = cryptojs.AES.decrypt(data, key, {
        iv,
        mode: cryptojs.mode.CBC,
        padding: cryptojs.pad.Pkcs7
    });
    let string = decrypted.toString();
    console.log('result', decrypted)
    return string
    // let cipher = crypto.createCipheriv('aes-128-cbc', key, iv)
    // cipher.setAutoPadding(true)
    // cipherChunks.push(cipher.update(data, 'utf8', 'base64'))
    // cipherChunks.push(cipher.final('base64'))
    // return cipherChunks.join('')
}

/* GET home page. */
router.get('/*', function (req, res, next) {
    let baseUrl = 'https://app.hbooker.com';
    let url = `${baseUrl}${req.url}`;
    axios.get(url, {
        headers: {
            'User-Agent': 'Android',
            'Host': 'app.hbooker.com',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
        }
    }).then(
        (hbRes) => {
            let raw = hbRes.data;
            console.log(raw)
            let data = decrypt(raw, key)
            res.send(data)
        },
        error => {
            res.status(error.response.status).send(error.response.data)
        }
    )
});

module.exports = router;
