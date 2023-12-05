
let uploadResults = [];
let document_id = '';
let guid = '';
let host = '';
let uploadUrl = '';
let inputFiles = [];

// 获取上传地址
const getUploadUrl = () => {
  return `http://${host}/image/upload?document_id=${document_id}&guid=${guid}`;
}

// 获取已经上传过的图片地址
const getUploadedImageUrl = (filename, document_id) => {
  return `/images/4/${document_id}/${filename}`
}

// 获取页面参数
const getPageParams = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = tabs[0].url;
      const reg = /http:\/\/(.+?)\/document\/index\?document_id=(\d+)/;
      const result = url.match(reg);
      if (!result) {
        console.log('host、document_id获取失败');
        return reject();
      }

      host = result[1];
      document_id = result[2];
      return resolve({
        host,
        document_id
      });
    });
  })
}

// 添加上传结果
const addUploadResult = (result) => {
  // 往id=fileList的元素中添加上传结果
  /**
   * <li class="file-item">
        <span class="file-name">result.filename</span>
        <span class="file-url">result.url</span>
      </li>
      <li class="file-item">
        <span class="file-name">result.filename</span>
        <span class="file-url error">result.url</span>
      </li>
   */
  const fileList = document.getElementById('fileList');
  const li = document.createElement('li');
  ;
  if (result.error) {
    li.className = 'file-item error';
  } else {
    li.className = 'file-item'
  }
  const spanName = document.createElement('span');
  spanName.className = 'file-name';
  spanName.innerText = result.filename;
  const spanUrl = document.createElement('span');
  spanUrl.className = 'file-url';
  spanUrl.innerText = result.url || result.error;
  li.appendChild(spanName);
  li.appendChild(spanUrl);
  fileList.appendChild(li);
  uploadResults.push(result);

  /**
   * 如果开始上传，uploadCountsWrapper添加visible类，更新uploadCounts和uploadTotal
   * <span id="uploadCountsWrapper" class="visible">
        (<span id="uploadCounts">0</span> / <span id="uploadTotal">4</span>)
      </span>
   */
  const uploadCounts = document.getElementById('uploadCounts');
  const uploadTotal = document.getElementById('uploadTotal');
  const uploadCountsWrapper = document.getElementById('uploadCountsWrapper');

  uploadCounts.innerText = uploadResults.length;
  uploadTotal.innerText = inputFiles.length;
  if (uploadResults.length > 0 && uploadCountsWrapper.classList.contains('visible') == false) {
    uploadCountsWrapper.classList.add('visible');
  }
}

// 清空上传结果
const clearUploadResult = () => {
  uploadResults = [];
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';
  // 缓存清空
  localStorage.removeItem('uploadResults');
}

// 上传用户选择的图片
async function uploadImages(imageFiles, uploadUrl) {
  // 上传一张图片
  const uploadOneImage = async (imageFile) => {
    try {
      const filename = imageFile.name;
      const formData = new FormData();
      formData.append('editormd-image-file', imageFile, filename);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })
      console.log('uploadResponse', uploadResponse);
      if (!uploadResponse.ok) {
        addUploadResult({
          filename: filename,
          url: '',
          error: '上传失败'
        })
        return;
      }
      let uploadResult = await uploadResponse.text();
      uploadResult = JSON.parse(uploadResult);
      if (uploadResult.success == 1) {
        // 上传成功
        addUploadResult({
          filename,
          url: uploadResult.url
        });
      } else if (uploadResult.success == 0) {
        // 上传失败
        if (uploadResult.message.indexOf('该图片已经上传过') > -1) {
          // 该图片已经上传过
          console.log(filename, '该图片已经上传过');
          const url = getUploadedImageUrl(filename, document_id);
          addUploadResult({
            filename,
            url
          });
        } else {
          console.log(filename, '上传失败');
          addUploadResult({
            filename,
            url: '',
            error: uploadResult.message
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addUploadResult({
        filename: filename,
        url: '',
        error: error.message ? error.message : '上传失败'
      });
    }
  }

  for (let index = 0; index < imageFiles.length; index++) {
    await uploadOneImage(imageFiles[index]);
  }

  // 将上传结果保存到localStorage
  localStorage.setItem('uploadResults', JSON.stringify({
    document_id,
    data: uploadResults
  }));

  printUploadResults();
}


// 获取上传信息
const getGuid = () => {
  return new Promise((resolve, reject) => {
    // 将获取上传地址请求发送到content.js
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getGuid" }, function (response) {
        if (response && response.guid) {
          return resolve(response.guid);
        }
        return reject();
      });
    });
  })
}

// 打印上传结果：将uploadResults传给content.js进行打印
const printUploadResults = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "printUploadResults", uploadResults }, function (response) {
      console.log(response);
    });
  })
}

// 弹窗提醒：将消息传给content.js进行弹窗提醒
const sendAlert = (message) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "alert", message }, function (response) {
      console.log(response);
    });
  })
}

// 上传文件选择，可多选
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
  console.log('fileInput change', e.target.files);
  const files = e.target.files;


  inputFiles = files;
  getPageParams().then(() => {
    // 1. 获取上传相关信息
    getGuid().then(async (_guid) => {
      console.log('getGuid', _guid);
      // 设置上传参数
      guid = _guid;
      uploadUrl = getUploadUrl();

      // 清空之前的上传结果
      clearUploadResult();

      // 2. 上传用户选择的图片
      await uploadImages(files, uploadUrl);

      // 清除 input 元素的值
      e.target.value = '';
    })
      .catch((error) => {
        console.log('获取guid失败', error);
        sendAlert('获取guid失败：请先打开上传图片窗口，关闭，再上传图片');
      })
  }).catch((error) => {
    console.log('获取页面参数失败', error);
  })
})

// 初始化，从localStorage中获取上传结果
const init = () => {
  getPageParams().then(() => {
    // 获取缓存中对应document_id的上传结果
    const uploadResultsStr = localStorage.getItem('uploadResults');
    if (uploadResultsStr) {
      const _uploadResults = JSON.parse(uploadResultsStr);
      if (_uploadResults.document_id == document_id) {
        inputFiles = _uploadResults.data.map((result) => {
          return {
            name: result.filename
          }
        });
        _uploadResults.data.forEach((result) => {
          addUploadResult(result);
        })
      } else {
        // 与当前文档不匹配，清空缓存
        clearUploadResult();
      }
    }
  }).catch((error) => {
    console.log('获取页面参数失败，可能未在知识库文档编辑页面初始化插件', error);
  })
}
init();