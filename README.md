### 使用说明
1. 配置信息（config/index.js）
3. 运行 `node index.js`
3. 将生成的 markdown (dist/content.md)，拷贝到知识库文章编辑器上
4. 使用 extension-gdn-wiki-upload-images 插件在 chrome 浏览器上批量上传图片文件，images/4/config.document_id 目录下的图片
  - 打开 chrome://extensions/
  - 开启右上角【开发者模式】
  - 点击左上角【加载已解压的扩展程序】，选择 extension-gdn-wiki-upload-images 所在的目录

### 首次运行
- 安装依赖，运行 `PUPPETEER_SKIP_DOWNLOAD=true npm install`
- 下载[最新 chromium](https://download-chromium.appspot.com/)，并解压，在 config/index.js 下指定 puppeteer.executablePath 字段，`[解压文件路径]/Chromium.app/Contents/MacOS/Chromium`

### 输出结果
1. 生成的 markdown 保存在 dist/content.md 文件中 
2. 需要下载的图片列表信息保存在 dist/images.json 文件中
3. 未下载成功的图片列表信息保存在 dist/undownload_images.json 文件中
4. 下载的图片文件保存在 images/4/${config.document_id} 目录下

### 其他建议
安装vscode插件：[markdown-preview-enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced) （可预览最终输出的markdown文件）


