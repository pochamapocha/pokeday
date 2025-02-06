import fs from 'fs';
import fetch from 'node-fetch'; 

async function fetchAllTypes() {
  const typeListRes = await fetch('https://pokeapi.co/api/v2/type/');
  const typeList = await typeListRes.json();
  
  const typeMap = {};
  
  for (const type of typeList.results) {
    const typeRes = await fetch(type.url);
    const typeData = await typeRes.json();
    
    typeMap[typeData.name] = {
      id: typeData.id,
      pokemons: typeData.pokemon.map(p => ({
        id: p.pokemon.url.split('/').slice(-2, -1)[0], // 从URL提取ID
        name: p.pokemon.name
      }))
    };
  }
  
  fs.writeFileSync('../data/pokemon-types.json', JSON.stringify(typeMap));
}

fetchAllTypes();