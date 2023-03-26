## 项目说明
本工具使用 node 开发，主要功能为：
+ 将 `.js` 文件转为 `.json` 文件
+ 比较中英文文件
+ 翻译缺失的英文


## 安装依赖

```bash
yarn install
```

## 功能一：将 .js 文件转为 .json 文件

**功能文件**
- src/toJson.js

**执行命令**

```bash
# 在根目录下执行
yarn json
```
**使用说明**

当前以 `example/zh_CN` 下的文件作为输入，可直接执行命令查看示例结果。

若您的文件与 `example/zh_CN/messages.js` 的格式相同，可将 `src/toJson.js` 中的 `inputFolder` 改为您的文件路径。

若格式不同，需自行修改 `src/toJson.js` 相关逻辑。

**运行效果**

生成 json 文件夹，将指定目录下所有 `.js` 文件中 `export default` 的内容，输出到相同名称的 `.json` 文件中

## 功能二：比较中英文文件
> **功能文件**
- src/compare-file.js

**执行命令**

```bash
# 在根目录下执行
yarn compare
```
**使用说明**

当前以 `example/zh_CN` 和 `example/en_US` 下的文件作为输入，支持 `.js` 和 `.json` 文件，可直接执行命令查看示例结果。

若您的文件结构与 `example` 目录下的相同，可将 `src/compare-file.js` 中的 `zhFolder` 和 `enFolder` 改为您的文件路径。

若格式不同，可修改 `src/compare-file.js` 中的 `getMyFilenames()`，获取您的所有中/英文文件名，并将 `zhFolder` 和 `enFolder` 改为您的文件路径。

**执行效果**

控制台输出所有在 `zhFolder` 目录下存在但在 `enFolder` 目录下不存在的 key 的路径，如：`{"common.json":["postAudit.behavior","postAudit.url"],"messages.js":["appActivity","postAudit.contentKeywordsTip"]}`

## 功能三：翻译缺失的英文

**功能文件**
- src/translate.js

**执行命令**

```bash
# 在根目录下执行
yarn compare
```
**使用说明**
> 本工具使用的百度翻译 API，请提前申请 http://api.fanyi.baidu.com/manage/developer

翻译前需修改 `src/translate.js` 中对应的 `APP_ID` 和 `APP_SECRET`。

若想跳过文件比较直接翻译，可以自行调用 `translate.js` 中相关翻译方法。

若需要补全「中文文件中存在但在英文文件中不存在」的 key 的英文，需要先参考功能二的使用说明。

**运行效果**

输出缺失的字段后，自动调用百度翻译 API 进行翻译。翻译完毕后，将在 `translation_result` 目录下输出相同名称的 `.json` 文件

> 百度翻译 API 个人免费版不能频繁调用，故每 3s 调用一次，失败后自动重试。
