

document.addEventListener('DOMContentLoaded', function () {
// 检查 JSZip 是否加载成功
const zipAvailable = typeof JSZip !== 'undefined';
if (!zipAvailable) {
    document.getElementById('noZipWarning').style.display = 'block';
}

    // 功能说明面板的展开/折叠功能
    const instructionsToggle = document.getElementById('instructionsToggle');
    const instructionsContent = document.getElementById('instructionsContent');

    instructionsToggle.addEventListener('click', function () {
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
    const convertType = document.getElementById('convertType');
    const convertAllBtn = document.getElementById('convertAllBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress');
    const statusText = document.getElementById('statusText');
    const noZipWarning = document.getElementById('noZipWarning');

    let files = [];

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
    function handleFiles(selectedFiles) {
        const validFiles = Array.from(selectedFiles).filter(file => {
            const validExtensions = ['.pdf', '.docx', '.xlsx', '.pptx'];
            const fileExtension = file.name.slice((Math.max(0, file.name.lastIndexOf('.')) || Infinity) + 1).toLowerCase();
            return validExtensions.includes(`.${fileExtension}`);
        });

        if (validFiles.length === 0) {
            statusText.textContent = '没有选择有效的文件';
            return;
        }

        statusText.textContent = `正在加载 ${validFiles.length} 个文件...`;

        let loadedCount = 0;
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                files.push({
                    file: file,
                    originalData: e.target.result
                });

                loadedCount++;
                if (loadedCount === validFiles.length) {
                    updateUI();
                    statusText.textContent = `已加载 ${validFiles.length} 个文件`;
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // 更新 UI 状态
    function updateUI() {
        if (files.length > 0) {
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

        files.forEach((fileObj, index) => {
            const card = document.createElement('div');
            card.className = 'pdf-card';

            const previewElement = document.createElement('div');
            previewElement.className = 'pdf-preview';
            previewElement.textContent = '文件预览';

            const info = document.createElement('div');
            info.className = 'pdf-info';

            const name = document.createElement('div');
            name.className = 'pdf-name';
            name.textContent = fileObj.file.name;

            const size = document.createElement('div');
            size.className = 'pdf-size';
            size.textContent = `${formatFileSize(fileObj.file.size)}`;

            const actions = document.createElement('div');
            actions.className = 'action-buttons small';

            const convertBtn = document.createElement('button');
            convertBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 5px;">
                    <path d="M21 3H3v18h18V3z"></path>
                    <path d="M21 12H9"></path>
                    <path d="M12 3v18"></path>
                </svg>
                转换
            `;
            convertBtn.addEventListener('click', () => convertSingleFile(index));

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
                statusText.textContent = `已移除文件 "${fileObj.file.name}"`;
            });

            actions.appendChild(convertBtn);
            actions.appendChild(downloadBtn);
            actions.appendChild(removeBtn);

            card.appendChild(previewElement);
            card.appendChild(info);
            card.appendChild(actions);

            previewContainer.appendChild(card);
        });
    }

    // 简化的文件类型检测函数
    function isPDFFile(file) {
        // 检查文件扩展名
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'pdf') {
            console.log(`文件 ${file.name} 通过扩展名检测为 PDF`);
            return true;
        }
        
        // 检查 MIME 类型
        if (file.type === 'application/pdf') {
            console.log(`文件 ${file.name} 通过 MIME 类型检测为 PDF`);
            return true;
        }
        
        console.log(`文件 ${file.name} 未通过 PDF 检测`);
        return false;
    }

    // 转换单个文件
    async function convertSingleFile(index) {
        const fileObj = files[index];
        const type = convertType.value;

        // 特殊处理 PDF 合并 - 不应该在这里处理
        if (type === 'pdfMerge') {
            statusText.textContent = 'PDF 合并是批量操作，请使用"全部转换"按钮';
            return;
        }

        statusText.textContent = `文件 "${fileObj.file.name}" 正在转换为 ${type}...`;

        try {
            let convertedData;
            let convertedName;

            switch (type) {
                case 'pdfToWord':
                    // 简单示例，使用 pdf-parse 提取文本后创建 Word
                    try {
                        const pdfText = await pdfParse(fileObj.originalData);
                        const docx = await mammoth.createEmptyDocx();
                        const { value } = await mammoth.convertToHtml({ text: pdfText.text });
                        const paragraph = docx.addParagraph();
                        paragraph.addRun(value);
                        convertedData = await docx.save();
                        convertedName = `${fileObj.file.name.replace(/\.[^/.]+$/, '')}_converted.docx`;
                    } catch (e) {
                        throw new Error('PDF转Word仅支持文本提取，复杂格式可能无法保留');
                    }
                    break;
                case 'pdfToExcel':
                    // 简单示例，使用 pdf-parse 提取文本后创建 Excel
                    try {
                        const pdfTextExcel = await pdfParse(fileObj.originalData);
                        const workbook = XLSX.utils.book_new();
                        const worksheet = XLSX.utils.aoa_to_sheet([[pdfTextExcel.text]]);
                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
                        convertedData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                        convertedName = `${fileObj.file.name.replace(/\.[^/.]+$/, '')}_converted.xlsx`;
                    } catch (e) {
                        throw new Error('PDF转Excel仅支持简单文本表格，复杂格式可能无法保留');
                    }
                    break;
                case 'pdfToPPT':
                    // 简单示例，使用 pdf-parse 提取文本后创建 PPT
                    try {
                        const pdfTextPPT = await pdfParse(fileObj.originalData);
                        const pptx = new PptxGenJS();
                        const slide = pptx.addSlide();
                        slide.addText(pdfTextPPT.text);
                        convertedData = await pptx.write('arraybuffer');
                        convertedName = `${fileObj.file.name.replace(/\.[^/.]+$/, '')}_converted.pptx`;
                    } catch (e) {
                        throw new Error('PDF转PPT仅支持文本提取，复杂格式可能无法保留');
                    }
                    break;
                case 'wordToPdf':
                    const docxArrayBuffer = fileObj.originalData;
                    const result = await mammoth.convertToHtml({ arrayBuffer: docxArrayBuffer });
                    const pdfDoc = await PDFLib.PDFDocument.create();
                    const page = pdfDoc.addPage();
                    const { width, height } = page.getSize();
                    const text = result.value;
                    const fontSize = 12;
                    const textWidth = pdfDoc.defaultFont.widthOfTextAtSize(text, fontSize);
                    const textHeight = pdfDoc.defaultFont.heightAtSize(fontSize);
                    page.drawText(text, {
                        x: (width - textWidth) / 2,
                        y: height - textHeight - 50,
                        size: fontSize
                    });
                    convertedData = await pdfDoc.save();
                    convertedName = `${fileObj.file.name.replace(/\.[^/.]+$/, '')}_converted.pdf`;
                    break;
                case 'excelToPdf':
                    // 简单示例，使用 xlsx 读取内容后创建 PDF
                    try {
                        const workbookExcel = XLSX.read(fileObj.originalData, { type: 'array' });
                        const worksheetExcel = workbookExcel.Sheets[workbookExcel.SheetNames[0]];
                        const dataExcel = XLSX.utils.sheet_to_csv(worksheetExcel);
                        const pdfDocExcel = await PDFLib.PDFDocument.create();
                        const pageExcel = pdfDocExcel.addPage();
                        pageExcel.drawText(dataExcel, { x: 50, y: 50 });
                        convertedData = await pdfDocExcel.save();
                        convertedName = `${fileObj.file.name.replace(/\.[^/.]+$/, '')}_converted.pdf`;
                    } catch (e) {
                        throw new Error('Excel转PDF仅支持简单表格，复杂格式可能无法保留');
                    }
                    break;
                case 'pdfSplit':
                    const pdfDocToSplit = await PDFLib.PDFDocument.load(fileObj.originalData);
                    const pageIndices = pdfDocToSplit.getPageIndices();
                    if (zipAvailable) {
                        const zip = new JSZip();
                        for (const index of pageIndices) {
                            const newPdfDoc = await PDFLib.PDFDocument.create();
                            const [page] = await newPdfDoc.copyPages(pdfDocToSplit, [index]);
                            newPdfDoc.addPage(page);
                            const splitPdfData = await newPdfDoc.save();
                            zip.file(`${fileObj.file.name.replace(/\.[^/.]+$/, '')}_page_${index + 1}.pdf`, splitPdfData);
                        }
                        convertedData = await zip.generateAsync({ type: 'blob' });
                        convertedName = `${fileObj.file.name.replace(/\.[^/.]+$/, '')}_split.zip`;
                    } else {
                        throw new Error('PDF拆分需要JSZip库支持，请确保网络连接正常');
                    }
                    break;
                case 'pdfCompress':
                    throw new Error('PDF压缩功能无法在前端完全实现，请使用专业软件或在线转换工具');
                case 'pptToPdf':
                    throw new Error('PPT转PDF功能无法在前端完全实现，请使用专业软件或在线转换工具');
                default:
                    throw new Error(`不支持的转换类型: ${type}`);
            }

            if (convertedData) {
                fileObj.convertedData = new Blob([convertedData], { type: getFileType(convertedName) });
                fileObj.convertedName = convertedName;
                statusText.textContent = `文件 "${fileObj.file.name}" 已成功转换为 ${type}`;
            }

        } catch (error) {
            statusText.textContent = `转换失败: ${error.message}`;
            console.error(error);
        }
    }

    // 处理批量操作（如 PDF 合并）
    async function handleBatchOperation() {
        const type = convertType.value;
        
        if (type !== 'pdfMerge') {
            // 如果不是批量操作，按原来的方式处理
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            
            let completed = 0;
            files.forEach((_, index) => {
                convertSingleFile(index).then(() => {
                    completed++;
                    const progress = (completed / files.length) * 100;
                    progressBar.style.width = `${progress}%`;
                    
                    if (completed === files.length) {
                        setTimeout(() => {
                            progressContainer.style.display = 'none';
                        }, 500);
                    }
                });
            });
            return;
        }
        
        // 处理 PDF 合并
        statusText.textContent = '正在准备合并 PDF 文件...';
        
        try {
            // 使用简化的文件类型检测方法
            const pdfFiles = files.filter(fileObj => isPDFFile(fileObj.file));
            
            console.log(`检测到 ${pdfFiles.length} 个 PDF 文件`);
            pdfFiles.forEach(fileObj => {
                console.log(`- ${fileObj.file.name}`);
            });
            
            if (pdfFiles.length < 2) {
                throw new Error(`PDF合并需要至少选择两个PDF文件，当前仅检测到 ${pdfFiles.length} 个`);
            }
            
            // 开始合并
            const mergedPdfDoc = await PDFLib.PDFDocument.create();
            let pageCount = 0;
            
            for (const pdfFile of pdfFiles) {
                statusText.textContent = `正在合并 ${pdfFile.file.name} (${pageCount + 1}/${pdfFiles.length})...`;
                const pdfDoc = await PDFLib.PDFDocument.load(pdfFile.originalData);
                const pages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
                pages.forEach(page => mergedPdfDoc.addPage(page));
                pageCount++;
            }
            
            const mergedData = await mergedPdfDoc.save();
            const mergedBlob = new Blob([mergedData], { type: 'application/pdf' });
            
            // 创建一个新的 "虚拟" 文件对象来存储合并后的结果
            const mergedFileObj = {
                file: { name: 'merged.pdf' },
                convertedData: mergedBlob,
                convertedName: 'merged.pdf'
            };
            
            // 清空现有文件，只保留合并后的文件
            files = [mergedFileObj];
            
            // 更新 UI
            updateUI();
            statusText.textContent = `成功合并 ${pdfFiles.length} 个 PDF 文件`;
            
        } catch (error) {
            statusText.textContent = `合并失败: ${error.message}`;
            console.error(error);
        }
    }

    // 下载单个文件
    function downloadSingleFile(index) {
        const fileObj = files[index];
        if (!fileObj.convertedData) {
            statusText.textContent = '请先执行转换操作';
            return;
        }
        
        const dataUrl = URL.createObjectURL(fileObj.convertedData);
        const fileName = fileObj.convertedName;

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        statusText.textContent = `已下载文件 "${fileName}"`;
    }

    // 下载所有文件
    async function downloadAllFiles() {
        if (!files.some(f => f.convertedData)) {
            statusText.textContent = '没有可下载的转换文件，请先执行转换操作';
            return;
        }
        
        try {
            if (zipAvailable) {
                const zip = new JSZip();
                files.forEach(fileObj => {
                    if (fileObj.convertedData) {
                        zip.file(fileObj.convertedName, fileObj.convertedData);
                    }
                });
                const zipData = await zip.generateAsync({ type: 'blob' });
                const dataUrl = URL.createObjectURL(zipData);
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'converted_files.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                statusText.textContent = `已下载所有转换文件`;
            } else {
                // 逐个下载
                let delay = 0;
                const convertedFiles = files.filter(f => f.convertedData);
                convertedFiles.forEach((fileObj, idx) => {
                    setTimeout(() => {
                        const dataUrl = URL.createObjectURL(fileObj.convertedData);
                        const a = document.createElement('a');
                        a.href = dataUrl;
                        a.download = fileObj.convertedName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        if (idx === convertedFiles.length - 1) {
                            statusText.textContent = `已逐个下载所有转换文件`;
                        }
                    }, delay);
                    delay += 500;
                });
            }
        } catch (error) {
            statusText.textContent = `下载失败: ${error.message}`;
            console.error(error);
        }
    }

    // 清除所有文件
    function clearAllFiles() {
        files = [];
        updateUI();
        statusText.textContent = '所有文件已清除';
    }

    // 辅助函数：获取文件类型
    function getFileType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        switch (ext) {
            case 'pdf':
                return 'application/pdf';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'xlsx':
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'pptx':
                return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
            case 'zip':
                return 'application/zip';
            default:
                return 'application/octet-stream';
        }
    }

    // 辅助函数：格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 绑定按钮事件
    convertAllBtn.addEventListener('click', handleBatchOperation);
    downloadAllBtn.addEventListener('click', downloadAllFiles);
    clearAllBtn.addEventListener('click', clearAllFiles);

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
});