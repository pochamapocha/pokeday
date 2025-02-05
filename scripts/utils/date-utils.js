import { THEORY_MAPPING } from '../config/theory-mappings.js';

export function getDayTheory(date) {
    // 示例：简化版干支计算（实际需集成农历库）
    const celestialStems = 
        ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
    const terrestrialBranches = 
        ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    
    const dayIndex = Math.floor(date / (24 * 60 * 60 * 1000)); // 天数累计
    
    return {
      stem: celestialStems[dayIndex % 10],      // 天干
      branch: terrestrialBranches[dayIndex % 12] // 地支
    };
}