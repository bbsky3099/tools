// 检查 JSZip 是否加载成功
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

    // 获取 DOM 元素
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

    let videos = [];

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
        const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'));

        if (videoFiles.length === 0) {
            statusText.textContent = '没有选择有效的视频文件';
            return;
        }

        statusText.textContent = `正在加载 ${videoFiles.length} 个视频...`;

        let loadedCount = 0;
        videoFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const video = document.createElement('video');
                video.onloadedmetadata = () => {
                    videos.push({
                        file: file,
                        originalData: e.target.result,
                        element: video,
                        originalWidth: video.videoWidth,
                        originalHeight: video.videoHeight
                    });

                    loadedCount++;
                    if (loadedCount === videoFiles.length) {
                        updateUI();
                        statusText.textContent = `已加载 ${videoFiles.length} 个视频`;
                    }
                };
                video.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 更新 UI 状态
    function updateUI() {
        if (videos.length > 0) {
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

        videos.forEach((video, index) => {
            const card = document.createElement('div');
            card.className = 'video-card';

            const videoElement = document.createElement('video');
            videoElement.className = 'video-preview';
            videoElement.src = video.originalData;
            videoElement.controls = true;

            const info = document.createElement('div');
            info.className = 'video-info';

            const name = document.createElement('div');
            name.className = 'video-name';
            name.textContent = video.file.name;

            const size = document.createElement('div');
            size.className = 'video-size';
            size.textContent = `${video.originalWidth}×${video.originalHeight} - ${formatFileSize(video.file.size)}`;

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
            resizeBtn.addEventListener('click', () => resizeSingleVideo(index));

            const downloadBtn = document.createElement('button');
            downloadBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                下载
            `;
            downloadBtn.addEventListener('click', () => downloadSingleVideo(index));

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                移除
            `;
            removeBtn.addEventListener('click', () => {
                videos.splice(index, 1);
                updateUI();
                statusText.textContent = `已移除视频 "${video.file.name}"`;
            });

            actions.appendChild(resizeBtn);
            actions.appendChild(downloadBtn);
            actions.appendChild(removeBtn);

            card.appendChild(videoElement);
            card.appendChild(info);
            card.appendChild(actions);

            previewContainer.appendChild(card);
        });
    }

    // 调整单个视频
    function resizeSingleVideo(index) {
        const video = videos[index];
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

        const aspectRatio = video.originalWidth / video.originalHeight;

        if (method === 'fill') {
            // 拉伸填充
            newWidth = width || height || video.originalWidth;
            newHeight = height || width || video.originalHeight;
        } else {
            // 保持比例
            if (width && height) {
                if (method === 'cover') {
                    // 覆盖模式 - 裁剪以适应
                    newWidth = width;
                    newHeight = height;
                } else {
                    // 包含模式 - 完整显示
                    const widthRatio = width / video.originalWidth;
                    const heightRatio = height / video.originalHeight;
                    const ratio = method === 'contain' ? Math.min(widthRatio, heightRatio) : Math.max(widthRatio, heightRatio);
                    newWidth = video.originalWidth * ratio;
                    newHeight = video.originalHeight * ratio;
                }
            } else if (width) {
                newWidth = width;
                newHeight = width / aspectRatio;
            } else {
                newHeight = height;
                newWidth = height * aspectRatio;
            }
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // 处理视频帧
        const stream = canvas.captureStream(25); // 25fps
        const mediaRecorder = new MediaRecorder(stream, { mimeType: `video/${format}` });
        let chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: `video/${format}` });
            const newDataUrl = URL.createObjectURL(blob);

            // 更新视频数据
            video.resizedData = newDataUrl;
            video.resizedWidth = newWidth;
            video.resizedHeight = newHeight;
            video.resizedFile = new File([blob], 
                `${video.file.name.replace(/\.[^/.]+$/, '')}_${newWidth}x${newHeight}.${format}`, 
                { type: `video/${format}` });

            // 更新预览
            const previewVideo = previewContainer.querySelectorAll('.video-preview')[index];
            previewVideo.src = newDataUrl;

            // 更新尺寸信息
            const sizeInfo = previewContainer.querySelectorAll('.video-size')[index];
            sizeInfo.textContent = `${newWidth}×${newHeight} - ${formatFileSize(blob.size)}`;

            statusText.textContent = `视频 "${video.file.name}" 已调整为 ${newWidth}×${newHeight}`;
        };

        mediaRecorder.start();

        const drawFrame = () => {
            if (video.element.currentTime < video.element.duration) {
                ctx.drawImage(video.element, 0, 0, newWidth, newHeight);
                requestAnimationFrame(drawFrame);
            } else {
                mediaRecorder.stop();
            }
        };

        video.element.addEventListener('canplaythrough', () => {
            drawFrame();
        });
    }

    // 下载单个视频
    function downloadSingleVideo(index) {
        const video = videos[index];
        const dataUrl = video.resizedData || video.originalData;
        const fileName = video.resizedFile ? video.resizedFile.name : video.file.name;

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        statusText.textContent = `已下载视频 "${fileName}"`;
    }

    // 调整所有视频
    resizeAllBtn.addEventListener('click', function() {
        if (videos.length === 0) return;

        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        statusText.textContent = `正在调整 ${videos.length} 个视频...`;

        let processed = 0;

        videos.forEach((_, index) => {
            setTimeout(() => {
                resizeSingleVideo(index);
                processed++;
                progressBar.style.width = `${(processed / videos.length) * 100}%`;

                if (processed === videos.length) {
                    progressContainer.style.display = 'none';
                    statusText.textContent = `已完成调整 ${videos.length} 个视频`;
                }
            }, index * 100); // 添加小延迟防止 UI 阻塞
        });
    });

    // 下载所有视频
    downloadAllBtn.addEventListener('click', function() {
        if (videos.length === 0) return;

        if (zipAvailable && videos.length > 1) {
            // 使用本地 JSZip 库
            const zip = new JSZip();
            const videoFolder = zip.folder("resized_videos");
            let addedFiles = 0;

            statusText.textContent = `正在准备 ${videos.length} 个视频的 ZIP 下载...`;
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';

            videos.forEach((video, index) => {
                const dataUrl = video.resizedData || video.originalData;
                const fileName = video.resizedFile ? video.resizedFile.name : video.file.name;

                fetch(dataUrl)
                   .then(res => res.blob())
                   .then(blob => {
                        videoFolder.file(fileName, blob);
                        addedFiles++;
                        progressBar.style.width = `${(addedFiles / videos.length) * 100}%`;

                        if (addedFiles === videos.length) {
                            zip.generateAsync({ type: 'blob' })
                               .then(content => {
                                    const a = document.createElement('a');
                                    a.href = URL.createObjectURL(content);
                                    a.download = 'resized_videos.zip';
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);

                                    progressContainer.style.display = 'none';
                                    statusText.textContent = `已下载 ${videos.length} 个视频的 ZIP 文件`;
                                });
                        }
                    });
            });
        } else {
            // 没有 JSZip 或只有一个视频，逐个下载
            downloadVideosIndividually();
        }
    });

    // 如果没有 JSZip，逐个下载视频
    function downloadVideosIndividually() {
        let delay = 0;

        videos.forEach((_, index) => {
            setTimeout(() => {
                downloadSingleVideo(index);
            }, delay);
            delay += 300; // 每个下载间隔 300ms
        });
        statusText.textContent = `正在逐个下载 ${videos.length} 个视频...`;
    }

    // 清除所有视频
    clearAllBtn.addEventListener('click', function() {
        if (videos.length === 0) return;

        // 释放所有创建的 Blob URL
        videos.forEach(video => {
            if (video.resizedData) {
                URL.revokeObjectURL(video.resizedData);
            }
        });

        videos = [];
        updateUI();
        statusText.textContent = '已清除所有视频';
    });

    // 辅助函数：格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});