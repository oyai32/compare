/**
 * 比对指定目录下的中英文文件
 * 获取英文文件中缺少的 key 的 path
 */
require('babel-register')({ presets: ['env'] });
const path = require('path');
const _ = require('lodash');
const {
  writeFile,
  getFileContent,
  getNotExistKeyPath,
  getFilenamesByFolder,
} = require('./utils');
const { translateObj } = require('./translate');

// 中文文件存放的目录，可自行替换，如 'const zhFolder = D:\\workspace\\locale\\zh_CN';
const zhFolder = path.join(__dirname, '../example/zh_CN');
// 英文文文件存放的目录，可自行替换，如 'const zhFolder = D:\\workspace\\locale\\en_US';
const enFolder = path.join(__dirname, '../example/en_US');
// 英文文文件存放的目录
const resultFolder = path.join(__dirname, '../translation_result');
// 需排除的文件
const excludeArr = [];

/**
 * 获取所有需要被处理的文件名
 * @param {string} folderPath 目录路径
 * @returns {Array} 文件名的数组
 */
async function getFilenames(folderPath) {
  // 读取指定路径下的所有文件名
  const filenames = await getFilenamesByFolder(folderPath);

  return filenames.filter((filename) => !excludeArr.includes(filename));
}

/**
 * 对比中英文目录下名称相同的两份文件
 * @param {string} filename
 * @returns 中文文件中存在但英文文件中不存在的 keyPath 的数组
 */
function getMissedFieldsFromFile(filename) {
  const zhFolderPath = path.join(zhFolder, filename);
  const zhData = getFileContent(zhFolderPath);
  const enFolderPath = path.join(enFolder, filename);
  const enData = getFileContent(enFolderPath);
  return getNotExistKeyPath(zhData, enData);
}

/**
 * 获取所有中、英文文件名
 */
async function getMyFilenames() {
  // 所有中文文件名
  const zhFilenames = await getFilenames(zhFolder);
  // 所有英文文件名
  const ehFilenames = await getFilenames(enFolder);
  return { zhFilenames, ehFilenames };
}

/**
 * 获取所有缺失的字段
 * @returns {Object} key 文件名，value 该英文件中缺失字段的 keyPath
 */
async function getAllMissedFilds() {
  // 所有中、英文文件名
  const { zhFilenames, ehFilenames } = await getMyFilenames();
  const result = {};

  for (let i = 0; i < zhFilenames.length; i++) {
    const filename = zhFilenames[i];
    if (!ehFilenames.includes(filename)) {
      console.log(`【!注意!】${enFolder} 中没有对应的 ${filename}`);
      continue;
    }
    const arr = getMissedFieldsFromFile(filename);
    if (arr.length > 0) {
      result[filename] = arr;
    } else {
      console.log(`【!恭喜!】${filename} 无缺失字段\n`);
    }
  }
  return result;
}

/**
 * 翻译中文文件中缺失的字段
 * @param {string} filename 文件名
 * @param {Array} missedfileds 缺失字段的 keyPath
 * @returns {key: 缺失字段的 keyPath,value: 英文} 翻译好的英文
 */
async function translate(filename, missedfileds) {
  // 拿到中文文件的内容
  const zhFolderPath = path.join(zhFolder, filename);
  const data = getFileContent(zhFolderPath);
  // 获取每个字段的中文值
  const zhObj = {};
  missedfileds.forEach((keyPath) => {
    zhObj[keyPath] = _.get(data, keyPath);
  });
  // 翻译出每个字段的英文值
  const result = await translateObj(zhObj);
  return result;
}

/**
 * 补充英文翻译并生成新的英文 json 文件
 * @param {string} filename 文件名
 * @param {key: 缺失字段的 keyPath,value: 英文} 翻译好的英文
 * @param {string} folderPath 输出文件路径
 */
function createEnFile(filename, obj, folderPath) {
  // 拿到英文文件的内容
  const enFolderPath = path.join(enFolder, filename);
  const data = getFileContent(enFolderPath);
  for (let keyPath in obj) {
    _.set(data, keyPath, obj[keyPath]);
  }
  let newFilename = filename;
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.js') {
    newFilename = filename.replace('.js', '.json');
  }
  writeFile(
    JSON.stringify(data, null, 2),
    newFilename,
    folderPath
  );
}

async function start() {
  const allMissedFilds = await getAllMissedFilds();
  console.log(`缺失字段如下：\n${JSON.stringify(allMissedFilds)}\n`);

  for (const filename in allMissedFilds) {
    const missedfileds = allMissedFilds[filename];
    // 拿到该文件翻译后的结果
    console.log(`🚀 开始对 ${filename} 中缺失字段的值进行翻译\n`);
    try {
      const result = await translate(filename, missedfileds);
      console.log(`\n-------${filename} 翻译完毕！-------\n`);
      console.log(`🚀 开始写入文件\n`);
      // 将结果写入英文文件中
      createEnFile(filename, result, resultFolder);
      console.log('-------执行完毕-------\n');
      console.log(`输出目录 ${resultFolder}\n`);
    } catch (err) {
      console.log(err);
      return;
    }
  }
}

start();
