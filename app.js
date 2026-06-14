// ===== 宠面 - 主交互逻辑 =====

// 文件上传相关
const fileInput = document.getElementById('fileInput');
const uploadContent = document.getElementById('uploadContent');
const uploadPreview = document.getElementById('uploadPreview');
const previewImage = document.getElementById('previewImage');
const analyzeBtn = document.getElementById('analyzeBtn');
const resetBtn = document.getElementById('resetBtn');
const analysisResult = document.getElementById('analysisResult');

let selectedFile = null;

// 上传文件变化
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadContent.style.display = 'none';
            uploadPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// 拖拽上传
const uploadArea = document.getElementById('uploadArea');
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.background = '#FFF5F0';
});
uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
});
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadContent.style.display = 'none';
            uploadPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// 重新选择
resetBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    uploadPreview.style.display = 'none';
    uploadContent.style.display = 'block';
    analysisResult.style.display = 'none';
});

// 开始分析（调用 Hugging Face 免费 API）
analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    // 显示结果区域
    analysisResult.style.display = 'block';
    analysisResult.scrollIntoView({ behavior: 'smooth' });
    
    // 获取结果元素
    const breedResult = document.getElementById('breedResult');
    const colorResult = document.getElementById('colorResult');
    const faceResult = document.getElementById('faceResult');
    const personalityResult = document.getElementById('personalityResult');
    
    // 显示加载状态
    breedResult.textContent = '📊 调用 AI 识别中...';
    colorResult.textContent = '🎨 分析毛色中...';
    faceResult.textContent = '😺 解读面相中...';
    personalityResult.textContent = '💭 分析性格中...';
    
    // 禁用按钮
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⏳ AI 识别中...';
    
    try {
        // 将图片转为 base64
        const reader = new FileReader();
        const base64Image = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(selectedFile);
        });
        
        // 调用后端 API（Hugging Face）
        const response = await fetch('/api/pet-identify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image
            })
        });
        
        if (!response.ok) {
            throw new Error('API 调用失败');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // 显示真实结果
            breedResult.textContent = result.data.breed;
            colorResult.textContent = result.data.color;
            faceResult.textContent = result.data.face;
            personalityResult.textContent = result.data.personality;
            
            // 添加置信度显示
            if (result.data.confidence) {
                const confidence = Math.round(result.data.confidence * 100);
                breedResult.textContent += ` (置信度: ${confidence}%)`;
            }
            
            // 如果有提示（比如使用了模拟数据）
            if (result.note) {
                console.log('提示:', result.note);
            }
        } else {
            throw new Error(result.error || '分析失败');
        }
        
        // 添加动画效果
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'scale(1.05)';
                card.style.background = '#FFF5F0';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                    card.style.background = '';
                }, 300);
            }, index * 100);
        });
        
    } catch (error) {
        console.error('分析失败:', error);
        breedResult.textContent = '❌ 分析失败';
        colorResult.textContent = '请重试或检查网络连接';
        faceResult.textContent = '';
        personalityResult.textContent = '';
        
        alert('AI 识别失败，请重试。如果持续失败，可能是 Hugging Face API 暂时不可用。');
    } finally {
        // 恢复按钮
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '🔍 重新分析';
    }
});

// FAQ 折叠
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        const answer = item.querySelector('.faq-answer');
        const isOpen = answer.style.display === 'block';
        // 关闭所有
        document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
        document.querySelectorAll('.faq-question').forEach(q => q.style.borderBottom = '');
        // 切换当前
        if (!isOpen) {
            answer.style.display = 'block';
            item.querySelector('.faq-question').style.borderBottom = 'none';
        }
    });
    // 默认隐藏答案
    const answer = item.querySelector('.faq-answer');
    answer.style.display = 'none';
});

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
    } else {
        navbar.style.boxShadow = '';
    }
});

// 数字动画
function animateNumbers() {
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = stat.textContent;
        const isFloat = target.includes('.');
        const numTarget = parseFloat(target.replace(/,/g, ''));
        let current = 0;
        const increment = numTarget / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= numTarget) {
                current = numTarget;
                clearInterval(timer);
            }
            stat.textContent = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
        }, 30);
    });
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
    // 延迟执行数字动画
    setTimeout(animateNumbers, 500);
    
    // 添加页面加载动画
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 平滑滚动（兼容不支持 scrollBehavior 的浏览器）
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
