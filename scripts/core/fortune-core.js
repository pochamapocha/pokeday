import { FORTUNE_LEVELS } from '../config/fortune-levels.js';
import { ADVICE_CATEGORIES, ADVICE_TEMPLATES, ADVICE_PLACEHOLDER, ADVICE_CATEGORIE_WEIGHTS, ADVICE_GANZHI_WEIGHTS} from '../config/advice-templates.js';
import { POKEMON_IMAGE_COUNTING } from '../config/pokemon-image-counting.js';
import { generateBaseHash } from '../utils/hash-utils.js';
import { getGanZhi } from '../utils/date-utils.js';
import { generateFortuneValue, generateFortunePokemonIdList, initPokemonIndex, findClosestPokemon} from './pokemon-matcher.js';

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
function generateEachAdviceFortuneLevel(adviceCategory, dayGanzhi, hashValue) {
    const stemWeight = ADVICE_GANZHI_WEIGHTS[dayGanzhi.stem][adviceCategory];
    const branchWeight = ADVICE_GANZHI_WEIGHTS[dayGanzhi.branch][adviceCategory];

    const score = 
        stemWeight * ADVICE_CATEGORIE_WEIGHTS[adviceCategory].stem +
        branchWeight * ADVICE_CATEGORIE_WEIGHTS[adviceCategory].branch +
        (hashValue % 100 / 100) * ADVICE_CATEGORIE_WEIGHTS[adviceCategory].hash;

    const thresholds = [0.85, 0.70, 0.55, 0.40, 0.25, 0.10];
    for (let i = 0; i < thresholds.length; i++) {
        if (score >= thresholds[i]) return FORTUNE_LEVELS[i];
    }
    return FORTUNE_LEVELS[FORTUNE_LEVELS.length - 1];
}

// 生成每个类目的建议
function generateAdvice(adviceCategory, level, hashValue) {
    const templates = ADVICE_TEMPLATES[adviceCategory][level];
    const seed = (hashValue + adviceCategory.charCodeAt(0)) % templates.length;
    let advice = templates[seed];

    //替换建议模板中的占位符
    for (const placeholder in ADVICE_PLACEHOLDER) {
        const placeholderSeed = (hashValue + adviceCategory.charCodeAt(0)) % ADVICE_PLACEHOLDER[placeholder].length;
        const replaceItem = ADVICE_PLACEHOLDER[placeholder][placeholderSeed]
        advice = advice.replace(new RegExp(placeholder, 'g'), replaceItem);
    }

    return advice;
}


/* 运势+建议+宝可梦 - 全局函数 */
window.getDailyFortune = function() {
    const baseHash = generateBaseHash();
    const dayGanzhi = getGanZhi(new Date(), baseHash);
    const level = calculateFortuneLevel(dayGanzhi, baseHash);

    const dailyAdvice = {};

    ADVICE_CATEGORIES.forEach(adviceCategory => {
        const level = generateEachAdviceFortuneLevel(adviceCategory, dayGanzhi, baseHash)
        const advice = generateAdvice(adviceCategory, level, baseHash);
        dailyAdvice[adviceCategory] = advice;
    });
    
    // 候选宝可梦id列表
    const candidateIds = generateFortunePokemonIdList(dayGanzhi, baseHash);
    // 建立列表索引
    initPokemonIndex(candidateIds);
    // 今日运势值
    const targetValue = generateFortuneValue(baseHash);
    // 确定宝可梦
    const closestPokemon = findClosestPokemon(targetValue);

    // 宝可梦图片选择，并转为四位数字
    const imageIndex = String(baseHash % POKEMON_IMAGE_COUNTING[closestPokemon.id] + 1).padStart(4, '0');
    

    return{
        level: level,
        advice: dailyAdvice,
        // hash: baseHash //**用于调试
        pokemon: {
            id: closestPokemon.id,  // 宝可梦id，已转换为4位
            stats: closestPokemon.stats,  // 宝可梦种族值
            image: `https://cdn.jsdmirror.com/gh/pochamapocha/pokeimage-cdn@latest/data/images/v1/${closestPokemon.id}/${imageIndex}.png`
        }
    };
}