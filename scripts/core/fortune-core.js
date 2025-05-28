import { FORTUNE_LEVELS } from '../config/fortune-levels.js';
import { ADVICE_CATEGORIES, ADVICE_TEMPLATES, ADVICE_PLACEHOLDER, ADVICE_GANZHI_WEIGHTS} from '../config/advice-templates.js';
import { POKEMON_IMAGE_COUNTING } from '../config/pokemon-image-counting.js';
import { generateBaseHash } from '../utils/hash-utils.js';
import { getGanZhi } from '../utils/date-utils.js';
import { generateFortuneValue, generateFortunePokemonIdList, initPokemonIndex, findClosestPokemon} from './pokemon-matcher.js';

/* 运势等级转换为数字 */
function fortuneLevelScore(level) {
    return FORTUNE_LEVELS.indexOf(level) >= 0
        ? FORTUNE_LEVELS.length - 1 - FORTUNE_LEVELS.indexOf(level)
        : 3; //默认中吉
}

/* 运势等级生成 */
function calculateFortuneLevel(dayGanzhi, hashValue) {
    // 天干地支权重映射
    const stemWeights =
        { 甲: 30, 乙: 25, 丙: 20, 丁: 15, 戊: 10,
            己: 5, 庚: 0, 辛: -5, 壬: -10, 癸: -15 };
    const branchWeights =
        { 子: 20, 丑: 15, 寅: 10, 卯: 5, 辰: 0, 巳: -5,
            午: -10, 未: -15, 申: -20, 酉: -25, 戌: -30, 亥: -35 };

    // 综合评分
    const score = 
        stemWeights[dayGanzhi.stem] * 0.4 + 
        branchWeights[dayGanzhi.branch] * 0.4 + 
        (hashValue % 100) * 0.2;

    // 阈值划分
    const thresholds = [85, 70, 55, 40, 25, 10];

    for(let i = 0; i < thresholds.length; i++){
        if(score >= thresholds[i]){
            return FORTUNE_LEVELS[i];
        }
    }
    return FORTUNE_LEVELS[FORTUNE_LEVELS.length - 1];
}

/* 建议生成 */
// 生成每个建议类目的运势等级
function generateEachAdviceLevel(category, dayGanzhi, baseHash, overallLevel) {
    const baseScore = fortuneLevelScore(overallLevel); // 大吉=6, ...大凶=0
    const stemScore = ADVICE_GANZHI_WEIGHTS[dayGanzhi.stem]?.[category] || 0;
    const branchScore = ADVICE_GANZHI_WEIGHTS[dayGanzhi.branch]?.[category] || 0;
    const randomScore = (baseHash % 100) / 100;

    const finalScore = baseScore * 0.5 + stemScore * 0.3 + branchScore * 0.1 + randomScore * 0.1;
    const thresholds = [0.85, 0.70, 0.55, 0.40, 0.25, 0.10];

    for (let i = 0; i < thresholds.length; i++) {
        if (finalScore >= thresholds[i]) return FORTUNE_LEVELS[i];
    }
    return FORTUNE_LEVELS[FORTUNE_LEVELS.length - 1];
}
// function generateEachAdviceFortuneLevel(adviceCategory, dayGanzhi, hashValue) {
//     const stemWeight = ADVICE_GANZHI_WEIGHTS[dayGanzhi.stem][adviceCategory];
//     const branchWeight = ADVICE_GANZHI_WEIGHTS[dayGanzhi.branch][adviceCategory];

//     const score = 
//         stemWeight * ADVICE_CATEGORIE_WEIGHTS[adviceCategory].stem +
//         branchWeight * ADVICE_CATEGORIE_WEIGHTS[adviceCategory].branch +
//         (hashValue % 100 / 100) * ADVICE_CATEGORIE_WEIGHTS[adviceCategory].hash;

//     const thresholds = [0.85, 0.70, 0.55, 0.40, 0.25, 0.10];
//     for (let i = 0; i < thresholds.length; i++) {
//         if (score >= thresholds[i]) return FORTUNE_LEVELS[i];
//     }
//     return FORTUNE_LEVELS[FORTUNE_LEVELS.length - 1];
// }

// 生成每个类目的建议
function generateAdvice(category, level, hashValue) {
    const templates = ADVICE_TEMPLATES[category]?.[level] || ["今天似乎风平浪静。"];
    const seed = (hashValue + category.charCodeAt(0)) % templates.length;
    let advice = templates[seed];

    //替换建议模板中的占位符
    const placeholders = ADVICE_PLACEHOLDER[category] || {};
    for (const placeholder in placeholders) {
        const values = placeholders[placeholder];
        const index = (hashValue + placeholder.length + category.length) % values.length;
        advice = advice.replace(new RegExp(placeholder, 'g'), values[index]);
    }

    return advice;
}

