/* 基础哈希生成 */
function generateBashHash() {
    // 日期种子（YYYYMMDDD）
    const dateSeed = new Date().toISOString().slice(0,10).replace(/-/g,'');
    
    // 用户特征哈希（基于浏览器指纹）
    const userHash = navigator.userAgent.split('').reduce(
        (acc, char) => acc + char.charCodeAt(0), 0
    );

    const combined = (parseInt(dateSeed) * 127) ^ userHash;
    return Math.abs(combined % 1000); // 返回0-999的整数
}

/* 运势生成 */
const FORTUNE_LEVELS = ['大吉','吉','中吉','小吉','末吉','凶','大凶'];

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
const ADVICE_TEMPLATES = {
    wish: {
        大吉: ['所求成就', '愿望达成', '心想事成'],
        吉: ['有望实现', '需努力争取'],
        中吉: ['循序渐进', '不可急躁'],
        凶: ['暂缓行动', '调整目标']
    },
    travel: {
        大吉: ['宜远行', '旅途平安'],
        吉: ['检查行程', '备好雨具'],
        凶: ['注意安全', '延期为佳']
    },
    health: {
        大吉: ['精力充沛', '保持作息'],
        凶: ['注意饮食', '及时就医']
    }
};

function generateAdvice(level, category, hashValue) {
    const pool = ADVICE_TEMPLATES[category][level] || [];
    if(pool.length === 0) return '暂无建议';

    // 使用哈希后三位决定选择索引
    const index = (hashValue % 1000) % pool.length;
    return pool[index];
}

/* 运势+建议 全局函数 */
window.getDailyFortune = function() {
    const bashHash = generateBashHash();
    const level = calculateFortuneLevel(bashHash);

    return{
        level: level,
        advice: {
            wish: generateAdvice(level, 'wish', bashHash),
            travel: generateAdvice(level, 'travel', bashHash),
            health: generateAdvice(level, 'health', bashHash)
        },
        // hash: bashHash //**用于调试
    };
}

