/**
 * 将 js 文件中 export default 的内容以 json 文件的形式输出到 json 目录下
 */
require('babel-register')({ presets: ['env'] });
const path = require('path');
const { writeFile, getFilenamesByFolder } = require('./utils');

// js 文件存放的目录，可自行替换，如 'const inputFolder = D:\\workspace\\locale\\zh_CN';
const inputFolder = path.join(__dirname, '../example/zh_CN');
// 输出文件夹的路径
const outputFolder = path.join(__dirname, '../json');
// 需排除的文件名
const excludeArr = [];

/**
 * 获取所有需要被处理的文件名
 * @param {string} folderPath 目录路径
 * @returns {Array} 文件名的数组
 */
async function getFilenames(folderPath) {
  // 读取指定路径下的所有文件名
  const filenames = await getFilenamesByFolder(folderPath);

  return filenames.filter(
    (filename) =>
      path.extname(filename).toLowerCase() === '.js' &&
      !excludeArr.includes(filename)
  );
}

async function start() {
  const filenames = await getFilenames(inputFolder);
  filenames.forEach((filename) => {
    const filePath = path.join(inputFolder, filename);
    // 获取文件中 export default 的内容
    const data = require(filePath).default;
    const jsonText = JSON.stringify(data, null, 2);
    writeFile(jsonText, filename.replace('.js', '.json'), outputFolder);
  });
  console.log(`执行完毕，输出目录 ${outputFolder}`);
}

start();
