import { THEORY_MAPPING } from '../config/theory-mappings.js';
import { POKEMON_BAGUA_TYPE_MAPPING, POKEMON_TYPE_CN_EN_MAPPINGS } from '../config/pokemon-mappings.js';
import { POKEMON_TYPES } from '../config/pokemon-types.js'
import { POKEMON_STATS } from '../config/pokemon-stats.js'
import { POKEMON_NAME_MOVES } from '../config/pokemon-name-moves.js'
import { POKEMON_MOVES } from '../config/pokemon-moves.js'
import { ADVICE_CATEGORIES } from '../config/advice-templates.js';


/**
 * 根据当天干支和用户哈希值，生成一个宝可梦类型并返回该类型对应的所有宝可梦 ID 列表。
 * 类型由五行/八卦映射决定，并通过哈希扰动选择具体一个。
 *
 * @param {Object} dayGanzhi - 包含干支信息（如 { stem: '甲', branch: '子' }）
 * @param {number} baseHash - 基于用户名、生日等计算出的哈希值
 * @returns {string[]} 宝可梦 ID 字符串数组
 */
function generateFortunePokemonIdList(dayGanzhi, baseHash) {
    // 类型安全校验
    function getMappedTypes(key, mapping) {
        const result = mapping[key] || [];
        return Array.isArray(result) ? result : [result];
    }

    // 获取天干->五行对应的宝可梦类型
    // 获取地支->八卦对应的宝可梦类型
    // 合并数组
    const stemTypes = getMappedTypes(THEORY_MAPPING[dayGanzhi.stem], POKEMON_BAGUA_TYPE_MAPPING);
    const branchTypes = getMappedTypes(THEORY_MAPPING[dayGanzhi.branch], POKEMON_BAGUA_TYPE_MAPPING);
    const combinedTypes = stemTypes.concat(branchTypes);

    // 确保至少有一个类型
    const validTypes = combinedTypes.length > 0 ? combinedTypes : ['一般']; 
    // 根据哈希选择唯一的宝可梦类型 & 中英转换
    const specialType = POKEMON_TYPE_CN_EN_MAPPINGS[validTypes[baseHash % validTypes.length]];

    // 指定宝可梦类型下的所有宝可梦id
    const pokemonIdList = POKEMON_TYPES[specialType].pokemons;

    return pokemonIdList;
}


/**
 * 基于用户哈希值，生成一个目标运势值（范围在 175 到 780 之间），用于与宝可梦种族值匹配。
 *
 * @param {number} userHash - 用户唯一哈希值
 * @returns {number} 目标数值（对应种族值）
 */
function generateFortuneValue(userHash) {
    const base = userHash % 605 + 175; // 种族值固定在175-780之间随机，写死
    return base;
}


/**
 * 宝可梦选择器类，用于封装候选 ID、排序、哈希值等状态
 */
class PokemonMatcher {
  constructor(ganzhi, baseHash) {
    this.ganzhi = ganzhi;
    this.baseHash = baseHash;
    this.sortedList = this._buildSortedList();
  }

   /**
   * 内部函数：构建候选宝可梦种族值排序列表
   * @returns {Array<{ id: string, stats: number }>} 
   */
  _buildSortedList() {
    const ids = generateFortunePokemonIdList(this.ganzhi, this.baseHash);
    return ids.map(id => ({
      id: id,
      stats: POKEMON_STATS[id] || 0
    })).sort((a, b) => a.stats - b.stats);
  }

  /**
   * 外部接口：计算目标值并查找最接近宝可梦
   * @returns {{ id: string, name: string }}
   */
  select() {
    const target = generateFortuneValue(this.baseHash);
    return this._findClosest(target);
  }

  /**
   * 内部函数：二分查找最接近的宝可梦
   * @param {number} targetValue
   * @returns {{ id: string, name: string }}
   */
  _findClosest(targetValue) {
    let low = 0, high = this.sortedList.length - 1;
    let closest = this.sortedList[0];
    let minDiff = Infinity;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const current = this.sortedList[mid];
      const diff = Math.abs(current.stats - targetValue);

      if (diff < minDiff || (diff === minDiff && current.stats > closest.stats)) {
        minDiff = diff;
        closest = current;
      }

      if (current.stats < targetValue) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return {
      id: closest.id,
      name: POKEMON_NAME_MOVES[closest.id]?.zh || `未知宝可梦 ${closest.id}`
    };
  }
}


/**
 * 外部纯函数接口：封装宝可梦选择流程
 * @param {Object} ganzhi 干支对象 { stem, branch }
 * @param {number} baseHash 用户唯一哈希值
 * @returns {{ id: string, name: string }} 宝可梦信息
 */
export function selectFortunePokemon(ganzhi, bashHash) {
  const matcher = new PokemonMatcher(ganzhi, bashHash);
  return matcher.select();
}


/**
 * 生成每个类目的宝可梦技能。
 * @param {string} pokemonId
 * @param {number} hashValue
 * @returns {Object} - { category move_name_zh }
 */
export function generatePokemonMoveList(pokemonId, hashValue) {
    const moveEntry = POKEMON_NAME_MOVES[pokemonId];
    if (!moveEntry?.moves || moveEntry.moves.length == 0) {
      return {};
    }

    const moveIds = moveEntry.moves;
    const result = {}

    ADVICE_CATEGORIES.forEach((category, index) => {
      const categoryHash = (hashValue + index * 233) % moveIds.length;
      const moveId = moveIds[categoryHash];
      const zhName = POKEMON_MOVES[moveId]?.zh;

      result[category] = zhName || null;
    })

    return result;
}