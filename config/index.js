/**
 * 用户配置信息
 */
const config = {
  /**
   * puppeteer 的配置，首次运行配置一次即可
   */
  puppeteer: {
    // puppeteer 的可执行文件路径
    executablePath: './chrome/Chromium.app/Contents/MacOS/Chromium',
    headless: 'new',
    // headless: false,
  },

  /**
   * ! 需要下载图片的网站地址(无需下载图片可不填)
   */
  website: 'https://www.ui.cn/detail/660586.html',

  /**
   * ! document_id，可通过知识库对应文章的页面地址得知
   * 如：http://192.168.29.49:8080/document/index?document_id=1375，其中 1375 就是 document_id
   */
  document_id: '2657',

  /**
   * ! 将需要转成 markdown 的网页内容保存到 config/content.html 文件中
   */
}

/**
 * 获取知识库上传的图片保存路径
 */
const getUploadPath = () => {
  return  `/images/4/${config.document_id}`
}

module.exports = {
  config,
  getUploadPath,
}
