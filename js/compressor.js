// 获取 DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const operationSelect = document.getElementById('operationSelect');
const processAllBtn = document.getElementById('processAllBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const statusText = document.getElementById('statusText');
const noZipWarning = document.getElementById('noZipWarning');
const previewContainer = document.getElementById('previewContainer');

// 文件数组
let files = [];

// 更新 UI 状态
function updateUI() {
    if (files.length > 0) {
        processAllBtn.disabled = false;
        downloadAllBtn.disabled = false;
        clearAllBtn.disabled = false;
        renderPreviews();
    } else {
        processAllBtn.disabled = true;
        downloadAllBtn.disabled = true;
        clearAllBtn.disabled = true;
        previewContainer.innerHTML = '';
    }
}

// ==================== 响应式按钮组 ====================
// 创建按钮容器
const buttonGroup = document.createElement('div');
Object.assign(buttonGroup.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '1000',
    display: 'flex',
    gap: '15px',
    transition: 'all 0.3s ease'
});

// 黑暗模式切换按钮
const darkModeToggle = document.createElement('button');
darkModeToggle.textContent = '🌙 黑暗模式';
Object.assign(darkModeToggle.style, {
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease'
});

// 全部工具按钮
const allToolsButton = document.createElement('button');
allToolsButton.textContent = '首页';
Object.assign(allToolsButton.style, {
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: '#333',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s ease'
});

// 响应式布局函数
const updateButtonLayout = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // 移动端布局
        buttonGroup.style.flexDirection = 'column-reverse';
        buttonGroup.style.alignItems = 'flex-end';
        buttonGroup.style.bottom = '10px';
        buttonGroup.style.right = '10px';
        buttonGroup.style.gap = '10px';
        
        // 按钮尺寸调整
        [darkModeToggle, allToolsButton].forEach(btn => {
            btn.style.padding = '6px 12px';
            btn.style.fontSize = '14px';
        });
    } else {
        // 桌面端布局
        buttonGroup.style.flexDirection = 'row';
        buttonGroup.style.bottom = '20px';
        buttonGroup.style.right = '20px';
        buttonGroup.style.gap = '15px';
        
        // 恢复默认尺寸
        [darkModeToggle, allToolsButton].forEach(btn => {
            btn.style.padding = '8px 16px';
            btn.style.fontSize = '16px';
        });
    }
};

// 初始化布局
updateButtonLayout();
window.addEventListener('resize', updateButtonLayout);

// 添加按钮到容器
buttonGroup.appendChild(allToolsButton);
buttonGroup.appendChild(darkModeToggle);
document.body.appendChild(buttonGroup);

// ==================== 黑暗模式功能 ====================
let darkMode = false;
darkModeToggle.addEventListener('click', function() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    
    // 动态更新按钮样式
    this.textContent = darkMode ? '☀️ 明亮模式' : '🌙 黑暗模式';
    this.style.backgroundColor = darkMode ? '#fff' : '#333';
    this.style.color = darkMode ? '#333' : '#fff';
    
    // 同步全部工具按钮样式
    allToolsButton.style.backgroundColor = darkMode ? '#444' : '#333';
    allToolsButton.style.color = darkMode ? '#eee' : '#fff';
});

// ==================== 黑暗模式全局样式 ====================
const darkModeStyles = document.createElement('style');
darkModeStyles.textContent = `
.dark-mode {
    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
    color: #f0f0f0;
}

.dark-mode .container {
    background-color: #2d2d2d;
    border: 1px solid #444;
}

.dark-mode input,
.dark-mode select,
.dark-mode button:not(.dark-mode-toggle) {
    background-color: #444;
    color: #fff;
    border-color: #555;
}

.dark-mode .progress-bar {
    background-color: #555;
}

@media (max-width: 768px) {
    .dark-mode .button-group {
        background: rgba(40, 40, 40, 0.9);
        backdrop-filter: blur(5px);
    }
}
`;
document.head.appendChild(darkModeStyles);

// ==================== 全部工具按钮功能 ====================
allToolsButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// ==================== 触摸优化 ====================
// 添加触摸反馈
[allToolsButton, darkModeToggle].forEach(btn => {
    btn.addEventListener('touchstart', () => {
        btn.style.transform = 'scale(0.95)';
    });
    
    btn.addEventListener('touchend', () => {
        btn.style.transform = 'scale(1)';
    });
});

// ==================== 无障碍优化 ====================
allToolsButton.setAttribute('aria-label', '返回全部工具页面');
darkModeToggle.setAttribute('aria-label', '切换黑暗模式');
buttonGroup.setAttribute('role', 'toolbar');

