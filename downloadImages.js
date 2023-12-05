const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { config, getUploadPath } = require('./config/index')


const downloadImages = async () => {
  if(config.website === '') {
    console.error('\x1b[33mconfig.website 为空，无法下载图片\x1b[0m');
    return;
  }
  // 读取 dist/images.json文件，获取图片地址列表
  const imgSrcList = JSON.parse(fs.readFileSync(path.join(__dirname, './dist/images.json'), 'utf8'));

  if(imgSrcList.length === 0) {
    console.log('没有需要下载的图片');
    return;
  }

  const browser = await puppeteer.launch({
    ...config.puppeteer,
  });
  // 你的代码...
  const page = await browser.newPage();

  // 设置一个空的响应数组
  const responses = [];

  // 监听所有的响应
  page.on('response', response => {
    responses.push(response);
  });


  // Navigate the page to a URL
  await page.goto(config.website);

  // 保存到dist/img目录下，如果不存在则创建，如果存在则覆盖
  const dir = `.${getUploadPath()}`
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < imgSrcList.length; i++) {
    const imgSrcItem = imgSrcList[i];
    const imgResponse = responses.find(response => response.url() === imgSrcItem.url);
    if (imgResponse) {
      const buffer = await imgResponse.buffer();
      fs.writeFileSync(path.join(dir, `${imgSrcItem.filename}`), buffer);
    }
  }
  // 没有下载到图片的地址
  const noDownloadImgSrcList = imgSrcList.filter(imgSrcItem => !responses.find(response => response.url() === imgSrcItem.url));
  
  // 保存到./dist/undownload_images.json文件中
  if(noDownloadImgSrcList.length > 0) {
    fs.writeFileSync(path.join(__dirname, './dist/undownload_images.json'), JSON.stringify(noDownloadImgSrcList));
    console.log(`\x1b[31m未下载的图片 ${noDownloadImgSrcList.length} 张，见/dist/undownload_images.json \x1b[31m`);
  }else{
    fs.rmSync(path.join(__dirname, './dist/undownload_images.json'), { recursive: true, force: true });
    console.log('所有图片下载成功', `\x1b[32m${getUploadPath()}\x1b[0m`);
  }

  await browser.close();
}

module.exports = {
  downloadImages,
}