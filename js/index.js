        // 简单的分类筛选功能
        document.addEventListener('DOMContentLoaded', function () {
            const categoryBtns = document.querySelectorAll('.category-btn');
            const toolCards = document.querySelectorAll('.tool-card');

            categoryBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    // 更新活动按钮样式
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    const category = this.textContent.trim();

                    // 筛选工具卡片
                    toolCards.forEach(card => {
                        if (category === '全部工具') {
                            card.style.display = 'flex';
                        } else {
                            const cardCategory = card.classList.contains('image') ? '图片处理' :
                                card.classList.contains('video') ? '视频处理' :
                                    card.classList.contains('audio') ? '音频处理' :
                                        card.classList.contains('document') ? '文档转换' :
                                            card.classList.contains('archive') ? '文件压缩' :
                                                card.classList.contains('ai') ? 'AI工具' : '';
                            if (cardCategory === category) {
                                card.style.display = 'flex';
                            } else {
                                card.style.display = 'none';
                            }
                        }
                    });
                });
            });

            // 可以在这里添加更多交互功能
            console.log('媒体工具中心已加载，欢迎使用！');
        });

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
