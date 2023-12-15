const TurndownService = require('turndown')
const fs = require('fs')
const path = require('path')
const { getUploadPath } = require('./config/index')

const html2md = () => {
  // 读取 content.html 文件
  const turndownService = new TurndownService()
  const html = fs.readFileSync(path.join(__dirname, './config/content.html'), 'utf8')

  // 转换为 markdown
  let markdown = turndownService.turndown(html)


  // 过滤图片列表：![]()，并将图片地址和重命名的文件名，上传后的路径保存到 imgList 中
  const imgReg = /!\[\]\((.+?)\)/g
  const imgList = []  // { url: 'https://img.ui.cn/data/file/1/6/9/4488961.png', filename: '001.png', uploadUrl: '/images/4/1375/001.png' }
  // { url: "https://cdn.fasionchan.com/p/4774f8bdc1e0cea55dcef123282b127b6af31420.png#width=230px", filename: "002.png", uploadUrl: "/images/4/1375/002.png"}
  // { url: "https://cdn.fasionchan.com/coding-fan-wechat-soso.png?x-oss-process=image/resize,w_359", filename: "003.png", uploadUrl: "/images/4/1375/003.png" }
  let imgSrc = null
  const uploadedPath = getUploadPath() // /images/4/1375
  while (imgSrc = imgReg.exec(markdown)) {
    const url = imgSrc[1]
    const imgSrcExt = path.extname(url.split('?')[0])
    // 取消图片后面的参数 #width=230px、?x-oss-process=image/resize,w_359
    let urlWithoutParams = imgSrcExt.split('#')[0]
    urlWithoutParams = urlWithoutParams.split('?')[0]
    const index = imgList.length + 1
    const imgSrcNewName = `${index}`.padStart(3, '0')
    const filename = `${imgSrcNewName}${urlWithoutParams}`

    imgList.push({
      url,
      filename,
      uploadUrl: `${uploadedPath}/${filename}`,
    })
  }

  // 将 markdown 中的图片地址替换为上传后的地址，如：![](https://img.ui.cn/data/file/1/6/9/4488961.png) 替换为 ![](/images/4/1375/001.png)
  imgList.forEach((item, i) => {
    // 查找对应的![]()，并替换为上传后的地址
    const reg = new RegExp(`!\\[\\]\\(${item.url}\\)`, 'g')
    markdown = markdown.replace(reg, `![](${item.uploadUrl})`)
  })

  // 如果 dist 目录不存在则创建
  const dir = './dist'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 将 imgList 保存到 ./dist/images.json 文件中，若文件不存在则创建，若存在则覆盖
  fs.writeFileSync(path.join(__dirname, './dist/images.json'), JSON.stringify(imgList, null, 2), 'utf8')

  // 将 markdown 保存到 ./dist/content.md 文件中，若文件不存在则创建，若存在则覆盖
  fs.writeFileSync(path.join(__dirname, './dist/content.md'), markdown, 'utf8')

  console.log('html转markdown文件成功', `\x1b[32m/dist/content.md\x1b[0m`)
}


module.exports = {
  html2md,
}