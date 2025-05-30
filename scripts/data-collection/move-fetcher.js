import fs from 'fs/promises';
import fetch from 'node-fetch';

const MAX_ID = 937;
const CONCURRENCY = 10;
const RETRY_LIMIT = 3;
const API_URL = 'https://pokeapi.co/api/v2/move/';
const CACHE_FILE = '../data/move-cache.json';
const OUTPUT_FILE = '../data/moves.js';

async function fetchMove(id, retries = RETRY_LIMIT) {
  try {
    const res = await fetch(`${API_URL}${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // 提取英文与中文简体名称
    const en = data.name;
    const zh = data.names.find(n => n.language.name === 'zh-Hans')?.name || '';

    return { id: data.id, en, zh };
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 500));
      return fetchMove(id, retries - 1);
    } else {
      console.error(`❌ Failed to fetch move ${id} after ${RETRY_LIMIT} attempts.`);
      return null;
    }
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
  const pendingIds = [];

  for (let id = 1; id <= MAX_ID; id++) {
    if (!cache[id]) pendingIds.push(id);
  }

  console.log(`🔍 Fetching ${pendingIds.length} missing moves...`);

  while (pendingIds.length > 0) {
    const batch = pendingIds.splice(0, CONCURRENCY);
    const results = await Promise.all(batch.map(id => fetchMove(id)));

    for (const move of results) {
      if (move) {
        cache[move.id] = { en: move.en, zh: move.zh };
        console.log(`✅ ${move.id}: ${move.en} / ${move.zh}`);
      }
    }

    await saveCache(cache);
  }

  const jsContent = `export const MOVES = ${JSON.stringify(cache, null, 2)};\n`;
  await fs.writeFile(OUTPUT_FILE, jsContent, 'utf-8');
  console.log(`✅ All done! Saved to ${OUTPUT_FILE}`);
}

main();
