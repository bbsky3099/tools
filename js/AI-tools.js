document.addEventListener('DOMContentLoaded', function () {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // 移除所有按钮的 active 类
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // 添加 active 类到当前点击的按钮
            this.classList.add('active');

            const category = this.textContent.trim();

            if (category === 'AI集合') {
                toolCards.forEach(card => card.style.display = 'flex');
            } else {
                toolCards.forEach(card => {
                    const cardTitle = card.querySelector('.tool-title').textContent.trim();
                    if (cardTitle.includes(category)) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    });

    // 为每个工具卡片添加点击事件监听器
    toolCards.forEach(card => {
        card.addEventListener('click', function () {
            this.style.display = 'none';
        });
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
allToolsButton.textContent = '全部工具';
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