/* 基础哈希生成 */
export function generateBaseHash() {
    // 日期种子（YYYYMMDDD）
    const dateSeed = new Date().toISOString().slice(0,10).replace(/-/g,'');
    
    // 用户特征哈希（基于浏览器指纹）
    const userHash = navigator.userAgent.split('').reduce(
        (acc, char) => acc + char.charCodeAt(0), 0
    );

    const combined = (parseInt(dateSeed) * 127) ^ userHash;
    return Math.abs(combined % 1000); // 返回0-999的整数
}