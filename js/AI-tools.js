document.addEventListener('DOMContentLoaded', function () {
    // 工具卡片与功能区域切换
    const toolCards = document.querySelectorAll('.tool-card');
    const toolsGrid = document.querySelector('.tools-grid');

    toolCards.forEach(card => {
        card.addEventListener('click', function () {
            const toolCategory = this.dataset.category;
            
            // 隐藏所有工具卡片
            toolCards.forEach(c => c.style.display = 'none');
            
            // 显示对应的功能区域或创建新功能区域
            let toolSection = document.querySelector(`.tool-section[data-category="${toolCategory}"]`);
            
            if (!toolSection) {
                // 创建功能区域元素
                toolSection = document.createElement('div');
                toolSection.className = 'tool-section';
                toolSection.dataset.category = toolCategory;
                
                // 根据工具类型设置不同的功能布局
                switch (toolCategory) {
                    case '图像生成':
                        toolSection.innerHTML = `
                            <h2>AI图像生成</h2>
                            <input type="text" id="image-prompt" placeholder="输入图像描述">
                            <button id="generate-image-btn">生成图像</button>
                            <div id="image-result"></div>
                        `;
                        break;
                    case '视频编辑':
                        toolSection.innerHTML = `
                            <h2>AI视频编辑</h2>
                            <input type="file" id="video-upload" accept="video/*">
                            <select id="video-edit-type">
                                <option value="cut">剪辑</option>
                                <option value="subtitle">添加字幕</option>
                                <option value="enhance">画质增强</option>
                            </select>
                            <button id="edit-video-btn">处理视频</button>
                            <div id="video-result"></div>
                        `;
                        break;
                    case '音频处理':
                        toolSection.innerHTML = `
                            <h2>AI音频处理</h2>
                            <input type="file" id="audio-upload" accept="audio/*">
                            <select id="audio-edit-type">
                                <option value="noise">降噪</option>
                                <option value="pitch">变调</option>
                                <option value="transcribe">语音转文字</option>
                            </select>
                            <button id="process-audio-btn">处理音频</button>
                            <div id="audio-result"></div>
                        `;
                        break;
                    case '文本生成':
                        toolSection.innerHTML = `
                            <h2>AI文本生成</h2>
                            <textarea id="text-prompt" placeholder="输入文本提示" rows="4"></textarea>
                            <select id="text-type">
                                <option value="article">文章</option>
                                <option value="poem">诗歌</option>
                                <option value="story">故事</option>
                            </select>
                            <button id="generate-text-btn">生成文本</button>
                            <div id="text-result"></div>
                        `;
                        break;
                    case '数据分析':
                        toolSection.innerHTML = `
                            <h2>AI数据分析</h2>
                            <input type="file" id="data-upload" accept=".csv,.xlsx">
                            <select id="data-analysis-type">
                                <option value="visualization">数据可视化</option>
                                <option value="prediction">预测分析</option>
                                <option value="clustering">聚类分析</option>
                            </select>
                            <button id="analyze-data-btn">分析数据</button>
                            <div id="data-result"></div>
                        `;
                        break;
                    case '代码生成':
                        toolSection.innerHTML = `
                            <h2>AI代码生成</h2>
                            <textarea id="code-prompt" placeholder="输入代码需求描述" rows="4"></textarea>
                            <select id="programming-language">
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                            </select>
                            <button id="generate-code-btn">生成代码</button>
                            <div id="code-result"></div>
                        `;
                        break;
                }
                
                // 将新创建的功能区域添加到工具网格下方
                toolsGrid.parentNode.insertBefore(toolSection, toolsGrid.nextSibling);
                
                // 立即显示新创建的功能区域
                toolSection.style.display = 'block';
                
                // 为新创建的功能按钮添加事件监听
                addEventListenersToSection(toolSection);
            } else {
                // 如果功能区域已存在，显示它
                toolSection.style.display = 'block';
            }
            
            // 滚动到功能区域
            toolSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // 为功能区域添加事件监听器
    function addEventListenersToSection(section) {
        const category = section.dataset.category;
        
        // 图像生成功能
        if (category === '图像生成') {
            document.getElementById('generate-image-btn').addEventListener('click', function() {
                const prompt = document.getElementById('image-prompt').value;
                if (prompt) {
                    // 模拟图像生成过程
                    const resultDiv = document.getElementById('image-result');
                    resultDiv.innerHTML = '<p>正在生成图像，请稍候...</p>';
                    
                    setTimeout(() => {
                        // 显示模拟生成的图像
                        resultDiv.innerHTML = `
                            <img src="https://source.unsplash.com/random/600x400/?${prompt}" alt="生成的图像">
                            <p>图像生成完成！</p>
                        `;
                    }, 2000);
                } else {
                    alert('请输入图像描述');
                }
            });
        }
        // 视频编辑功能
        else if (category === '视频编辑') {
            document.getElementById('edit-video-btn').addEventListener('click', function() {
                const fileInput = document.getElementById('video-upload');
                if (fileInput.files.length > 0) {
                    const resultDiv = document.getElementById('video-result');
                    resultDiv.innerHTML = '<p>正在处理视频，请稍候...</p>';
                    
                    setTimeout(() => {
                        resultDiv.innerHTML = `
                            <video controls width="100%">
                                <source src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" type="video/mp4">
                                您的浏览器不支持视频播放
                            </video>
                            <p>视频处理完成！</p>
                        `;
                    }, 2000);
                } else {
                    alert('请上传视频文件');
                }
            });
        }
        // 音频处理功能
        else if (category === '音频处理') {
            document.getElementById('process-audio-btn').addEventListener('click', function() {
                const fileInput = document.getElementById('audio-upload');
                if (fileInput.files.length > 0) {
                    const resultDiv = document.getElementById('audio-result');
                    resultDiv.innerHTML = '<p>正在处理音频，请稍候...</p>';
                    
                    setTimeout(() => {
                        let resultContent = '';
                        const editType = document.getElementById('audio-edit-type').value;
                        
                        if (editType === 'transcribe') {
                            resultContent = `
                                <p>音频转文字结果：</p>
                                <textarea rows="4" style="width: 100%; margin-top: 10px;">欢迎使用AI音频处理工具！这是从音频中提取的文字内容。</textarea>
                            `;
                        } else {
                            resultContent = `
                                <audio controls style="width: 100%;">
                                    <source src="https://file-examples.com/storage/fe8578c49e530db5788f541/2017/11/file_example_MP3_700KB.mp3" type="audio/mpeg">
                                    您的浏览器不支持音频播放
                                </audio>
                                <p>音频处理完成！</p>
                            `;
                        }
                        
                        resultDiv.innerHTML = resultContent;
                    }, 2000);
                } else {
                    alert('请上传音频文件');
                }
            });
        }
        // 文本生成功能
        else if (category === '文本生成') {
            document.getElementById('generate-text-btn').addEventListener('click', function() {
                const prompt = document.getElementById('text-prompt').value;
                const textType = document.getElementById('text-type').value;
                
                if (prompt) {
                    const resultDiv = document.getElementById('text-result');
                    resultDiv.innerHTML = '<p>正在生成文本，请稍候...</p>';
                    
                    setTimeout(() => {
                        let generatedText = '';
                        
                        switch (textType) {
                            case 'article':
                                generatedText = `
                                    <h3>${prompt} - 文章</h3>
                                    <p>关于${prompt}的文章内容。这是一篇由AI生成的文章，内容围绕您提供的主题展开。文章结构完整，包含引言、主体和结论部分。</p>
                                    <p>引言部分介绍了${prompt}的基本概念和背景。主体部分详细探讨了${prompt}的各个方面，包括其特点、优势以及应用场景。结论部分总结了${prompt}的重要性和未来发展潜力。</p>
                                `;
                                break;
                            case 'poem':
                                generatedText = `
                                    <h3>${prompt} - 诗歌</h3>
                                    <p>${prompt}如梦<br>飘渺而朦胧<br>心随风动<br>情意浓浓</p>
                                    <p>月光下的${prompt}<br>影子拉长<br>思绪万千<br>夜色正浓</p>
                                `;
                                break;
                            case 'story':
                                generatedText = `
                                    <h3>${prompt} - 故事</h3>
                                    <p>从前，有一个关于${prompt}的故事。故事的主角是一个名叫小明的年轻人，他在一次偶然的机会中发现了${prompt}的秘密。</p>
                                    <p>这个秘密改变了他的一生，也让他踏上了一段充满冒险和挑战的旅程。在旅途中，他遇到了各种各样的人，经历了许多意想不到的事情。</p>
                                    <p>最终，小明不仅揭开了${prompt}的神秘面纱，还学会了珍惜身边的人和事，明白了生活的真谛。</p>
                                `;
                                break;
                        }
                        
                        resultDiv.innerHTML = `
                            <div style="white-space: pre-wrap; line-height: 1.6;">${generatedText}</div>
                        `;
                    }, 2000);
                } else {
                    alert('请输入文本提示');
                }
            });
        }
        // 数据分析功能
        else if (category === '数据分析') {
            document.getElementById('analyze-data-btn').addEventListener('click', function() {
                const fileInput = document.getElementById('data-upload');
                if (fileInput.files.length > 0) {
                    const resultDiv = document.getElementById('data-result');
                    resultDiv.innerHTML = '<p>正在分析数据，请稍候...</p>';
                    
                    setTimeout(() => {
                        let resultContent = '';
                        const analysisType = document.getElementById('data-analysis-type').value;
                        
                        if (analysisType === 'visualization') {
                            resultContent = `
                                <p>数据可视化结果：</p>
                                <div style="height: 300px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-top: 10px;">
                                    <img src="https://via.placeholder.com/600x300?text=Data+Visualization" alt="数据可视化图表">
                                </div>
                            `;
                        } else if (analysisType === 'prediction') {
                            resultContent = `
                                <p>预测分析结果：</p>
                                <div style="margin-top: 10px;">
                                    <p>基于您提供的数据，预测模型显示未来趋势如下：</p>
                                    <ul style="margin-top: 10px; padding-left: 20px;">
                                        <li>趋势1：预计增长20%</li>
                                        <li>趋势2：保持稳定</li>
                                        <li>趋势3：小幅下降</li>
                                    </ul>
                                    <p style="margin-top: 10px;">预测准确度：85%</p>
                                </div>
                            `;
                        } else if (analysisType === 'clustering') {
                            resultContent = `
                                <p>聚类分析结果：</p>
                                <div style="margin-top: 10px;">
                                    <p>数据被分为3个主要聚类：</p>
                                    <ul style="margin-top: 10px; padding-left: 20px;">
                                        <li>聚类1：包含${Math.floor(Math.random() * 50) + 20}%的数据点</li>
                                        <li>聚类2：包含${Math.floor(Math.random() * 50) + 20}%的数据点</li>
                                        <li>聚类3：包含${Math.floor(Math.random() * 20) + 10}%的数据点</li>
                                    </ul>
                                    <p style="margin-top: 10px;">聚类质量评分：${(Math.random() * 0.4 + 0.6).toFixed(2)}</p>
                                </div>
                            `;
                        }
                        
                        resultDiv.innerHTML = resultContent;
                    }, 2000);
                } else {
                    alert('请上传数据文件');
                }
            });
        }
        // 代码生成功能
        else if (category === '代码生成') {
            document.getElementById('generate-code-btn').addEventListener('click', function() {
                const prompt = document.getElementById('code-prompt').value;
                const language = document.getElementById('programming-language').value;
                
                if (prompt) {
                    const resultDiv = document.getElementById('code-result');
                    resultDiv.innerHTML = '<p>正在生成代码，请稍候...</p>';
                    
                    setTimeout(() => {
                        let codeSample = '';
                        
                        switch (language) {
                            case 'python':
                                codeSample = `
                                    # ${prompt} - Python代码示例

                                    def main():
                                        # 这是一个示例函数，实现了${prompt}功能
                                        print("Hello World! This is a Python code generated by AI.")
                                        
                                        # 示例代码逻辑
                                        data = [1, 2, 3, 4, 5]
                                        result = [x * 2 for x in data if x % 2 == 0]
                                        print(f"处理结果: {result}")

                                    if __name__ == "__main__":
                                        main()
                                `;
                                break;
                            case 'javascript':
                                codeSample = `
                                    // ${prompt} - JavaScript代码示例

                                    function main() {
                                        // 这是一个示例函数，实现了${prompt}功能
                                        console.log("Hello World! This is a JavaScript code generated by AI.");
                                        
                                        // 示例代码逻辑
                                        const data = [1, 2, 3, 4, 5];
                                        const result = data.filter(x => x % 2 === 0).map(x => x * 2);
                                        console.log("处理结果:", result);
                                    }

                                    main();
                                `;
                                break;
                            case 'java':
                                codeSample = `
                                    // ${prompt} - Java代码示例

                                    public class Main {
                                        public static void main(String[] args) {
                                            // 这是一个示例程序，实现了${prompt}功能
                                            System.out.println("Hello World! This is a Java code generated by AI.");
                                            
                                            // 示例代码逻辑
                                            int[] data = {1, 2, 3, 4, 5};
                                            int[] result = new int[data.length];
                                            
                                            for (int i = 0; i < data.length; i++) {
                                                if (data[i] % 2 == 0) {
                                                    result[i] = data[i] * 2;
                                                }
                                            }
                                            
                                            System.out.print("处理结果: ");
                                            for (int num : result) {
                                                if (num != 0) System.out.print(num + " ");
                                            }
                                        }
                                    }
                                `;
                                break;
                            case 'cpp':
                                codeSample = `
                                    // ${prompt} - C++代码示例

                                    #include <iostream>
                                    #include <vector>

                                    using namespace std;

                                    int main() {
                                        // 这是一个示例程序，实现了${prompt}功能
                                        cout << "Hello World! This is a C++ code generated by AI." << endl;
                                        
                                        // 示例代码逻辑
                                        vector<int> data = {1, 2, 3, 4, 5};
                                        vector<int> result;
                                        
                                        for (int num : data) {
                                            if (num % 2 == 0) {
                                                result.push_back(num * 2);
                                            }
                                        }
                                        
                                        cout << "处理结果: ";
                                        for (int num : result) {
                                            cout << num << " ";
                                        }
                                        cout << endl;

                                        return 0;
                                    }
                                `;
                                break;
                        }
                        
                        // 格式化代码显示
                        const formattedCode = codeSample
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
                            .replace(/  /g, '&nbsp;&nbsp;');
                        
                        resultDiv.innerHTML = `
                            <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; line-height: 1.5;">
                                <code style="font-family: 'Courier New', monospace; white-space: pre;">${formattedCode}</code>
                            </pre>
                            <p style="margin-top: 10px; text-align: right;">
                                <button onclick="copyToClipboard(this)" style="padding: 5px 10px; background: #4361ee; color: white; border: none; border-radius: 3px; cursor: pointer;">
                                    复制代码
                                </button>
                            </p>
                        `;
                        
                        // 添加复制代码功能
                        const copyBtn = resultDiv.querySelector('button');
                        copyBtn.addEventListener('click', function() {
                            const code = resultDiv.querySelector('code').textContent;
                            navigator.clipboard.writeText(code).then(() => {
                                this.textContent = '已复制!';
                                setTimeout(() => {
                                    this.textContent = '复制代码';
                                }, 2000);
                            }).catch(err => {
                                console.error('复制失败:', err);
                            });
                        });
                    }, 2000);
                } else {
                    alert('请输入代码需求描述');
                }
            });
        }
    }

    // 工具分类导航
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // 移除所有按钮的 active 类
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // 添加 active 类到当前点击的按钮
            this.classList.add('active');
            
            const category = this.textContent.trim();
            
            if (category === '工具集合') {
                // 显示所有工具卡片，隐藏所有功能区域
                toolCards.forEach(card => card.style.display = 'flex');
                document.querySelectorAll('.tool-section').forEach(section => {
                    section.style.display = 'none';
                });
            } else {
                // 隐藏所有工具卡片，显示对应分类的卡片
                toolCards.forEach(card => {
                    const cardCategory = card.dataset.category;
                    if (cardCategory === category) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // 隐藏所有功能区域
                document.querySelectorAll('.tool-section').forEach(section => {
                    section.style.display = 'none';
                });
            }
        });
    });

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
    allToolsButton.setAttribute('aria-label', '返回工具列表');
    darkModeToggle.setAttribute('aria-label', '切换黑暗模式');
    buttonGroup.setAttribute('role', 'toolbar');
});