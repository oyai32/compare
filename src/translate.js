const request = require('request');
const querystring = require('querystring');
const crypto = require('crypto');

// 此处清输入自己的 APP_ID 和 APP_SECRET http://api.fanyi.baidu.com/manage/developer 
const APP_ID = '';
const APP_SECRET = '';
const API_URL = 'http://api.fanyi.baidu.com/api/trans/vip/translate';

async function translateStr(text) {
  if(APP_ID ==='' || APP_SECRET ===''){
    return Promise.reject('error：未配置百度翻译 api 信息，无法进行翻译！');
  }

  const from = 'zh';
  const to = 'en';
  const params = {
    q: text,
    from: from,
    to: to,
    appid: APP_ID,
    salt: Math.floor(Math.random() * 10000),
    sign: '',
  };

  // 计算签名
  const signStr = `${APP_ID}${text}${params.salt}${APP_SECRET}`;
  const md5 = crypto.createHash('md5');
  md5.update(signStr);
  const sign = md5.digest('hex');
  params.sign = sign;

  const url = API_URL + '?' + querystring.stringify(params);

  return new Promise(async (resolve, reject) => {
    await promiseTimeout(3000);
    request.get(url, function (err, response, body) {
      if (err) {
        return reject(err);
      }
      const result = JSON.parse(body);
      if (result && result.trans_result && result.trans_result[0]) {
        const { dst } = result.trans_result[0];
        console.log(`${text}:${dst}`);
        return resolve(dst);
      }
      return reject(result);
    });
  }).catch(async (err) => {
    console.log(`${err}\n 正在重试：${text}`);
    return translateStr(text);
  });
}

function promiseTimeout(ms, throwOnTimeout = false, reason = 'Timeout') {
  return new Promise((resolve, reject) => {
    if (throwOnTimeout) setTimeout(() => reject(reason), ms);
    else setTimeout(resolve, ms);
  });
}

/**
 * 对数组进行翻译
 * @param {Array} arr 
 * @returns 
 * 示例：translateArr(['你好','大家好']);
 */
async function translateArr(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(await translateStr(arr[i]));
  }
  return result;
}

/**
 * 对对象进行翻译
 * @param {Object} obj 
 * @returns 
 * 示例：translateArr({'first':'你好'});
 */
async function translateObj(obj) {
  const result = {};
  for (let key in obj) {
    result[key] = await translateStr(obj[key])
  }
  return result;
}

module.exports = { translateStr, translateArr, translateObj };
