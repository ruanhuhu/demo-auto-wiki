const fs = require('fs')
const path = require('path')
const { config } = require('./config/index')

const check = ()=>{
  if (!config.puppeteer) {
    console.error('\x1b[31mconfig.puppeteer 不能为空\x1b[0m')
    return false
  }else if (!config.puppeteer.executablePath) {
    console.error('\x1b[31mconfig.puppeteer.executablePath 不能为空\x1b[0m')
    return false
  }

  if (!config.document_id) {
    console.error('\x1b[31mconfig.document_id 不能为空\x1b[0m')
    return false
  }

  const html = fs.readFileSync(path.join(__dirname, './config/content.html'), 'utf8')
  if (!html || !html.trim()) {
    console.error('\x1b[31mconfig/content.html 文件内容不能为空\x1b[0m')
    return false
  }

  if (!config.website) {
    console.error('\x1b[33mconfig.website 为空，将不进行图片下载\x1b[0m')
  }

  return true
}

module.exports = {
  check
}
