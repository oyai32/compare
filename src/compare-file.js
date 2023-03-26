/**
 * 比对指定目录下的中英文文件
 * 获取英文文件中缺少的 key 的 path
 */
require('babel-register')({ presets: ['env'] });
const path = require('path');
const _ = require('lodash');
const { writeFile, getFileContent, getNotExistKeyPath, getFileNamesByFolder } = require('./utils');
const { translateObj } = require('./translate');

// 中文文件存放的目录
const zhFolder = path.join(__dirname, '../example/zh_CN');
// 英文文文件存放的目录
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
async function getFileNames (folderPath) {
  // 读取指定路径下的所有文件名
  const fileNames = await getFileNamesByFolder(folderPath);

  return fileNames.filter((fileName) => !excludeArr.includes(fileName));
}

/**
 * 对比中英文目录下名称相同的两份文件
 * @param {string} fileName
 * @returns 中文文件中存在但英文文件中不存在的 keyPath 的数组
 */
function getMissedFieldsFromFile (fileName) {
  const zhFolderPath = path.join(zhFolder, fileName);
  const zhData = getFileContent(zhFolderPath);
  const enFolderPath = path.join(enFolder, fileName);
  const enData = getFileContent(enFolderPath);
  return getNotExistKeyPath(zhData, enData);
}

/**
 * 获取所有缺失的字段
 * @returns {Object} key 文件名，value 该英文件中缺失字段的 keyPath
 */
async function getAllMissedFilds () {
  // 所有中文文件名
  const zhFileNames = await getFileNames(zhFolder);
  // 所有英文文件名
  const ehFileNames = await getFileNames(enFolder);
  const result = {};

  for (let i = 0; i < zhFileNames.length; i++) {
    const fileName = zhFileNames[i];
    if (!ehFileNames.includes(fileName)) {
      console.log(`【!注意!】${enFolder} 中没有对应的 ${fileName}`);
      continue;
    }
    const arr = getMissedFieldsFromFile(fileName);
    if (arr.length > 0) {
      result[fileName] = arr;
    } else {
      console.log(`【!恭喜!】${fileName} 无缺失字段\n`);
    }
  }
  return result;
}

/**
 * 翻译中文文件中缺失的字段
 * @param {string} fileName 文件名
 * @param {Array} missedfileds 缺失字段的 keyPath
 * @returns {key: 缺失字段的 keyPath,value: 英文} 翻译好的英文 
 */
async function translate (fileName, missedfileds) {
  // 拿到中文文件的内容
  const zhFolderPath = path.join(zhFolder, fileName);
  const data = getFileContent(zhFolderPath);
  // 获取每个字段的中文值
  const zhObj = {};
  missedfileds.forEach(keyPath => {
    zhObj[keyPath] = _.get(data, keyPath);
  });
  // 翻译出每个字段的英文值
  const result = await translateObj(zhObj);
  return result;
}

/**
 * 补充英文翻译并生成新的英文 json 文件
 * @param {string} fileName 文件名
 * @param {key: 缺失字段的 keyPath,value: 英文} 翻译好的英文 
 * @param {string} folderPath 输出文件路径
 */
function createEnFile (fileName, obj, folderPath) {
  // 拿到英文文件的内容
  const enFolderPath = path.join(enFolder, fileName);
  const data = getFileContent(enFolderPath);
  for (let keyPath in obj) {
    _.set(data, keyPath, obj[keyPath]);
  }
  writeFile(
    JSON.stringify(data, null, 2),
    fileName.replace('.js', '.json'),
    folderPath
  );
}


async function start () {
  const allMissedFilds = await getAllMissedFilds();
  console.log(`缺失字段如下：\n${JSON.stringify(allMissedFilds)}\n`);

  for (const fileName in allMissedFilds) {
    const missedfileds = allMissedFilds[fileName];
    // 拿到该文件翻译后的结果
    console.log(`🚀 开始对 ${fileName} 中缺失字段的值进行翻译\n`);
    try {
      const result = await translate(fileName, missedfileds);
      console.log(`\n-------${fileName} 翻译完毕！-------\n`);
      console.log(`🚀 开始写入文件\n`);
      // 将结果写入英文文件中
      createEnFile(fileName, result, resultFolder);
      console.log('-------执行完毕-------\n');
      console.log(`输出目录 ${resultFolder}`);
    } catch (err) {
      console.log(err);
    }
  }
}

start();
