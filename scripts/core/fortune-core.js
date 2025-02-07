import { FORTUNE_LEVELS } from '../config/fortune-levels.js';
import { ADVICE_TEMPLATES } from '../config/advice-templates.js';
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
    const dayGanzhi = getGanZhi(new Date(), baseHash);
    const level = calculateFortuneLevel(dayGanzhi, baseHash);
    
    // 候选宝可梦id列表
    const candidateIds = generateFortunePokemonIdList(dayGanzhi, baseHash);
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