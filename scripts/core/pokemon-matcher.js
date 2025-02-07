import { getGanZhi } from '../utils/date-utils.js';
import { THEORY_MAPPING } from '../config/theory-mappings.js';
import { POKEMON_BAGUA_TYPE_MAPPING, POKEMON_TYPE_CN_EN_MAPPINGS } from '../config/pokemon-mappings.js';
import { POKEMON_TYPES } from '../config/pokemon-types.js'
import { POKEMON_STATS } from '../config/pokemon-stats.js'

/* 确定宝可梦类型 */
export function generateFortunePokemonIdList(baseHash) {
    // 类型安全校验
    function getMappedTypes(key, mapping) {
        const result = mapping[key] || [];
        return Array.isArray(result) ? result : [result];
    }

    // 根据日期确定天干地支
    const dayTheory = getGanZhi(new Date(), baseHash);

    // 获取天干->五行对应的宝可梦类型
    // 获取地支->八卦对应的宝可梦类型
    // 合并数组
    const stemTypes = getMappedTypes(THEORY_MAPPING[dayTheory.stem], POKEMON_BAGUA_TYPE_MAPPING);
    const branchTypes = getMappedTypes(THEORY_MAPPING[dayTheory.branch], POKEMON_BAGUA_TYPE_MAPPING);
    const combinedTypes = stemTypes.concat(branchTypes);

    // 确保至少有一个类型
    const validTypes = combinedTypes.length > 0 ? combinedTypes : ['一般']; 
    // 根据哈希选择唯一的宝可梦类型 & 中英转换
    const specialType = POKEMON_TYPE_CN_EN_MAPPINGS[validTypes[baseHash % validTypes.length]];

    // 指定宝可梦类型下的所有宝可梦id
    const pokemonIdList = POKEMON_TYPES[specialType].pokemons;

    return pokemonIdList;
}

/* 确定运势值 */
export function generateFortuneValue(userHash) {
    const base = userHash % 605 + 175; // 175-780
    
    return base;
}

/* 索引 */
// 预排序的宝可梦索引（结构：{ typeKey: sortedArray }）
let preSortedIndex = null;

// 初始化索引（只需执行一次）
export function initPokemonIndex(availableIds) {
  // 过滤出有效ID并添加种族值
  const pokemonList = availableIds.map(id => ({
    id: String(id).padStart(4, '0'), // 转为4位字符串
    stats: POKEMON_STATS[id] || 0
  }));
  
  // 按种族值排序
  pokemonList.sort((a, b) => a.stats - b.stats);
  
  preSortedIndex = pokemonList;
}

/* 二分 */
export function findClosestPokemon(targetValue) {
    if (!preSortedIndex || preSortedIndex.length === 0) {
      return { id: '0025', stats: 320 }; // 默认皮卡丘
    }
  
    let low = 0;
    let high = preSortedIndex.length - 1;
    let closest = preSortedIndex[0];
    let minDiff = Infinity;
  
    while (low <= high) {
      const mid = (low + high) >> 1; // 位运算优化
      const current = preSortedIndex[mid];
      const diff = Math.abs(current.stats - targetValue);
  
      // 更新最接近值
      if (diff < minDiff || (diff === minDiff && current.stats > closest.stats)) {
        minDiff = diff;
        closest = current;
      }
  
      // 二分逻辑
      if (current.stats < targetValue) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
  
    return closest;
  }