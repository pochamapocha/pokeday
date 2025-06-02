import { getDailyFortune } from "./core/fortune-core.js";
import { GOOD_FORTUNE_LEVELS, BAD_FORTUNE_LEVELS } from "./config/fortune-levels.js";

const domElements = {
    loadingScreen: document.getElementById("initial-loading"),
    editUserBtn: document.getElementById("setting-btn"),

    modal: document.getElementById("modal"),
    modalUsername: document.getElementById("modal-username"),
    modalBirthday: document.getElementById("modal-birthday"),
    modalConfirmBtn: document.getElementById("modal-confirm-btn"),
    modalCancelBtn: document.getElementById("modal-cancel-btn"),

    generateBtn: document.getElementById('generate-btn'),
    level: document.getElementById('fortune-level'),
    pokemonImg: document.getElementById('pokemon-img'),
    pokemonName: document.getElementById('pokemon-name'),
    username_show: document.getElementById('username-show'),

    categoryAdviceContainer: document.getElementById('category-advice-container'),
};

window.getDailyFortune = getDailyFortune; // 控制台测试用

window.addEventListener("DOMContentLoaded", () => {
    showUsername();

    const savedUsername = localStorage.getItem("username");
    const savedBirthday = localStorage.getItem("birthday");

    if(!savedUsername || !savedBirthday || savedUsername == '训练家') {
        // 设置日期组件的初始值为1995年
        domElements.modalBirthday.value = "1995-01-01";

        showModal();
    }


})

domElements.editUserBtn.addEventListener("click", () => {
    showModal();

    domElements.modalUsername.value = getUsernameFromStorage();
    domElements.modalBirthday.value = getBirthdayFromStorage();
})

// modal confirm
domElements.modalConfirmBtn.addEventListener("click", () => {
    const inputUsername = domElements.modalUsername.value || "训练家";
    const inputBirthday = domElements.modalBirthday.value || "1995-01-01";

    saveUserInfo(inputUsername, inputBirthday);


    hideModal()
    showUsername();
    
    clearFortuneContent();
});

// modal cancel
domElements.modalCancelBtn.addEventListener("click", () => {
   hideModal()
});

domElements.generateBtn.addEventListener("click", () => {
    generate();
});

function generate() {
    // 禁用按钮，防止重复点击
    domElements.generateBtn.disabled = true;
    domElements.generateBtn.textContent = 'loading...';
    
    clearFortuneContent();

    showUsername();

    // 从缓存获取用户名和生日
    const username = getUsernameFromStorage();
    const birthday = getBirthdayFromStorage();

    // 生成结果
    const result = getDailyFortune(username, birthday);

    // 模拟延迟加载
    setTimeout(() => {
        try {
            domElements.pokemonImg.src = result.pokemon.image;
            domElements.level.textContent = `${result.level}`;
            domElements.pokemonName.innerHTML = result.pokemon.name;

            // 移除旧的状态 class
            domElements.level.classList.remove("fortune-good", "fortune-bad");
            domElements.level.classList.add(
                GOOD_FORTUNE_LEVELS.includes(result.level) ? "fortune-good" : "fortune-bad"
            );


            for(const category in result.advice) {
                const advice = result.advice[category];

                // column 1
                const categoryFortuneLevel = document.createElement("div");
                categoryFortuneLevel.className = "category-fortune-level";


                const categoryFortuneLevelText = document.createElement("div");
                categoryFortuneLevelText.className = "category-fortune-level-text";
                // 移除旧的状态 class
                categoryFortuneLevelText.classList.remove("fortune-good", "fortune-bad");
                categoryFortuneLevelText.classList.add(
                    GOOD_FORTUNE_LEVELS.includes(advice.level) ? "fortune-good" : "fortune-bad"
                );
                categoryFortuneLevelText.innerHTML = `${advice.level}`;

                categoryFortuneLevel.appendChild(categoryFortuneLevelText);

                // column 2
                const categoryAdviceMain = document.createElement("div");
                categoryAdviceMain.className = "category-advice-main";

                const categoryAdviceTitleText = document.createElement("div");
                categoryAdviceTitleText.className = "category-advice-title-text";
                categoryAdviceTitleText.innerHTML = `「 ${category} 」`;

                const categoryAdviceContentText = document.createElement("div");
                categoryAdviceContentText.className = "category-advice-content-text";
                categoryAdviceContentText.innerHTML = `${advice.text}`;

                categoryAdviceMain.appendChild(categoryAdviceTitleText);
                categoryAdviceMain.appendChild(categoryAdviceContentText);

                // column 3
                const pokemonMove = document.createElement("div");
                pokemonMove.className = "pokemon-move";

                const pokemonMoveText = document.createElement("div");
                pokemonMoveText.className = "pokemon-move-text";
                pokemonMoveText.innerHTML = `${advice.pokemon_move}`;

                pokemonMove.appendChild(pokemonMoveText);

                // parent div
                const categoryBoxRow = document.createElement("div");
                categoryBoxRow.className = "category-box-row";
                categoryBoxRow.appendChild(categoryFortuneLevel);
                categoryBoxRow.appendChild(categoryAdviceMain);
                categoryBoxRow.appendChild(pokemonMove);

                domElements.categoryAdviceContainer.appendChild(categoryBoxRow);
            }
        } catch (error) {
            console.error('生成失败： ', error);
            domElements.level.textContent = '出错啦';
        }

        // 恢复按钮状态
        domElements.generateBtn.disabled = false;
        domElements.generateBtn.textContent = 'My PokeDay!';
    }, 500); // 模拟0.5秒延迟
}

function clearFortuneContent() {
    domElements.level.textContent = "";
    domElements.categoryAdviceContainer.innerHTML = "";
    domElements.pokemonImg.src = "images/piplup.gif";  // 或显示默认图片
    domElements.pokemonName.textContent = "";
}

function showUsername() {
    const username = getUsernameFromStorage();
    domElements.username_show.textContent = `你好，${username}！`;
}

function saveUserInfo(username, birthday) {
    localStorage.setItem("username", username);
    localStorage.setItem("birthday", birthday);
}

function getUsernameFromStorage() {
    return localStorage.getItem("username") || "训练家";
}

function getBirthdayFromStorage() {
    return localStorage.getItem("birthday") || "1995-01-01";
}

function showModal() {
    domElements.modal.classList.remove("hidden");
}

function hideModal() {
    domElements.modal.classList.add("hidden");
}

/** web页面显示的时候处理用的，不好看，后面再处理吧 */
function updateScale() {
  const container = document.querySelector('.screen-container');
  const content = document.querySelector('.content-layer');
  const containerWidth = container.offsetWidth;

  // 设计宽度为 713.94px
  const scale = containerWidth / 713.94;
  content.style.setProperty('--scale-factor', scale);
}


window.addEventListener('load', () => {
    updateScale(); // 初始 & 每次窗口变化时更新缩放

    // 所有资源加载后移除loading遮罩
    if (domElements.loadingScreen) {
        domElements.loadingScreen.style.display = "none";
    }
});


window.addEventListener('resize', updateScale);
