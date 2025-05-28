/**
 * 将字符串和日期组合后生成可控 hash 值。
 * @param {string} username - 用户名
 * @param {string} birthday - 格式 'YYYY-MM-DD'
 * @param {string} date - 当前日期 'YYYY-MM-DD'，可选
 * @returns {number} - 稳定但有波动性的 hash 值
 */
export function generateBaseHash(username, birthday, date = null) {
    const today = date || new Date().toISOString().slice(0, 10); // 默认今天
    const baseString = `${username}::${birthday}::${today}`;
    
    let hash = 0;

    for (let i = 0; i < baseString.length; i++) {
        const char = baseString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // 转为32位整数
    }
    return Math.abs(hash);
}