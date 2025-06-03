import { getDailyFortune } from "./core/fortune-core.js";
import { GOOD_FORTUNE_LEVELS, BAD_FORTUNE_LEVELS } from "./config/fortune-levels.js";

const domElements = {
    mainContent: document.getElementById("main-content"),
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

    lazyUI: document.querySelectorAll('.lazy-ui'),
    categoryAdviceContainer: document.getElementById('category-advice-container'),
};

window.getDailyFortune = getDailyFortune; // 控制台测试用

window.addEventListener("DOMContentLoaded", () => {
    showUsername();
    hideOtherUI();

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
    setLoading(true);
    clearFortuneContent();
    showUsername();

    setTimeout(() => {
        try {
            const result = fetchFortuneResult();
            renderFortuneResult(result);
        } catch (error) {
            console.error("生成失败：", error);
            domElements.level.textContent = '出错啦';
        } finally {
            setLoading(false);
        }
    }, 500); // 模拟0.5秒延迟
}

function setLoading(isLoading) {
    if (isLoading) {
        domElements.generateBtn.disabled = true;
        domElements.generateBtn.textContent = 'loading...';
        domElements.loadingScreen.classList.remove("hidden");
        domElements.mainContent.style.display = "none";
    } else {
        domElements.generateBtn.disabled = false;
        domElements.generateBtn.textContent = 'My PokeDay!';
        domElements.loadingScreen.classList.add("hidden");
        domElements.mainContent.style.display = "block";
    }
}

function fetchFortuneResult() {
    const username = getUsernameFromStorage();
    const birthday = getBirthdayFromStorage();
    return getDailyFortune(username, birthday);
}

function renderFortuneResult(result) {
    domElements.pokemonImg.setAttribute("loading", "lazy");
    domElements.pokemonImg.onerror = function () {
        domElements.pokemonImg.src = 'images/piplup.webp'; // 默认图片
    };
    domElements.pokemonImg.src = result.pokemon.image;

    domElements.level.textContent = `${result.level}`;
    domElements.pokemonName.innerHTML = result.pokemon.name;

    domElements.level.classList.remove("fortune-good", "fortune-bad");
    domElements.level.classList.add(
        GOOD_FORTUNE_LEVELS.includes(result.level) ? "fortune-good" : "fortune-bad"
    );

    for(const category in result.advice) {
        const advice = result.advice[category];

        const categoryBoxRow = document.createElement("div");
        categoryBoxRow.className = "category-box-row";

        const levelEl = document.createElement("div");
        levelEl.className = "category-fortune-level";

        const levelText = document.createElement("div");
        levelText.className = "category-fortune-level-text";
        levelText.classList.remove("fortune-good", "fortune-bad");
        levelText.classList.add(
            GOOD_FORTUNE_LEVELS.includes(advice.level) ? "fortune-good" : "fortune-bad"
        );
        levelText.innerHTML = `${advice.level}`;
        levelEl.appendChild(levelText);

        const adviceMain = document.createElement("div");
        adviceMain.className = "category-advice-main";
        const title = document.createElement("div");
        title.className = "category-advice-title-text";
        title.innerHTML = `「 ${category} 」`;
        const content = document.createElement("div");
        content.className = "category-advice-content-text";
        content.innerHTML = `${advice.text}`;
        adviceMain.appendChild(title);
        adviceMain.appendChild(content);

        const moveBox = document.createElement("div");
        moveBox.className = "pokemon-move";
        const moveText = document.createElement("div");
        moveText.className = "pokemon-move-text";
        moveText.innerHTML = `${advice.pokemon_move}`;
        moveBox.appendChild(moveText);

        categoryBoxRow.appendChild(levelEl);
        categoryBoxRow.appendChild(adviceMain);
        categoryBoxRow.appendChild(moveBox);
        domElements.categoryAdviceContainer.appendChild(categoryBoxRow);
    }
    showOtherUI();
}

function clearFortuneContent() {
    domElements.level.textContent = "";
    domElements.categoryAdviceContainer.innerHTML = "";
    domElements.pokemonImg.src = "";  // 或显示默认图片
    domElements.pokemonName.textContent = "";
    hideOtherUI();
}

function showOtherUI() {
    domElements.lazyUI.forEach(element => {
        element.classList.add('lazy-show');
        element.classList.remove('lazy-hide');
    });
}

function hideOtherUI() {
    domElements.lazyUI.forEach(element => {
        element.classList.add('lazy-hide');
        element.classList.remove('lazy-show');
    });
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

// /** web页面显示的时候处理用的，不好看，后面再处理吧 */
// function updateScale() {
//   const container = document.querySelector('.screen-container');
//   const content = document.querySelector('.content-layer');
//   const containerWidth = container.offsetWidth;

//   // 设计宽度为 713.94px
//   const scale = containerWidth / 713.94;
//   content.style.setProperty('--scale-factor', scale);
// }


window.addEventListener('load', () => {
    // updateScale(); // 初始 & 每次窗口变化时更新缩放

    // 所有资源加载后移除loading遮罩
    document.fonts.ready.then(() => {
        if (domElements.loadingScreen) {
            domElements.loadingScreen.classList.add("hidden");
            domElements.mainContent.style.display = "block";
    }
    })
});


// window.addEventListener('resize', updateScale);
