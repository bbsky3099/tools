// 获取 DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const convertAllBtn = document.getElementById('convertAllBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const previewContainer = document.getElementById('previewContainer');
const statusText = document.getElementById('statusText');
const noZipWarning = document.getElementById('noZipWarning');
const sampleRateInput = document.getElementById('sampleRateInput');
const bitRateInput = document.getElementById('bitRateInput');
const startTimeInput = document.getElementById('startTimeInput');
const endTimeInput = document.getElementById('endTimeInput');
const formatSelect = document.getElementById('formatSelect');
const progressContainer = document.querySelector('.progress-container');
const progressBar = document.querySelector('.progress');
const instructionsToggle = document.getElementById('instructionsToggle');
const instructionsContent = document.getElementById('instructionsContent');

// 音频数组
let audios = [];
// FFmpeg 实例
let ffmpeg = null;
// 加载状态
let isFFmpegLoading = false;
let isFFmpegLoaded = false;

// 初始化 FFmpeg
async function initFFmpeg() {
  if (isFFmpegLoading || isFFmpegLoaded) return;
  
  isFFmpegLoading = true;
  statusText.textContent = "正在加载音频处理引擎...";
  
  try {
    // 导入 FFmpeg.wasm
    const { createFFmpeg, fetchFile } = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.2/dist/ffmpeg.min.js');
    
    ffmpeg = createFFmpeg({ 
      log: true,
      corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.2/dist/ffmpeg-core.js'
    });
    
    await ffmpeg.load();
    isFFmpegLoaded = true;
    isFFmpegLoading = false;
    statusText.textContent = "音频处理引擎已加载，准备就绪";
  } catch (error) {
    console.error("FFmpeg 加载失败:", error);
    isFFmpegLoading = false;
    statusText.textContent = "音频处理引擎加载失败，请刷新页面重试";
    alert("抱歉，音频处理功能无法使用。请确保您的浏览器支持 WebAssembly 并且没有被阻止。");
  }
}

// 更新 UI 状态
function updateUI() {
  if (audios.length > 0) {
    convertAllBtn.disabled = false;
    downloadAllBtn.disabled = false;
    clearAllBtn.disabled = false;
    renderPreviews();
  } else {
    convertAllBtn.disabled = true;
    downloadAllBtn.disabled = true;
    clearAllBtn.disabled = true;
    previewContainer.innerHTML = '';
  }
}

