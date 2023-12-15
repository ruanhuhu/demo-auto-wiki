
// 检查 config/index.js 中的配置是否正确
const { check } = require('./checkConfig')
// 将网页内容转换为 markdown
const { html2md } = require('./html2md')
// 下载图片
const { downloadImages } = require('./downloadImages')

const main = async () => {
  try {
    const isConfigCorrect = check()
    if (!isConfigCorrect) {
      return
    }


    html2md()

    const { config } = require('./config/index')
    if (config.website) {
      downloadImages()
    }
  } catch (error) {
    console.log(error)
  }
}

main()