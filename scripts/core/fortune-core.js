import { POKEMON_IMAGE_PATH } from '../config/image-path.js'
import { FORTUNE_LEVELS } from '../config/fortune-levels.js';
import { ADVICE_CATEGORIES, ADVICE_TEMPLATES, ADVICE_PLACEHOLDER, ADVICE_CATEGORIE_WEIGHTS, ADVICE_GANZHI_WEIGHTS} from '../config/advice-templates.js';
import { POKEMON_IMAGE_COUNTING } from '../config/pokemon-image-counting.js';
import { generateBaseHash } from '../utils/hash-utils.js';
import { getGanZhi } from '../utils/date-utils.js';
import { selectFortunePokemon, generatePokemonMoveList} from './pokemon-matcher.js';

/**
 * 生成每个类目的建议.
 * @param {string} category
 * @param {number} level
 * @param {number} hashValue
 * @returns {string}
 */
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


/**
 * 根据分类、基础运势等级索引、哈希值和天干地支，计算分类的个性化运势等级。
 *
 * 运用以下加权因素：
 *  - ADVICE_CATEGORIE_WEIGHTS：定义该分类中天干、地支、hash的权重占比。
 *  - ADVICE_GANZHI_WEIGHTS：根据当天的干支，获取该分类的影响系数（范围一般在 -0.5 ~ 1.5）。
 *  - Hash 值扰动：引入一定的随机性，模拟个体差异。
 *
 * 最终将整体运势索引进行微调（±1），得到该分类的专属等级索引。
 * 保证结果仍处于 FORTUNE_LEVELS 的合法范围内。
 *
 * @param {string} category - 运势分类名，如 "工作"、"恋爱"
 * @param {number} overallIndex - 整体运势等级在 FORTUNE_LEVELS 中的索引（0 ~ N）
 * @param {number} hash - 用于扰动的基础哈希值（来自用户名、生日、日期）
 * @param {{ stem: string, branch: string }} ganzhi - 天干地支对象，如 { stem: '甲', branch: '子' }
 * @returns {string} - 微调后的具体运势等级（如 '大吉', '小吉' 等）
 */

function generateCategoryFortuneLevel(category, overallIndex, hash, ganzhi) {
    const categoryWeights = ADVICE_CATEGORIE_WEIGHTS[category];
    const stemWeight = ADVICE_GANZHI_WEIGHTS[ganzhi.stem]?.[category] ?? 0;
    const branchWeight = ADVICE_GANZHI_WEIGHTS[ganzhi.branch]?.[category] ?? 0;

    const weightedScore = 
        (categoryWeights?.stem ?? 0.3) * stemWeight +
        (categoryWeights?.branch ?? 0.3) * branchWeight +
        (categoryWeights?.hash ?? 0.4) * ((hash % 200 - 100) / 100);  // hash扰动 [-1, 1]

    const delta = Math.round(weightedScore);  // 变动范围 -1, 0, 1
    const newIndex = Math.max(0, Math.min(FORTUNE_LEVELS.length - 1, overallIndex + delta));
    return FORTUNE_LEVELS[newIndex];
}

/**
 * 根据用户信息生成每日运势。
 * @param {string} username
 * @param {string} birthday - 格式 'YYYY-MM-DD'
 * @param {date} date - 默认使用今天
 * @returns {Object} - 包含整体运势等级、每项建议、宝可梦信息等
 */
export function getDailyFortune(username, birthday, date = null) {
    const baseHash = generateBaseHash(username, birthday, date);
    const ganzhi = getGanZhi(date, baseHash);

    // 计算整体运势等级 （基于bashHash）
    const levelIndex = baseHash % FORTUNE_LEVELS.length;
    const overallLevel = FORTUNE_LEVELS[levelIndex];

    const chosenPokemon = selectFortunePokemon(ganzhi, baseHash);

    const pokemonIdForImage = String(chosenPokemon.id).padStart(4, '0');
    const imageIndex = String(baseHash % POKEMON_IMAGE_COUNTING[pokemonIdForImage] + 1).padStart(4, '0');

    const moves = generatePokemonMoveList(chosenPokemon.id, baseHash);

    // 派生每项分类建议
    const dailyAdvice= {}
    ADVICE_CATEGORIES.forEach((cat, idx) => {
        const shiftedHash = (baseHash + idx * 131) % 10007; // 每类偏移一个独立 hash
        const categoryFortuneLevel = generateCategoryFortuneLevel(cat, levelIndex, shiftedHash, ganzhi);
        dailyAdvice[cat] = {
            level: categoryFortuneLevel,
            text: generateAdvice(cat, overallLevel, shiftedHash),
            pokemon_move: moves[cat]
        }
    })
    
    return{
        username: username,
        birthday: birthday,
        level: overallLevel,
        advice: dailyAdvice,
        // hash: baseHash //**用于调试
        pokemon: {
            id: chosenPokemon.id,  // 宝可梦id，已转换为4位
            name: chosenPokemon.name,  // 宝可梦中文名
            image: `${POKEMON_IMAGE_PATH}/${pokemonIdForImage}/${imageIndex}.webp`,
        },
    };
}