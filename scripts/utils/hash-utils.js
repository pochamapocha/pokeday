/**
 * 将字符串和日期组合后生成可控 hash 值。
 * @param {string} username - 用户名
 * @param {string} birthday - 格式 'YYYY-MM-DD'
 * @param {string} date - 当前日期 'YYYY-MM-DD'，可选
 * @returns {number} - 稳定但有波动性的 hash 值
 */
export function generateBaseHash(username, birthday, date = null) {
    let dateObj;

    if (date instanceof Date) {
        // 清除时间部分（即使传入带小时分钟也会统一化）
        dateObj = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    } else if (typeof date === 'string') {
        // 如果传入的是字符串，强制用 new Date() 解析
        const parsed = new Date(date);
        dateObj = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    } else {
        // 默认使用今天（去除时间部分）
        const now = new Date();
        dateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const dateStr = dateObj.toISOString().slice(0, 10); // 始终统一格式
    const baseString = `${username}::${birthday}::${dateStr}`;

    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
        hash = (hash << 5) - hash + baseString.charCodeAt(i);
        hash |= 0;
    }

    return Math.abs(hash);
}