// 渲染预览
function renderPreviews() {
    previewContainer.innerHTML = '';

    files.forEach((file, index) => {
        const card = document.createElement('div');
        card.className = 'file-card';

        const info = document.createElement('div');
        info.className = 'file-info';

        const name = document.createElement('div');
        name.className = 'file-name';
        name.textContent = file.name;

        const size = document.createElement('div');
        size.className = 'file-size';
        size.textContent = formatFileSize(file.size);

        const actions = document.createElement('div');
        actions.className = 'action-buttons small';

        const processBtn = document.createElement('button');
        processBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                <path d="M21 3H3v18h18V3z"></path>
                <path d="M21 12H9"></path>
                <path d="M12 3v18"></path>
            </svg>
            处理
        `;

        processBtn.addEventListener('click', () => processSingleFile(index));

        const downloadBtn = document.createElement('button');
        downloadBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            下载
        `;
        downloadBtn.addEventListener('click', () => downloadSingleFile(index));

        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            移除
        `;
        removeBtn.addEventListener('click', () => {
            files.splice(index, 1);
            updateUI();
            statusText.textContent = `已移除文件 "${file.name}"`;
        });

        actions.appendChild(processBtn);
        actions.appendChild(downloadBtn);
        actions.appendChild(removeBtn);

        card.appendChild(info);
        card.appendChild(actions);

        previewContainer.appendChild(card);
    });
}

// 处理单个文件
function processSingleFile(index) {
    const file = files[index];
    const operation = operationSelect.value;

    if (operation === 'compress') {
        // 压缩逻辑
        // 这里需要使用相应的压缩库，如 JSZip 处理 ZIP 压缩
        // 示例代码：
        const zip = new JSZip();
        zip.file(file.name, file);
        zip.generateAsync({ type: 'blob' }).then((blob) => {
            const newDataUrl = URL.createObjectURL(blob);
            file.processedData = newDataUrl;
            file.processedFile = new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}.zip`, { type: 'application/zip' });
            statusText.textContent = `文件 "${file.name}" 已压缩`;
        });
    } else if (operation === 'decompress') {
        // 解压逻辑
        // 这里需要使用相应的解压库，如 JSZip 处理 ZIP 解压
        // 示例代码：
        JSZip.loadAsync(file).then((zip) => {
            const promises = [];
            zip.forEach((relativePath, zipEntry) => {
                promises.push(zipEntry.async('blob').then((blob) => {
                    const newFile = new File([blob], relativePath, { type: zipEntry.mimeType });
                    // 处理解压后的文件
                    // 这里可以将解压后的文件添加到某个列表中
                }));
            });
            Promise.all(promises).then(() => {
                statusText.textContent = `文件 "${file.name}" 已解压`;
            });
        });
    }
}

// 下载单个文件
function downloadSingleFile(index) {
    const file = files[index];
    const dataUrl = file.processedData || URL.createObjectURL(file);
    const fileName = file.processedFile ? file.processedFile.name : file.name;

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    statusText.textContent = `已下载文件 "${fileName}"`;
}

// 处理上传的文件
function handleFiles(selectedFiles) {
    const validFiles = Array.from(selectedFiles).filter(file => ['.zip', '.rar', '.7z'].some(ext => file.name.endsWith(ext)));

    if (validFiles.length === 0) {
        statusText.textContent = '没有选择有效的压缩文件';
        return;
    }

    statusText.textContent = `正在加载 ${validFiles.length} 个文件...`;

    files = files.concat(validFiles);
    updateUI();
    statusText.textContent = `已加载 ${validFiles.length} 个文件`;
}

// 辅助函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 上传区域点击事件
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 文件选择事件
fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
});

// 上传区域拖拽事件
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

// 处理所有文件按钮点击事件
processAllBtn.addEventListener('click', () => {
    files.forEach((_, index) => {
        processSingleFile(index);
    });
    statusText.textContent = `正在处理 ${files.length} 个文件...`;
});

// 下载所有文件按钮点击事件
downloadAllBtn.addEventListener('click', () => {
    if (typeof JSZip === 'undefined') {
        noZipWarning.style.display = 'block';
        downloadFilesIndividually();
    } else {
        // 打包下载所有文件
        const zip = new JSZip();
        files.forEach((file) => {
            if (file.processedFile) {
                zip.file(file.processedFile.name, file.processedFile);
            }
        });
        zip.generateAsync({ type: 'blob' }).then((blob) => {
            const dataUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = 'all_files.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            statusText.textContent = `已下载所有处理后的文件`;
        });
    }
});

// 清除所有文件按钮点击事件
clearAllBtn.addEventListener('click', () => {
    files = [];
    updateUI();
    statusText.textContent = '已清除所有文件，准备就绪，请上传文件';
});

// 如果没有 JSZip，逐个下载文件
function downloadFilesIndividually() {
    let delay = 0;

    files.forEach((_, index) => {
        setTimeout(() => {
            downloadSingleFile(index);
        }, delay);
        delay += 300; // 每个下载间隔 300ms
    });
    statusText.textContent = `正在逐个下载 ${files.length} 个文件...`;
}

