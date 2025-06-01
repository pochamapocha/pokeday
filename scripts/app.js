import { getDailyFortune } from "./core/fortune-core.js";

const domElements = {
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
    // username_show: document.getElementById('username-show'),

    categoryText1: document.getElementById("category-text-1"),
    categoryText2: document.getElementById("category-text-2"),
    categoryText3: document.getElementById("category-text-3"),

    pokemonMove1: document.getElementById("pokemon-move-1"),
    pokemonMove2: document.getElementById("pokemon-move-2"),
    pokemonMove3: document.getElementById("pokemon-move-3"),
};

window.getDailyFortune = getDailyFortune; // 控制台测试用

window.addEventListener("DOMContentLoaded", () => {
    // domElements.username_show.innerHTML = getUsernameFromStorage();

    const savedUsername = localStorage.getItem("username");
    const savedBirthday = localStorage.getItem("birthday");

    if(!savedUsername || !savedBirthday) {
        domElements.modal.classList.remove("hidden");
    }

    // 设置日期组件的初始值为1995年
    domElements.modalBirthday.value = "1995-01-01";
})

domElements.editUserBtn.addEventListener("click", () => {
    domElements.modal.classList.remove("hidden");

    domElements.modalUsername.value = getUsernameFromStorage();
    domElements.modalBirthday.value = getBirthdayFromStorage();
})

// modal confirm
domElements.modalConfirmBtn.addEventListener("click", () => {
    const inputUsername = domElements.modalUsername.value || "训练家";
    const inputBirthday = domElements.modalBirthday.value || "1995-01-01";

    localStorage.setItem("username", inputUsername);
    localStorage.setItem("birthday", inputBirthday);

    domElements.modal.classList.add("hidden");
    // domElements.username_show.innerHTML = getUsernameFromStorage();
    
    clearFortuneContent();
});

// modal cancel
domElements.modalCancelBtn.addEventListener("click", () => {
   domElements.modal.classList.add("hidden");
});

domElements.generateBtn.addEventListener("click", () => {
    generate();
});

function generate() {
    // 禁用按钮，防止重复点击
    domElements.generateBtn.disabled = true;
    domElements.generateBtn.textContent = 'loading...';
    
    clearFortuneContent();

    // 更新用户名显示
    // domElements.username_show.innerHTML = getUsernameFromStorage();

    // 从缓存获取用户名和生日
    const username = getUsernameFromStorage();
    const birthday = getBirthdayFromStorage();

    // 生成结果
    const result = getDailyFortune(username, birthday);

    // 模拟延迟加载
    setTimeout(() => {
        try {
            domElements.level.textContent = `${result.level}`;

            const advice = result.advice;
            domElements.categoryText1.innerHTML = `<strong>工作</strong> (${advice['工作'].level}): ${advice['工作'].text}`;
            domElements.categoryText2.innerHTML = `<strong>游戏</strong> (${advice['游戏'].level}): ${advice['游戏'].text}`;
            domElements.categoryText3.innerHTML = `<strong>恋爱</strong> (${advice['恋爱'].level}): ${advice['恋爱'].text}`;

            domElements.pokemonMove1.innerHTML = `<strong>${advice['工作'].pokemon_move}</string>`;
            domElements.pokemonMove2.innerHTML = `<strong>${advice['游戏'].pokemon_move}</string>`;
            domElements.pokemonMove3.innerHTML = `<strong>${advice['恋爱'].pokemon_move}</string>`;

            // for(const category in result.advice) {
            //     const advice = result.advice[category];

            //     const adviceElement = document.createElement("div");
            //     adviceElement.className = "advice-item";
            //     adviceElement.innerHTML = `<strong>${category}</strong> (${advice.level}): ${advice.text}`;
            //     domElements.adviceContainer.appendChild(adviceElement);

            //     const pokemonMoveElement = document.createElement("div");
            //     pokemonMoveElement.className = "pokemon-move";
            //     pokemonMoveElement.innerHTML = `${advice.pokemon_move}`;
            //     domElements.adviceContainer.appendChild(pokemonMoveElement);
            // }

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
}

function clearFortuneContent() {
    domElements.level.textContent = "";
    // domElements.adviceContainer.innerHTML = "";
    domElements.pokemonImg.src = "images/piplup.gif";  // 或显示默认图片
    domElements.pokemonName.textContent = "";

    domElements.categoryText1.innerHTML = "";
    domElements.categoryText2.innerHTML = "";
    domElements.categoryText3.innerHTML = "";

    domElements.pokemonMove1.innerHTML = "";
    domElements.pokemonMove2.innerHTML = "";
    domElements.pokemonMove3.innerHTML = "";
}

// function init() {
//     domElements.generateBtn.disabled = false;
// }

// init();

function getUsernameFromStorage() {
    return localStorage.getItem("username") || "训练家";
}

function getBirthdayFromStorage() {
    return localStorage.getItem("birthday") || "1995-01-01";
}