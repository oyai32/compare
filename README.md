## 项目说明
本项目开发语言为 node，主要功能为：
+ 将 .js 文件转为 .json 文件
+ 比较中英文文件
+ 翻译缺失的英文
> 当前代码里使用的是 example 目录里的示例文件。可在对应功能的 .js 文件中配置自己的文件地址。

## 初次使用

```bash
yarn install
```

## 功能一：将 .js 文件转为 .json 文件

**功能文件：**
- src/toJson.js

**执行命令：**

```bash
# 在根目录下执行
yarn json
```

**效果：**

生成 json 文件夹，将 zh_CN 目录下所有 .js 文件中 export default 的内容，输出到相同名称的 .json 文件中

## 功能二：比较中英文文件

> 支持 .json/.js
> **功能文件：**
- src/compare-file.js

**执行命令：**

```bash
# 在根目录下执行
yarn compare
```

**效果：**
控制台输出所有在 zh_CN 目录下存在但在 en_US 目录下不存在的 key 的路径，如：`{"common.json":["appDetails","postAudit.behavior","postAudit.url","postAudit.contentKeywordsTip"],"messages.js":["appActivity","postAudit.contentKeywordsTip","emailAudit.traffic"]}`

## 功能三：翻译缺失的英文

> 本工具使用的百度翻译 API，请提前申请 http://api.fanyi.baidu.com/manage/developer

**功能文件：**
- src/translate.js
- src/compare-file.js

```js
// 配置 APP_ID 和 APP_SECRET
const APP_ID = '';
const APP_SECRET = '';
```

```bash
# 在根目录下执行
yarn compare
```

**效果：**
输出缺失的字段后，自动调用百度翻译 API 进行翻译。翻译完毕后，将在 translation_result 目录下输出相同名称的 .json 文件

> 百度翻译 API 个人免费版不能频繁调用，故每 3s 调用一次，失败后自动重试。
