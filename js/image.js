// 检查JSZip是否加载成功
const zipAvailable = typeof JSZip !== 'undefined';
if (!zipAvailable) {
    document.getElementById('noZipWarning').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    // 功能说明面板的展开/折叠功能
    const instructionsToggle = document.getElementById('instructionsToggle');
    const instructionsContent = document.getElementById('instructionsContent');
    
    instructionsToggle.addEventListener('click', function() {
        instructionsContent.classList.toggle('show');
        const arrow = this.querySelector('span:last-child');
        arrow.textContent = instructionsContent.classList.contains('show') ? '▲' : '▼';
        
        // 如果展开后内容被截断，滚动到可见区域
        if (instructionsContent.classList.contains('show')) {
            instructionsContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    // 获取DOM元素
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const previewContainer = document.getElementById('previewContainer');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const resizeMethod = document.getElementById('resizeMethod');
    const formatSelect = document.getElementById('formatSelect');
    const resizeAllBtn = document.getElementById('resizeAllBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress');
    const statusText = document.getElementById('statusText');
    const noZipWarning = document.getElementById('noZipWarning');
    
    let images = [];
    
    // 上传区域点击事件
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // 拖放功能
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
    
    // 文件选择事件
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFiles(fileInput.files);
        }
    });
    
    // 处理上传的文件
    function handleFiles(files) {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            statusText.textContent = '没有选择有效的图片文件';
            return;
        }
        
        statusText.textContent = `正在加载 ${imageFiles.length} 张图片...`;
        
        let loadedCount = 0;
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    images.push({
                        file: file,
                        originalData: e.target.result,
                        element: img,
                        originalWidth: img.width,
                        originalHeight: img.height
                    });
                    
                    loadedCount++;
                    if (loadedCount === imageFiles.length) {
                        updateUI();
                        statusText.textContent = `已加载 ${imageFiles.length} 张图片`;
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    
    // 更新UI状态
    function updateUI() {
        if (images.length > 0) {
            resizeAllBtn.disabled = false;
            downloadAllBtn.disabled = false;
            clearAllBtn.disabled = false;
            renderPreviews();
        } else {
            resizeAllBtn.disabled = true;
            downloadAllBtn.disabled = true;
            clearAllBtn.disabled = true;
            previewContainer.innerHTML = '';
        }
    }
    
    // 渲染预览
    function renderPreviews() {
        previewContainer.innerHTML = '';
        
        images.forEach((image, index) => {
            const card = document.createElement('div');
            card.className = 'image-card';
            
            const img = document.createElement('img');
            img.className = 'image-preview';
            img.src = image.originalData;
            
            const info = document.createElement('div');
            info.className = 'image-info';
            
            const name = document.createElement('div');
            name.className = 'image-name';
            name.textContent = image.file.name;
            
            const size = document.createElement('div');
            size.className = 'image-size';
            size.textContent = `${image.originalWidth}×${image.originalHeight} - ${formatFileSize(image.file.size)}`;
            
            const actions = document.createElement('div');
            actions.className = 'action-buttons small';
            
            const resizeBtn = document.createElement('button');
            resizeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                    <path d="M21 3H3v18h18V3z"></path>
                    <path d="M21 12H9"></path>
                    <path d="M12 3v18"></path>
                </svg>
                调整
            `;
            resizeBtn.addEventListener('click', () => resizeSingleImage(index));
            
            const downloadBtn = document.createElement('button');
            downloadBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                下载
            `;
            downloadBtn.addEventListener('click', () => downloadSingleImage(index));
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                移除
            `;
            removeBtn.addEventListener('click', () => {
                images.splice(index, 1);
                updateUI();
                statusText.textContent = `已移除图片 "${image.file.name}"`;
            });
            
            actions.appendChild(resizeBtn);
            actions.appendChild(downloadBtn);
            actions.appendChild(removeBtn);
            
            info.appendChild(name);
            info.appendChild(size);
            
            card.appendChild(img);
            card.appendChild(info);
            card.appendChild(actions);
            
            previewContainer.appendChild(card);
        });
    }
    
    // 调整单个图片
    function resizeSingleImage(index) {
        const image = images[index];
        const width = parseInt(widthInput.value) || null;
        const height = parseInt(heightInput.value) || null;
        const method = resizeMethod.value;
        const format = formatSelect.value;
        
        if (!width && !height) {
            statusText.textContent = '请至少指定宽度或高度';
            return;
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算新尺寸
        let newWidth, newHeight;
        
        if (method === 'fill') {
            // 拉伸填充
            newWidth = width || height || image.originalWidth;
            newHeight = height || width || image.originalHeight;
        } else {
            // 保持比例
            const aspectRatio = image.originalWidth / image.originalHeight;
            
            if (method === 'cover') {
                // 覆盖模式 - 裁剪以适应
                if (width && height) {
                    newWidth = width;
                    newHeight = height;
                } else if (width) {
                    newWidth = width;
                    newHeight = width / aspectRatio;
                } else {
                    newHeight = height;
                    newWidth = height * aspectRatio;
                }
            } else {
                // 包含模式 - 完整显示
                if (width && height) {
                    const widthRatio = width / image.originalWidth;
                    const heightRatio = height / image.originalHeight;
                    const ratio = method === 'contain' ? Math.min(widthRatio, heightRatio) : Math.max(widthRatio, heightRatio);
                    newWidth = image.originalWidth * ratio;
                    newHeight = image.originalHeight * ratio;
                } else if (width) {
                    newWidth = width;
                    newHeight = width / aspectRatio;
                } else {
                    newHeight = height;
                    newWidth = height * aspectRatio;
                }
            }
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 绘制图像
        if (method === 'cover' && width && height) {
            // 居中裁剪
            const sourceAspect = image.originalWidth / image.originalHeight;
            const targetAspect = width / height;
            
            let sourceX = 0, sourceY = 0, sourceWidth = image.originalWidth, sourceHeight = image.originalHeight;
            
            if (sourceAspect > targetAspect) {
                // 源图更宽，裁剪左右
                sourceWidth = image.originalHeight * targetAspect;
                sourceX = (image.originalWidth - sourceWidth) / 2;
            } else {
                // 源图更高，裁剪上下
                sourceHeight = image.originalWidth / targetAspect;
                sourceY = (image.originalHeight - sourceHeight) / 2;
            }
            
            ctx.drawImage(
                image.element,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, newWidth, newHeight
            );
        } else {
            // 普通绘制
            ctx.drawImage(image.element, 0, 0, newWidth, newHeight);
        }
        
        // 获取新图像数据
        let mimeType = image.file.type;
        let fileExtension = image.file.name.split('.').pop().toLowerCase();
        
        if (format !== 'original') {
            mimeType = `image/${format}`;
            fileExtension = format;
        }
        
        const quality = parseFloat(qualityInput.value);
        const qualityParam = (format === 'jpeg' || format === 'webp') ? quality : undefined;
        
        canvas.toBlob(blob => {
            const newDataUrl = URL.createObjectURL(blob);
            
            // 更新图像数据
            image.resizedData = newDataUrl;
            image.resizedWidth = newWidth;
            image.resizedHeight = newHeight;
            image.resizedFile = new File([blob], 
                `${image.file.name.replace(/\.[^/.]+$/, '')}_${newWidth}x${newHeight}.${fileExtension}`, 
                { type: mimeType });
            
            // 更新预览
            const previewImg = previewContainer.querySelectorAll('.image-preview')[index];
            previewImg.src = newDataUrl;
            
            // 更新尺寸信息
            const sizeInfo = previewContainer.querySelectorAll('.image-size')[index];
            sizeInfo.textContent = `${newWidth}×${newHeight} - ${formatFileSize(blob.size)}`;
            
            statusText.textContent = `图片 "${image.file.name}" 已调整为 ${newWidth}×${newHeight}`;
        }, mimeType, qualityParam);
    }
    
    // 下载单个图片
    function downloadSingleImage(index) {
        const image = images[index];
        const dataUrl = image.resizedData || image.originalData;
        const fileName = image.resizedFile ? image.resizedFile.name : image.file.name;
        
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        statusText.textContent = `已下载图片 "${fileName}"`;
    }
    
    // 调整所有图片
    resizeAllBtn.addEventListener('click', function() {
        if (images.length === 0) return;
        
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        statusText.textContent = `正在调整 ${images.length} 张图片...`;
        
        let processed = 0;
        
        images.forEach((_, index) => {
            setTimeout(() => {
                resizeSingleImage(index);
                processed++;
                progressBar.style.width = `${(processed / images.length) * 100}%`;
                
                if (processed === images.length) {
                    progressContainer.style.display = 'none';
                    statusText.textContent = `已完成调整 ${images.length} 张图片`;
                }
            }, index * 100); // 添加小延迟防止UI阻塞
        });
    });
    
    // 下载所有图片
    downloadAllBtn.addEventListener('click', function() {
        if (images.length === 0) return;
        
        if (zipAvailable && images.length > 1) {
            // 使用本地JSZip库
            const zip = new JSZip();
            const imgFolder = zip.folder("resized_images");
            let addedFiles = 0;
            
            statusText.textContent = `正在准备 ${images.length} 张图片的ZIP下载...`;
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            
            images.forEach((image, index) => {
                const dataUrl = image.resizedData || image.originalData;
                const fileName = image.resizedFile ? image.resizedFile.name : image.file.name;
                
                fetch(dataUrl)
                   .then(res => res.blob())
                   .then(blob => {
                        imgFolder.file(fileName, blob);
                        addedFiles++;
                        progressBar.style.width = `${(addedFiles / images.length) * 100}%`;
                        
                        if (addedFiles === images.length) {
                            zip.generateAsync({ type: 'blob' })
                               .then(content => {
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(content);
                                    a.download = 'resized_images.zip';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    
                                    progressContainer.style.display = 'none';
                                    statusText.textContent = `已下载 ${images.length} 张图片的ZIP文件`;
                                });
                        }
                    });
            });
        } else {
            // 没有JSZip或只有一张图片，逐个下载
            downloadImagesIndividually();
        }
    });
    
    // 如果没有JSZip，逐个下载图片
    function downloadImagesIndividually() {
        let delay = 0;
        
        images.forEach((_, index) => {
            setTimeout(() => {
                downloadSingleImage(index);
            }, delay);
            delay += 300; // 每个下载间隔300ms
        });
        statusText.textContent = `正在逐个下载 ${images.length} 张图片...`;
    }
    
    // 清除所有图片
    clearAllBtn.addEventListener('click', function() {
        if (images.length === 0) return;
        
        // 释放所有创建的Blob URL
        images.forEach(image => {
            if (image.resizedData) {
                URL.revokeObjectURL(image.resizedData);
            }
        });
        
        images = [];
        updateUI();
        statusText.textContent = '已清除所有图片';
    });
    
    // 辅助函数：格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 宽度和高度联动 - 如果保持比例
    let maintainRatio = false;
    let ratio = 1;
    
    widthInput.addEventListener('input', function() {
        if (maintainRatio && widthInput.value && !heightInput.value) {
            heightInput.value = Math.round(widthInput.value / ratio);
        }
    });
    
    heightInput.addEventListener('input', function() {
        if (maintainRatio && heightInput.value && !widthInput.value) {
            widthInput.value = Math.round(heightInput.value * ratio);
        }
    });
    
    // 添加保持比例复选框
    const ratioCheckbox = document.createElement('div');
    ratioCheckbox.innerHTML = `
        <label style="display: flex; align-items: center; margin-top: 10px;">
            <input type="checkbox" id="maintainRatioCheckbox" style="margin-right: 8px;">
            保持原始比例
        </label>
    `;
    document.querySelector('.control-group:nth-child(1)').appendChild(ratioCheckbox);
    
    const maintainRatioCheckbox = document.getElementById('maintainRatioCheckbox');
    maintainRatioCheckbox.addEventListener('change', function() {
        maintainRatio = this.checked;
        if (maintainRatio && images.length > 0) {
            ratio = images[0].originalWidth / images[0].originalHeight;
        }
    });
    
    // 添加图片质量滑块
    const qualityControl = document.createElement('div');
    qualityControl.innerHTML = `
        <label for="qualityInput">图片质量 (JPEG/WebP)</label>
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
            <input type="range" id="qualityInput" min="0.1" max="1" step="0.1" value="0.92" style="flex-grow: 1;">
            <span id="qualityValue">92%</span>
        </div>
    `;
    document.querySelector('.controls').appendChild(qualityControl);
    
    const qualityInput = document.getElementById('qualityInput');
    const qualityValue = document.getElementById('qualityValue');
    
    qualityInput.addEventListener('input', function() {
        qualityValue.textContent = `${Math.round(this.value * 100)}%`;
    });
    
    // 修改resizeSingleImage函数以使用质量设置
    const originalResizeSingleImage = resizeSingleImage;
    resizeSingleImage = function(index) {
        const quality = parseFloat(qualityInput.value);
        const image = images[index];
        const format = formatSelect.value;
        
        // 只对JPEG和WebP应用质量设置
        const qualityParam = (format === 'jpeg' || format === 'webp') ? quality : undefined;
        
        // 调用原始函数，传递质量参数
        originalResizeSingleImage.call(this, index);
        
        // 修改canvas.toBlob调用以使用质量参数
        const canvas = document.createElement('canvas');
        // ...其他代码不变...
        
        canvas.toBlob(blob => {
            const newDataUrl = URL.createObjectURL(blob);
            // ...其他代码不变...
        }, mimeType, qualityParam); // 使用质量参数
    };
    
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
    `;
    document.head.appendChild(style);
    
    // 添加图片旋转功能
    const rotateControl = document.createElement('div');
    rotateControl.innerHTML = `
        <label for="rotateSelect">旋转角度</label>
        <select id="rotateSelect" style="margin-top: 5px;">
            <option value="0">0°</option>
            <option value="90">90°</option>
            <option value="180">180°</option>
            <option value="270">270°</option>
        </select>
    `;
    document.querySelector('.controls').appendChild(rotateControl);
    
    // 修改resizeSingleImage函数以支持旋转
    const rotateSelect = document.getElementById('rotateSelect');
    const originalResizeWithRotation = resizeSingleImage;
    resizeSingleImage = function(index) {
        const rotation = parseInt(rotateSelect.value);
        const image = images[index];
        
        if (rotation === 0) {
            return originalResizeWithRotation.call(this, index);
        }
        
        // 处理旋转逻辑
        const width = parseInt(widthInput.value) || image.originalWidth;
        const height = parseInt(heightInput.value) || image.originalHeight;
        const method = resizeMethod.value;
        const format = formatSelect.value;
        const quality = parseFloat(qualityInput.value);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 根据旋转角度调整画布尺寸
        if (rotation === 90 || rotation === 270) {
            canvas.width = height;
            canvas.height = width;
        } else {
            canvas.width = width;
            canvas.height = height;
        }
        
        // 旋转并绘制图像
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation * Math.PI / 180);
        
        // 计算绘制位置和尺寸
        let drawWidth, drawHeight;
        if (rotation === 90 || rotation === 270) {
            drawWidth = height;
            drawHeight = width;
        } else {
            drawWidth = width;
            drawHeight = height;
        }
        
        ctx.drawImage(image.element, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);
        
        // 获取新图像数据
        let mimeType = image.file.type;
        let fileExtension = image.file.name.split('.').pop().toLowerCase();
        
        if (format !== 'original') {
            mimeType = `image/${format}`;
            fileExtension = format;
        }
        
        const qualityParam = (format === 'jpeg' || format === 'webp') ? quality : undefined;
        
        canvas.toBlob(blob => {
            const newDataUrl = URL.createObjectURL(blob);
            
            // 更新图像数据
            image.resizedData = newDataUrl;
            image.resizedWidth = canvas.width;
            image.resizedHeight = canvas.height;
            image.resizedFile = new File([blob], 
                `${image.file.name.replace(/\.[^/.]+$/, '')}_${rotation}deg_${canvas.width}x${canvas.height}.${fileExtension}`, 
                { type: mimeType });
            
            // 更新预览
            const previewImg = previewContainer.querySelectorAll('.image-preview')[index];
            previewImg.src = newDataUrl;
            
            // 更新尺寸信息
            const sizeInfo = previewContainer.querySelectorAll('.image-size')[index];
            sizeInfo.textContent = `${canvas.width}×${canvas.height} - ${formatFileSize(blob.size)} (旋转 ${rotation}°)`;
            
            statusText.textContent = `图片 "${image.file.name}" 已调整为 ${canvas.width}×${canvas.height} 并旋转 ${rotation}°`;
        }, mimeType, qualityParam);
    };

    // 添加全部工具按钮
    const allToolsButton = document.createElement('button');
    allToolsButton.textContent = '全部工具';
    allToolsButton.style.position = 'fixed';
    allToolsButton.style.bottom = '20px';
    // 调整位置，使其在暗黑模式按钮左边
    allToolsButton.style.right = '160px'; 
    allToolsButton.style.zIndex = '1000';
    allToolsButton.style.padding = '8px 16px';
    allToolsButton.style.borderRadius = '20px';
    allToolsButton.style.backgroundColor = '#333';
    allToolsButton.style.color = 'white';
    allToolsButton.style.border = 'none';
    allToolsButton.style.cursor = 'pointer';
    allToolsButton.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    document.body.appendChild(allToolsButton);

    // 绑定点击事件，跳转至 index.html
    allToolsButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});