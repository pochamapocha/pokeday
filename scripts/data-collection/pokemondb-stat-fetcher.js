const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const fs = require('fs');

// 启用重试机制
axiosRetry(axios, { retries: 5, retryDelay: axiosRetry.exponentialDelay });

async function getTotalStatForId(id) {
  try {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}/`, { timeout: 5000 });
    const stats = response.data.stats;

    let totalStat = 0;
    stats.forEach(stat => {
      totalStat += stat.base_stat;
    });

    console.log(`ID: ${id}, Total Stat: ${totalStat}`);
    return totalStat;
  } catch (error) {
    console.error(`Error fetching data for ID ${id}:`, error);
    return null;
  }
}

async function fetchAllStats() {
  let allStats = {};
  let failedIds = [];  // 用来存储所有失败的 ID

  for (let i = 1; i <= 1025; i++) {
    const totalStat = await getTotalStatForId(i);
    if (totalStat !== null) {
      allStats[i] = totalStat;
    } else {
      failedIds.push(i);  // 如果获取失败，加入失败列表
    }
  }

  // 保存成功的统计数据
  fs.writeFileSync('../data/pokemon-stats.json', JSON.stringify(allStats, null, 2), 'utf-8');
  console.log('Total stats saved to /data/pokemon-stats.json');

  // 打印所有失败的 ID
  if (failedIds.length > 0) {
    console.log(`Failed to fetch data for the following IDs: ${failedIds.join(', ')}`);
  } else {
    console.log('All fetches were successful!');
  }
}

// 开始执行
fetchAllStats();
