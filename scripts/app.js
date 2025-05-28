import { getDailyFortune } from "./core/fortune-core.js";

window.getDailyFortune = getDailyFortune; // 控制台测试用

const domElements = {
    generateBtn: document.getElementById('generate-btn'),
    username: document.getElementById('username'),
    birthday: document.getElementById('birthday'),
    level: document.getElementById('fortune-level'),
    adviceContainer: document.getElementById('advice-container'),
    pokemonImg: document.getElementById('pokemon-img')
};

domElements.generateBtn.addEventListener("click", () => {
    // 禁用按钮，防止重复点击
    domElements.generateBtn.disabled = true;
    domElements.generateBtn.textContent = 'loading...';
    
    // 清空建议容器内容（确保每次更新时是清空的）
    domElements.adviceContainer.innerHTML = "";

    const username = domElements.username.value || "匿名";
    const birthday = domElements.birthday.value || "2000-01-01";

    const result = getDailyFortune(username, birthday);

    // 模拟延迟加载
    setTimeout(() => {
        try {
            domElements.level.textContent = `${result.level}`;

            for(const category in result.advice) {
                const advice = result.advice[category];
                const adviceElement = document.createElement("div");
                adviceElement.className = "advice-item";
                adviceElement.innerHTML = `<strong>${category}</strong> (${advice.level}): ${advice.text}`;
                domElements.adviceContainer.appendChild(adviceElement);
            }

            domElements.pokemonImg.src = result.pokemon.image;
        } catch (error) {
            console.error('生成失败： ', error);
            domElements.level.textContent = '出错啦';
        }

        // 恢复按钮状态
        domElements.generateBtn.disabled = false;
        domElements.generateBtn.textContent = 'My PokeDay!';
    }, 500); // 模拟0.5秒延迟
});

// function init() {
//     domElements.generateBtn.disabled = false;
// }

// init();