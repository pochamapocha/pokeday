const fs = require('fs');
const path = require('path');

// 读取 JSON 文件
fs.readFile(path.join(__dirname, '../data/pokemon-stats.json'), 'utf8', (err, data) => {
  if (err) {
    console.error('读取 JSON 文件失败:', err);
    return;
  }

  try {
    // 解析 JSON 数据
    const jsonData = JSON.parse(data);

    // 将 JSON 数据转换为 JavaScript 对象
    const jsObject = `const POKEMON_STATS = ${JSON.stringify(jsonData, null, 2)};`;

    // 将 JavaScript 对象保存为 .js 文件
    fs.writeFile(path.join(__dirname, '../config/pokemon-stats.js'), jsObject, (err) => {
      if (err) {
        console.error('写入 JS 文件失败:', err);
      } else {
        console.log('成功将 JSON 转换为 JS 文件');
      }
    });
  } catch (parseErr) {
    console.error('解析 JSON 数据失败:', parseErr);
  }
});