// 渲染预览
function renderPreviews() {
  previewContainer.innerHTML = '';

  audios.forEach((audio, index) => {
    const card = document.createElement('div');
    card.className = 'audio-card';

    const audioElement = document.createElement('audio');
    audioElement.className = 'audio-preview';
    audioElement.src = audio.processedData || audio.originalData;
    audioElement.controls = true;
    audioElement.preload = 'metadata';

    const info = document.createElement('div');
    info.className = 'audio-info';

    const name = document.createElement('div');
    name.className = 'audio-name';
    name.textContent = audio.processedFile?.name || audio.file.name;

    const size = document.createElement('div');
    size.className = 'audio-size';
    size.textContent = `${audio.processedFile ? formatFileSize(audio.processedFile.size) : formatFileSize(audio.file.size)}`;

    const actions = document.createElement('div');
    actions.className = 'action-buttons small';

    const convertBtn = document.createElement('button');
    convertBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
        <path d="M21 3H3v18h18V3z"></path>
        <path d="M21 12H9"></path>
        <path d="M12 3v18"></path>
      </svg>
      ${audio.processedData ? '重新转换' : '转换'}
    `;

    convertBtn.addEventListener('click', () => convertSingleAudio(index));

    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      ${audio.processedData ? '下载' : '未转换'}
    `;
    downloadBtn.disabled = !audio.processedData;
    
    downloadBtn.addEventListener('click', () => downloadSingleAudio(index));

    const removeBtn = document.createElement('button');
    removeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
      移除
    `;
    removeBtn.addEventListener('click', () => {
      audios.splice(index, 1);
      updateUI();
      statusText.textContent = `已移除音频 "${audio.file.name}"`;
    });

    actions.appendChild(convertBtn);
    actions.appendChild(downloadBtn);
    actions.appendChild(removeBtn);

    card.appendChild(audioElement);
    card.appendChild(info);
    card.appendChild(actions);

    previewContainer.appendChild(card);
  });
}

// 处理上传的文件
function handleFiles(files) {
  const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));

  if (audioFiles.length === 0) {
    statusText.textContent = '没有选择有效的音频文件';
    return;
  }

  statusText.textContent = `正在加载 ${audioFiles.length} 个音频...`;

  let loadedCount = 0;
  audioFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const audio = document.createElement('audio');
      audio.onloadedmetadata = () => {
        audios.push({
          file: file,
          originalData: e.target.result,
          duration: audio.duration,
          processedData: null,
          processedFile: null
        });

        loadedCount++;
        if (loadedCount === audioFiles.length) {
          updateUI();
          statusText.textContent = `已加载 ${audioFiles.length} 个音频`;
          
          // 如果 FFmpeg 未加载，则开始加载
          if (!isFFmpegLoaded && !isFFmpegLoading) {
            initFFmpeg();
          }
        }
      };
      audio.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// 转换单个音频
async function convertSingleAudio(index) {
  if (!isFFmpegLoaded) {
    statusText.textContent = "音频处理引擎未就绪，请稍候再试";
    return;
  }
  
  const audio = audios[index];
  const sampleRate = parseInt(sampleRateInput.value) || null;
  const bitRate = parseInt(bitRateInput.value) || null;
  const startTime = Math.max(0, parseInt(startTimeInput.value) || 0);
  const endTime = Math.min(audio.duration || Infinity, parseInt(endTimeInput.value) || audio.duration || Infinity);
  const format = formatSelect.value;
  
  // 验证输入
  if (startTime >= endTime) {
    statusText.textContent = '起始时间必须小于结束时间';
    return;
  }
  
  if (startTime >= (audio.duration || Infinity)) {
    statusText.textContent = '起始时间超出音频长度';
    return;
  }
  
  // 显示进度条
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';
  statusText.textContent = `正在处理音频 "${audio.file.name}"...`;
  
  try {
    // 清除之前的处理结果
    if (audio.processedData) {
      URL.revokeObjectURL(audio.processedData);
      audio.processedData = null;
      audio.processedFile = null;
    }
    
    // 构建 FFmpeg 命令
    const fileName = audio.file.name;
    const outputFileName = `${fileName.substring(0, fileName.lastIndexOf('.'))}.${format}`;
    
    // 写入输入文件
    ffmpeg.FS('writeFile', fileName, await fetchFile(audio.originalData));
    
    // 构建 FFmpeg 参数
    let ffmpegArgs = ['-i', fileName];
    
    // 添加时间裁剪参数
    if (startTime > 0) {
      ffmpegArgs.push('-ss', startTime.toString());
    }
    
    if (endTime < (audio.duration || Infinity)) {
      ffmpegArgs.push('-to', endTime.toString());
    }
    
    // 添加格式和编码参数
    switch (format) {
      case 'mp3':
        ffmpegArgs.push('-codec:a', 'libmp3lame');
        if (bitRate) {
          ffmpegArgs.push('-b:a', `${bitRate}k`);
        }
        break;
      case 'wav':
        ffmpegArgs.push('-codec:a', 'pcm_s16le');
        break;
      case 'aac':
        ffmpegArgs.push('-codec:a', 'aac');
        if (bitRate) {
          ffmpegArgs.push('-b:a', `${bitRate}k`);
        }
        break;
    }
    
    // 添加采样率参数
    if (sampleRate) {
      ffmpegArgs.push('-ar', sampleRate.toString());
    }
    
    // 设置输出文件名
    ffmpegArgs.push('-y', outputFileName);
    
    // 执行 FFmpeg 命令
    await ffmpeg.run(...ffmpegArgs);
    
    // 读取输出文件
    const data = ffmpeg.FS('readFile', outputFileName);
    
    // 转换为 Blob
    const audioBlob = new Blob([data.buffer], { type: `audio/${format}` });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // 更新音频数据
    audio.processedData = audioUrl;
    audio.processedFile = new File([audioBlob], outputFileName, { type: `audio/${format}` });
    
    // 更新预览
    const previewAudio = previewContainer.querySelectorAll('.audio-preview')[index];
    previewAudio.src = audioUrl;
    
    // 更新尺寸信息
    const sizeInfo = previewContainer.querySelectorAll('.audio-size')[index];
    sizeInfo.textContent = `${formatFileSize(audioBlob.size)}`;
    
    // 更新转换按钮文本
    const convertBtn = previewContainer.querySelectorAll('.action-buttons.small button')[index*3];
    convertBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
        <path d="M21 3H3v18h18V3z"></path>
        <path d="M21 12H9"></path>
        <path d="M12 3v18"></path>
      </svg>
      重新转换
    `;
    
    // 启用下载按钮
    const downloadBtn = previewContainer.querySelectorAll('.action-buttons.small button')[index*3 + 1];
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      下载
    `;
    
    // 隐藏进度条
    progressContainer.style.display = 'none';
    statusText.textContent = `音频 "${audio.file.name}" 已成功转换为 ${format} 格式`;
    
    // 清理 FFmpeg 文件系统
    ffmpeg.FS('unlink', fileName);
    ffmpeg.FS('unlink', outputFileName);
    
  } catch (error) {
    console.error("音频处理失败:", error);
    progressContainer.style.display = 'none';
    statusText.textContent = `处理音频 "${audio.file.name}" 时出错: ${error.message}`;
    alert(`处理音频时出错: ${error.message}`);
  }
}

// 转换所有音频
async function convertAllAudios() {
  if (!isFFmpegLoaded) {
    statusText.textContent = "音频处理引擎未就绪，请稍候再试";
    return;
  }
  
  const total = audios.length;
  let processed = 0;
  
  progressContainer.style.display = 'block';
  statusText.textContent = `准备处理 ${total} 个音频...`;
  
  for (const [index, audio] of audios.entries()) {
    if (!audio.processedData) {
      await convertSingleAudio(index);
    }
    processed++;
    progressBar.style.width = `${(processed / total) * 100}%`;
  }
  
  if (processed > 0) {
    statusText.textContent = `已成功处理 ${processed} 个音频`;
  } else {
    statusText.textContent = `所有音频已处理完毕`;
    progressContainer.style.display = 'none';
  }
}

// 下载单个音频
function downloadSingleAudio(index) {
  const audio = audios[index];
  if (!audio.processedData) {
    statusText.textContent = "请先转换音频再下载";
    return;
  }
  
  const dataUrl = audio.processedData;
  const fileName = audio.processedFile.name;
  
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  statusText.textContent = `已下载音频 "${fileName}"`;
}

// 下载所有音频
function downloadAllAudios() {
  const processedAudios = audios.filter(audio => audio.processedData);
  
  if (processedAudios.length === 0) {
    statusText.textContent = "没有可下载的已处理音频";
    return;
  }
  
  if (processedAudios.length === 1) {
    downloadSingleAudio(audios.indexOf(processedAudios[0]));
    return;
  }
  
  if (typeof JSZip === 'undefined') {
    noZipWarning.style.display = 'block';
    downloadAudiosIndividually(processedAudios);
  } else {
    // 使用 JSZip 打包下载
    const zip = new JSZip();
    
    processedAudios.forEach(audio => {
      const fileName = audio.processedFile.name;
      zip.file(fileName, audio.processedFile);
    });
    
    zip.generateAsync({ type: 'blob' }).then(content => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = '音频合集.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      statusText.textContent = `已下载 ${processedAudios.length} 个音频`;
    });
  }
}

// 如果没有 JSZip，逐个下载音频
function downloadAudiosIndividually(audiosToDownload) {
  let delay = 0;
  
  audiosToDownload.forEach(audio => {
    setTimeout(() => {
      const index = audios.indexOf(audio);
      if (index !== -1) {
        downloadSingleAudio(index);
      }
    }, delay);
    delay += 500; // 每个下载间隔 500ms
  });
  
  statusText.textContent = `正在逐个下载 ${audiosToDownload.length} 个音频...`;
}

// 辅助函数：格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 上传区域事件处理
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('active');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('active');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('active');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
});

// 按钮事件处理
convertAllBtn.addEventListener('click', convertAllAudios);

downloadAllBtn.addEventListener('click', downloadAllAudios);

clearAllBtn.addEventListener('click', () => {
  // 释放所有 URL 对象
  audios.forEach(audio => {
    if (audio.originalData) {
      URL.revokeObjectURL(audio.originalData);
    }
    if (audio.processedData) {
      URL.revokeObjectURL(audio.processedData);
    }
  });
  
  audios = [];
  updateUI();
  statusText.textContent = '已清除所有音频';
});

// 说明折叠/展开
instructionsToggle.addEventListener('click', () => {
  instructionsContent.classList.toggle('show');
  const arrow = instructionsToggle.querySelector('span:last-child');
  if (instructionsContent.classList.contains('show')) {
    arrow.textContent = '▲';
  } else {
    arrow.textContent = '▼';
  }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 检查浏览器支持
  if (!window.WebAssembly) {
    statusText.textContent = "您的浏览器不支持 WebAssembly，无法使用音频处理功能";
    alert("抱歉，您的浏览器不支持此应用的音频处理功能。请使用最新版本的 Chrome、Firefox、Safari 或 Edge。");
    convertAllBtn.disabled = true;
  } else {
    // 开始加载 FFmpeg
    initFFmpeg();
  }
  
  // 检查 JSZip
  if (typeof JSZip === 'undefined') {
    noZipWarning.style.display = 'block';
  }

            // 添加黑暗模式切换
            const darkModeToggle = document.createElement('button');
            darkModeToggle.textContent = '🌙 黑暗模式';
            darkModeToggle.style.position = 'fixed';
            darkModeToggle.style.bottom = '20px';
            darkModeToggle.style.right = '20px';
            darkModeToggle.style.zIndex = '1000';
            darkModeToggle.style.padding = '8px 16px';
            darkModeToggle.style.borderRadius = '20px';
            darkModeToggle.style.backgroundColor = '#333';
            darkModeToggle.style.color = 'white';
            darkModeToggle.style.border = 'none';
            darkModeToggle.style.cursor = 'pointer';
            darkModeToggle.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            document.body.appendChild(darkModeToggle);

            let darkMode = false;
            darkModeToggle.addEventListener('click', function() {
                darkMode = !darkMode;
                document.body.classList.toggle('dark-mode', darkMode);
                this.textContent = darkMode ? '☀️ 明亮模式' : '🌙 黑暗模式';
                this.style.backgroundColor = darkMode ? '#fff' : '#333';
                this.style.color = darkMode ? '#333' : '#fff';
            });

            // 添加黑暗模式样式
            const style = document.createElement('style');
            style.textContent = `
                .dark-mode {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    color: #f0f0f0;
                }
                .dark-mode .container {
                    background-color: #2d2d2d;
                    border-color: #444;
                }
                .dark-mode .upload-area {
                    background-color: #333;
                    border-color: #444;
                }
                .dark-mode .instructions {
                    border-color: #444;
                }
                .dark-mode .instructions-header {
                    background: linear-gradient(to right, #333, #444);
                    color: #f0f0f0;
                }
                .dark-mode .instructions-content {
                    background-color: #333;
                }
                .dark-mode .image-card {
                    background-color: #333;
                    border-color: #444;
                }
                .dark-mode input, .dark-mode select {
                    background-color: #444;
                    color: #f0f0f0;
                    border-color: #555;
                }
                .dark-mode label {
                    color: #f0f0f0;
                }
                .dark-mode button {
                    background-color: #444;
                    color: #f0f0f0;
                }
                .dark-mode button:hover {
                    background-color: #555;
                }
                .dark-mode .progress-bar {
                    background-color: #555;
                }
                .dark-mode .progress {
                    background: linear-gradient(to right, #3498db, #2ecc71);
                }
                .dark-mode .status {
                    color: #f0f0f0;
                }
            `;
            document.head.appendChild(style);
});