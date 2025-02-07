const domElements = {
    level: document.getElementById('fortune-level'),
    adviceContainer: document.getElementById('advice-container'),
    generateBtn: document.getElementById('generate-btn'),
    pokemonImg: document.getElementById('pokemon-img')
};

function generateFortune() {
    // 禁用按钮，防止重复点击
    domElements.generateBtn.disabled = true;
    domElements.generateBtn.textContent = 'loading...';

    // 清空建议容器内容（确保每次更新时是清空的）
    domElements.adviceContainer.innerHTML = "";

    // 模拟延迟加载
    setTimeout(() => {
        try {
            const result = getDailyFortune();

            domElements.level.textContent = `${result.level}`;

            // domElements.adviceItems.forEach(item => {
            //     const type = item.dataset.type;
            //     item.textContent = `${result.advice[type][1]} : ${result.advice[type][0]}`;
            // });

            for(const category in result.advice) {
                const adviceElement = document.createElement("div");
                adviceElement.class = "advice-item";
                adviceElement.innerHTML = `<strong>${category} : </strong> ${result.advice[category]}`;
                domElements.adviceContainer.appendChild(adviceElement);
            }

            domElements.pokemonImg.src = `${result.pokemon.image}`;
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