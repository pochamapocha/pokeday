// import { FORTUNE_LEVELS, ADVICE_TEMPLATES, THEORY_MAPPING, POKEMON_TYPE_MAPPING, getDayTheory } from '../traditional-mapping.js';
import { generateBaseHash } from '../utils/hash-utils.js';
import { FORTUNE_LEVELS } from '../config/fortune-levels.js';
import { ADVICE_TEMPLATES } from '../config/advice-templates.js';
import { generateFortuneValue, generateFortunePokemonIdList, initPokemonIndex, findClosestPokemon} from './pokemon-matcher.js';

/* 运势等级生成 */
function calculateFortuneLevel(hashValue) {
    const thresholds = [850, 700, 550, 400, 250, 100, 0];

    for(let i = 0; i < thresholds.length; i++){
        if(hashValue >= thresholds[i]){
            return FORTUNE_LEVELS[i];
        }
    }
    return FORTUNE_LEVELS[FORTUNE_LEVELS.length - 1];
}

/* 建议生成 */
function generateAdvice(level, category, hashValue) {
    const pool = ADVICE_TEMPLATES[category][level] || [];
    if(pool.length === 0) return '暂无建议';

    // 使用哈希后三位决定选择索引
    const index = (hashValue % 1000) % pool.length;
    return pool[index];
}


/* 运势+建议+宝可梦 - 全局函数 */
window.getDailyFortune = function() {
    const baseHash = generateBaseHash();
    const level = calculateFortuneLevel(baseHash);
    
    // 候选宝可梦id列表
    const candidateIds = generateFortunePokemonIdList(baseHash);
    // 建立列表索引
    initPokemonIndex(candidateIds);
    // 今日运势值
    const targetValue = generateFortuneValue(baseHash);
    // 确定宝可梦
    const closestPokemon = findClosestPokemon(targetValue);
    

    return{
        level: level,
        advice: {
            wish: generateAdvice(level, 'wish', baseHash),
            travel: generateAdvice(level, 'travel', baseHash),
            health: generateAdvice(level, 'health', baseHash)
        },
        // hash: baseHash //**用于调试
        pokemon: {
            id: closestPokemon.id,  // 宝可梦id，已转换为4位
            stats: closestPokemon.stats,  // 宝可梦种族值
            image: `https://jsd.cdn.zzko.cn/gh/pochamapocha/pokemon-images-cdn@latest/data/images/${closestPokemon.id}.png`
        }
    };
}