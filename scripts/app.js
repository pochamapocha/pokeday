const domElements = {
    level: document.getElementById('fortune-level'),
    adviceItems: document.querySelectorAll('.advice-item'),
    generateBtn: document.getElementById('generate-btn')
};

function generateFortune() {
    // 禁用按钮，防止重复点击
    domElements.generateBtn.disabled = true;
    domElements.generateBtn.textContent = 'loading...';

    // 模拟延迟加载
    setTimeout(() => {
        try {
            const result = getDailyFortune();

            domElements.level.textContent = `${result.level}`;
            domElements.adviceItems.forEach(item => {
                const type = item.dataset.type;
                item.textContent = `${type} : ${result.advice[type]}`;
            });
        } catch (error) {
            console.error('生成失败： ', error);
            domElements.level.textContent = '出错啦';
        }

        // 恢复按钮状态
        domElements.generateBtn.disabled = false;
        domElements.generateBtn.textContent = 'My PokeDay!';
    }, 500); // 模拟0.5秒延迟
}

function init() {
    domElements.generateBtn.disabled = false;
}

init();