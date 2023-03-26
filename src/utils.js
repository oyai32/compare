const fs = require('fs');
const util = require('util');
const path = require('path');
const _ = require('lodash');

/**
 * 写文件
 * @param {string} content 内容
 * @param {string} fileName 文件名
 * @param {string} dirname 文件路径
 */
function writeFile(content, fileName, dirname) {
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }

  const jsonFilePath = path.join(dirname, fileName);
  fs.writeFileSync(jsonFilePath, content);
}

/**
 * 获取目录下所有文件名
 * @param {string} folderPath 目录路径
 * @returns {Array} 文件名的数组
 */
async function getFileNamesByFolder(folderPath) {
  // 读取指定路径下的所有文件
  var readdir = util.promisify(fs.readdir);
  const files = await readdir(folderPath);
  return files;
}

/**
 * 递归地展开一个嵌套的对象，并将所有的键路径平铺到一个数组中
 */
function getKeyPaths(data) {
  return _.uniq(
    _.flatMapDeep(data, (value, key) => {
      if (_.isPlainObject(value)) {
        return _.map(value, (subValue, subKey) => {
          return `${key}.${subKey}`;
        });
      } else {
        return key;
      }
    })
  );
}

/**
 * 读取 js/json 文件内容
 * @param {string} filePath 文件路径
 * @returns {Object} 文件内容
 */
function getFileContent(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.js') {
    // 返回 js 文件中 export default 的内容
    return require(filePath).default;
  }
  if (ext === '.json') {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }
}

/**
 * 比较两份数据
 * @param {Object} AData
 * @param {Object} BData
 * @returns A 中存在但 B 中不存在的 keyPath 的数组
 */
function getNotExistKeyPath(AData, BData) {
  const AKeyPaths = getKeyPaths(AData);
  const BKeyPaths = getKeyPaths(BData);
  return _.difference(AKeyPaths, BKeyPaths);
}

module.exports = {
  writeFile,
  getFileContent,
  getNotExistKeyPath,
  getFileNamesByFolder,
};
