import fs from 'fs/promises';
import fetch from 'node-fetch';

const FAILED_IDS = [
  920, 921, 922, 923, 924, 925, 926, 927, 928, 929,
  930, 931, 932, 933, 934, 935, 936, 937
];

const API_URL = 'https://pokeapi.co/api/v2/move/';
const CACHE_FILE = '../data/move-cache.json';
const OUTPUT_FILE = '../data/moves.js';

async function fetchMove(id) {
  const url = `${API_URL}${id}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; move-fetcher/1.0)'
      }
    });
    if (!res.ok) {
      console.warn(`⚠️ HTTP ${res.status} for move ${id}`);
      return null;
    }
    const data = await res.json();
    const en = data.name;
    const zh = data.names.find(n => n.language.name === 'zh-Hans')?.name || '';
    return { id: data.id, en, zh };
  } catch (err) {
    console.error(`❌ Error fetching move ${id}: ${err.message}`);
    return null;
  }
}


async function loadCache() {
  try {
    const content = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

async function main() {
  const cache = await loadCache();

  const toFetch = FAILED_IDS.filter(id => !cache[id]);
  console.log(`🔁 Retrying ${toFetch.length} move IDs...`);

  let tries = 0;
  while (toFetch.length > 0 && tries < 1) {
    for (const id of [...toFetch]) {
      const move = await fetchMove(id);
      if (move) {
        cache[move.id] = { en: move.en, zh: move.zh };
        console.log(`✅ ${move.id}: ${move.en} / ${move.zh}`);
        toFetch.splice(toFetch.indexOf(id), 1);
        await new Promise(r => setTimeout(r, 800 + Math.random() * 1200)); // 随机等待 0.8–2s
      }
    }
    tries++;
  }

  await saveCache(cache);
  const jsContent = `export const MOVES = ${JSON.stringify(cache, null, 2)};\n`;
  await fs.writeFile(OUTPUT_FILE, jsContent, 'utf-8');

  if (toFetch.length === 0) {
    console.log(`🎉 All failed moves fetched and saved!`);
  } else {
    console.warn(`⚠️ Still missing: ${toFetch.join(', ')}`);
  }
}

main();
