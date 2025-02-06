const fs = require('fs');
const path = require('path');

// 读取 JSON 文件
fs.readFile(path.join(__dirname, '../data/pokemon-types.json'), 'utf8', (err, data) => {
  if (err) {
    console.error('读取 JSON 文件失败:', err);
    return;
  }

  try {
    // 解析 JSON 数据
    const jsonData = JSON.parse(data);

    // 转换数据结构
    const transformedData = Object.fromEntries(
      Object.entries(jsonData).map(([type, { id, pokemons }]) => [
        type,
        {
          id,
          pokemons: pokemons.map(pokemon => pokemon.id)
        }
      ])
    );

    // 将转换后的数据保存为 JS 文件
    const jsContent = `const POKEMON_TYPES = ${JSON.stringify(transformedData, null, 2)};\n`;
    fs.writeFile(path.join(__dirname, '../config/pokemon-types.js'), jsContent, (err) => {
      if (err) {
        console.error('写入 JS 文件失败:', err);
      } else {
        console.log('成功将 JSON 转换为格式化的 JS 文件');
      }
    });
  } catch (parseErr) {
    console.error('解析 JSON 数据失败:', parseErr);
  }
});
