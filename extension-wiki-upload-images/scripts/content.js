

let host = ''
let guid = '';
let document_id = '';

// 点击页面上的上传按钮，打开上传图片的窗口
const clickUploadButton = () => {
  const mainIframe = document.getElementById('mainFrame');
  const uploadButton = mainIframe.contentDocument.querySelector('i[name="image"]');
  if (!uploadButton) {
    console.log('没有找到上传按钮');
    return false;
  }
  uploadButton.click();
  return true;
}

// 点击页面上的关闭上传图片窗口的按钮
const clickCloseButton = () => {
  const mainIframe = document.getElementById('mainFrame');
  // 获取 .editormd-image-dialog 元素
  const dialog = mainIframe.contentDocument.querySelector('.editormd-image-dialog');
  if (!dialog) {
    console.log('没有找到上传图片窗口');
    return false;
  }
  // 设置 display 属性为 none
  dialog.style.display = 'none';
  return true;
}

// 获取guid
const getGuid = () => {
  const mainIframe = document.getElementById('mainFrame');
  const iframe = mainIframe.contentDocument.getElementById('editormd-image-iframe');
  if (!iframe) {
    console.log('没有找到guid');
    return '';
  }
  return iframe.getAttribute('guid');
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    // console.log('request', request);
    if (request.action == "getGuid") {
      const guid = getGuid()
      if(!guid) {
        console.log('没有找到guid');
        return;
      }
      sendResponse({ guid });  // 异步响应
    } else if (request.action == "printUploadResults") {
      console.log('上传结果：', request.uploadResults);
      sendResponse();  // 异步响应
    }else if(request.action == 'alert') {
      alert(request.message);
      sendResponse();  // 异步响应
    }
    return true;  // 异步响应
  }
);