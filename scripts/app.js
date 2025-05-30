import { getDailyFortune } from "./core/fortune-core.js";

const domElements = {
    modal: document.getElementById("user-modal"),
    modalUsername: document.getElementById("modal-username"),
    modalBirthday: document.getElementById("modal-birhtday"),
    modalConfirmBtn: document.getElementById("modal-confirm-btn"),
    modalCancelBtn: document.getElementById("modal-cancel-btn"),

    generateBtn: document.getElementById('generate-btn'),
    level: document.getElementById('fortune-level'),
    adviceContainer: document.getElementById('advice-container'),
    pokemonImg: document.getElementById('pokemon-img'),
    pokemonName: document.getElementById('pokemon-name'),
    username_show: document.getElementById('username-show'),
};

window.getDailyFortune = getDailyFortune; // 控制台测试用

window.addEventListener("DOMContentLoaded", () => {
    const savedUsername = localStorage.getItem("username");
    const savedBirthday = localStorage.getItem("birthday");

    if(!savedUsername || !savedBirthday) {
        domElements.modal.classList.remove("hidden");
    }
})

domElements.modalConfirmBtn.addEventListener("click", () => {
    const inputUsername = domElements.modalUsername.value || "训练家";
    const inputBirthday = domElements.modalBirthday.value || "2000-01-01";

    localStorage.setItem("username", inputUsername);
    localStorage.setItem("birthday", inputBirthday);

    modal.classList.add("hidden");
});

domElements.modalCancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

domElements.generateBtn.addEventListener("click", () => {
    // 禁用按钮，防止重复点击
    domElements.generateBtn.disabled = true;
    domElements.generateBtn.textContent = 'loading...';
    
    // 清空建议容器内容（确保每次更新时是清空的）
    domElements.adviceContainer.innerHTML = "";

    const username = localStorage.getItem("username") || "训练家";
    const birthday = localStorage.getItem("birthday") || "2000-01-01";

    localStorage.setItem("username", username);
    localStorage.setItem("birthday", birthday);

    domElements.username_show.textContent = username;

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

                const pokemonMoveElement = document.createElement("div");
                pokemonMoveElement.className = "pokemon-move";
                pokemonMoveElement.innerHTML = `${advice.pokemon_move}`;
                domElements.adviceContainer.appendChild(pokemonMoveElement);
            }

            domElements.pokemonImg.src = result.pokemon.image;
            domElements.pokemonName.innerHTML = result.pokemon.name;
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