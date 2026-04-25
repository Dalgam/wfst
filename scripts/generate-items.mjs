import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const isPart = (c) => c.uniqueName?.includes('/Recipes/');

const allItems = JSON.parse(
  readFileSync(resolve(__dirname, '../warframe-items/data/json/All.json'), 'utf8')
);

const masterable = allItems
  .filter((i) => i.masterable)
  .map(({ uniqueName, name, category, imageName, wikiaThumbnail, wikiaUrl, isPrime, masteryReq, components }) => ({
    uniqueName,
    name,
    category,
    imageName,
    wikiaThumbnail,
    wikiaUrl,
    isPrime,
    masteryReq,
    parts: components?.filter(isPart).map((c) => ({ uniqueName: c.uniqueName, name: c.name })) ?? [],
  }));

const out = resolve(__dirname, '../src/items-data.json');
writeFileSync(out, JSON.stringify(masterable));
console.log(`Generated ${masterable.length} masterable items -> src/items-data.json`);
