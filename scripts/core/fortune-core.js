// import { FORTUNE_LEVELS, ADVICE_TEMPLATES, THEORY_MAPPING, POKEMON_TYPE_MAPPING, getDayTheory } from '../traditional-mapping.js';
import { generateBaseHash } from '../utils/hash-utils.js';
import { getDayTheory } from '../utils/date-utils.js';
import { FORTUNE_LEVELS } from '../config/fortune-levels.js';
import { ADVICE_TEMPLATES } from '../config/advice-templates.js';
import { THEORY_MAPPING } from '../config/theory-mappings.js';
import { POKEMON_TYPE_MAPPING } from './pokemon-matcher.js';

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

/* 确定运势宝可梦 */
function generateFortuneValue(userHash) {
    const base = userHash % 605 + 175; // 175-780
    
    return base;
}

function findClosestPokemon(targetValue, pokemonList) {
    return pokemonList.reduce((closest, current) => {
      const currentDiff = Math.abs(current.baseStats - targetValue);
      const closestDiff = Math.abs(closest.baseStats - targetValue);
      return currentDiff < closestDiff ? current : closest;
    });
}

/* 运势+建议+宝可梦 - 全局函数 */
window.getDailyFortune = function() {
    const baseHash = generateBaseHash();
    const level = calculateFortuneLevel(baseHash);
    
    
    // 类型安全校验
    function getMappedTypes(key, mapping) {
        const result = mapping[key] || [];
        return Array.isArray(result) ? result : [result];
    }

    const dayTheory = getDayTheory(new Date());
    
    // 加权合并（五行60% + 八卦40%）
    const stemTypes = getMappedTypes(THEORY_MAPPING[dayTheory.stem], POKEMON_TYPE_MAPPING); // 获取天干->五行对应的宝可梦类型
    const branchTypes = getMappedTypes(THEORY_MAPPING[dayTheory.branch], POKEMON_TYPE_MAPPING); // 获取地支->八卦对应的宝可梦类型
    const combinedTypes = stemTypes.concat(branchTypes);
    
    // 确保至少有一个类型
    const validTypes = combinedTypes.length > 0 ? combinedTypes : ['一般']; 
    const specialType = validTypes[baseHash % validTypes.length];

    return{
        level: level,
        advice: {
            wish: generateAdvice(level, 'wish', baseHash),
            travel: generateAdvice(level, 'travel', baseHash),
            health: generateAdvice(level, 'health', baseHash)
        },
        // hash: baseHash //**用于调试
        type: specialType,
        value: generateFortuneValue(baseHash),
    };
}