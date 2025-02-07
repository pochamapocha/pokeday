export function getGanZhi(date, hashValue) {
    // 天干地支映射表
    const celestialStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const terrestrialBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    // 公历转儒略日（简化版）
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const a = Math.floor((14 - m) / 12);
    const jd = d + Math.floor((153 * (m + 12 * a - 3) + 2) / 5) + 
    365 * (y + 4800 - a) + Math.floor((y + 4800 - a) / 4) - 
    Math.floor((y + 4800 - a) / 100) + Math.floor((y + 4800 - a) / 400) - 32045;

    // 日干支计算（基于儒略日）
    const dayCycle = (jd - 10) % 60;
    const dayStem = celestialStems[dayCycle % 10];
    const dayBranch = terrestrialBranches[dayCycle % 12];

    // 年干支（公式：(year - 4) % 60）
    const yearCycle = (y - 4) % 60;
    const yearStem = celestialStems[yearCycle % 10];
    const yearBranch = terrestrialBranches[yearCycle % 12];

    // 月干支（基于年干支和节气简化计算）
    const monthCycle = (yearCycle * 12 + m - 1) % 60;
    const monthStem = celestialStems[monthCycle % 10];
    const monthBranch = terrestrialBranches[monthCycle % 12];

    // 哈希选择干支
    const stemIndex = hashValue % celestialStems.length;
    const branchIndex = (hashValue >> 4) % terrestrialBranches.length; // 高位取模
    const selectedStem = celestialStems[stemIndex];
    const selectedBranch = terrestrialBranches[branchIndex];

    return { 
        stem: selectedStem,
        branch: selectedBranch
    };
}