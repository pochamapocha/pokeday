import { FORTUNE_LEVELS } from '../config/fortune-levels.js';
import { ADVICE_CATEGORIES, ADVICE_TEMPLATES, ADVICE_PLACEHOLDER, ADVICE_GANZHI_WEIGHTS} from '../config/advice-templates.js';
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
        dailyAdvice[cat] = {
            level: overallLevel,
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
            image: `https://cdn.jsdmirror.com/gh/pochamapocha/pokeimage-cdn@latest/data/images/v1/${pokemonIdForImage}/${imageIndex}.webp`
        },
    };
}