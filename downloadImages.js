const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { config, getUploadPath } = require('./config/index')


const downloadImages = async () => {
  if (config.website === '') {
    console.error('\x1b[33mconfig.website 为空，无法下载图片\x1b[0m');
    return;
  }
  // 读取 dist/images.json文件，获取图片地址列表
  const imgSrcList = JSON.parse(fs.readFileSync(path.join(__dirname, './dist/images.json'), 'utf8'));

  if (imgSrcList.length === 0) {
    console.log('没有需要下载的图片');
    return;
  }

  // 保存到dist/img目录下，如果不存在则创建，如果存在则覆盖
  const dir = `.${getUploadPath()}`
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  let createdDir = false

  const dowloadedImgSrcList = [];

  try {
    const browser = await puppeteer.launch({
      ...config.puppeteer,
    });
    // 你的代码...
    const page = await browser.newPage();


    // 监听所有的响应
    page.on('response', async response => {
      for (let i = 0; i < imgSrcList.length; i++) {
        const imgSrcItem = imgSrcList[i];
        if (imgSrcItem.url.includes(response.url())) {
          if (!createdDir) {
            fs.mkdirSync(dir, { recursive: true });
            createdDir = true
          }
          const buffer = await response.buffer();
          fs.writeFileSync(path.join(dir, `${imgSrcItem.filename}`), buffer);
          dowloadedImgSrcList.push(imgSrcItem);

          // 如果所有图片下载成功，await browser.close();
          if (dowloadedImgSrcList.length === imgSrcList.length) {
            await browser.close();
            handleUndownloadImages(imgSrcList, dowloadedImgSrcList);
          }
          // 结束for循环
          break;
        }
      }
    });

    // Navigate the page to a URL
    if (!page.isClosed()) {
      await page.goto(config.website);
      // 缓缓滚动页面高度，让图片加载出来
      await page.evaluate(() => {
        let y = 0;
        const step = 100;
        const timer = setInterval(() => {
          if (y < document.body.scrollHeight) {
            y += step;
            window.scrollTo(0, y);
          } else {
            clearInterval(timer);
          }
        }, 100);
      });
    }

  } catch (error) {
    console.log(error);
    handleUndownloadImages(imgSrcList, dowloadedImgSrcList);
  }
}


// 处理未下载的图片
let handleUndownloadImagesFlag = false
const handleUndownloadImages = (imgSrcList, dowloadedImgSrcList) => {
  if (!handleUndownloadImagesFlag) {
    handleUndownloadImagesFlag = true
  } else {
    return
  }
  // 没有下载到图片的地址
  const noDownloadImgSrcList = imgSrcList.filter(imgSrcItem => !dowloadedImgSrcList.find(dowloadedImgSrcItem => dowloadedImgSrcItem.url === imgSrcItem.url));

  // 保存到./dist/undownload_images.json文件中
  if (noDownloadImgSrcList.length > 0) {
    fs.writeFileSync(path.join(__dirname, './dist/undownload_images.json'), JSON.stringify(noDownloadImgSrcList));
    console.log(`\x1b[31m已下载图片 ${dowloadedImgSrcList.length} 张，未下载的图片 ${noDownloadImgSrcList.length} 张，见/dist/undownload_images.json \x1b[31m`);
  } else {
    fs.rmSync(path.join(__dirname, './dist/undownload_images.json'), { recursive: true, force: true });
    console.log('所有图片下载成功', `\x1b[32m${getUploadPath()}\x1b[0m`);
  }
}

module.exports = {
  downloadImages,
}