// 每个类目建议对应的宝可梦技能
function generateCopingAdvice(pokemonId, category) {
    const dummySkills = {
        工作: ["高速成长", "专注力爆发", "效率加倍"],
        游戏: ["幸运暴击", "反应超速", "秒杀全场"],
        恋爱: ["魅力释放", "心灵感应", "温柔攻击"]
    };
    const options = dummySkills[category] || ["随机技能"];
    const index = parseInt(pokemonId) % options.length;
    return `建议使用技能「${options[index]}」来应对`;
}

/**
 * 根据用户信息生成每日运势。
 * @param {string} username
 * @param {string} birthday - 格式 'YYYY-MM-DD'
 * @param {string} date - 默认使用今天
 * @returns {Object} - 包含整体运势等级、每项建议、宝可梦信息等
 */
export function getDailyFortune(username, birthday, date = new Date()) {
    const baseHash = generateBaseHash(username, birthday, date);
    const ganzhi = getGanZhi(date, baseHash);

    // 计算整体运势等级 （基于bashHash）
    const levelIndex = baseHash % FORTUNE_LEVELS.length;
    const overallLevel = FORTUNE_LEVELS[levelIndex];

    // 派生每项分类建议
    const dailyAdvice= {}
    ADVICE_CATEGORIES.forEach((cat, idx) => {
        const shiftedHash = (baseHash + idx * 131) % 10007; // 每类偏移一个独立 hash
        dailyAdvice[cat] = {
            level: overallLevel,
            text: generateAdvice(cat, overallLevel, shiftedHash)
        }
    })

    // 候选宝可梦id列表
    const candidateIds = generateFortunePokemonIdList(ganzhi, baseHash);
    // 建立列表索引
    initPokemonIndex(candidateIds);
    // 今日运势值
    const targetValue = generateFortuneValue(baseHash);
    // 确定宝可梦
    const closestPokemon = findClosestPokemon(targetValue);

    const imageIndex = String(baseHash % POKEMON_IMAGE_COUNTING[closestPokemon.id] + 1).padStart(4, '0');
    
    return{
        username: username,
        birthday: birthday,
        level: overallLevel,
        advice: dailyAdvice,
        // hash: baseHash //**用于调试
        pokemon: {
            id: closestPokemon.id,  // 宝可梦id，已转换为4位
            stats: closestPokemon.stats,  // 宝可梦种族值
            image: `https://cdn.jsdmirror.com/gh/pochamapocha/pokeimage-cdn@latest/data/images/v1/${closestPokemon.id}/${imageIndex}.png`
        },
    };
}



// /* 运势+建议+宝可梦 - 全局函数 */
// window.getDailyFortune = function() {
//     const baseHash = generateBaseHash();
//     const dayGanzhi = getGanZhi(new Date(), baseHash);
//     const overallLevel = calculateFortuneLevel(dayGanzhi, baseHash);

//     // const dailyAdvice = {};

//     // ADVICE_CATEGORIES.forEach(adviceCategory => {
//     //     const level = generateEachAdviceFortuneLevel(adviceCategory, dayGanzhi, baseHash)
//     //     const advice = generateAdvice(adviceCategory, level, baseHash);
//     //     dailyAdvice[adviceCategory] = advice;
//     // });
    
//     // 候选宝可梦id列表
//     const candidateIds = generateFortunePokemonIdList(dayGanzhi, baseHash);
//     // 建立列表索引
//     initPokemonIndex(candidateIds);
//     // 今日运势值
//     const targetValue = generateFortuneValue(baseHash);
//     // 确定宝可梦
//     const closestPokemon = findClosestPokemon(targetValue);

//     // 宝可梦图片选择，并转为四位数字
//     const imageIndex = String(baseHash % POKEMON_IMAGE_COUNTING[closestPokemon.id] + 1).padStart(4, '0');
    
//     const dailyAdvice = {};
//     ADVICE_CATEGORIES.forEach(category => {
//         const level = generateEachAdviceLevel(category, dayGanzhi, baseHash, overallLevel);
//         const advice = generateAdvice(category, level, baseHash);
//         const coping = generateCopingAdvice(closestPokemon.id, category);
//         dailyAdvice[category] = `${advice} ${coping}`;
//     });

//     return{
//         level: overallLevel,
//         advice: dailyAdvice,
//         // hash: baseHash //**用于调试
//         pokemon: {
//             id: closestPokemon.id,  // 宝可梦id，已转换为4位
//             stats: closestPokemon.stats,  // 宝可梦种族值
//             image: `https://cdn.jsdmirror.com/gh/pochamapocha/pokeimage-cdn@latest/data/images/v1/${closestPokemon.id}/${imageIndex}.png`
//         }
//     };
// }