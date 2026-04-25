import Items from 'warframe-items';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const items = new Items();
const masterable = items
  .filter((i) => i.masterable)
  .map(({ uniqueName, name, category, imageName, wikiaThumbnail, isPrime, masteryReq }) => ({
    uniqueName,
    name,
    category,
    imageName,
    wikiaThumbnail,
    isPrime,
    masteryReq,
  }));

const out = resolve(__dirname, '../src/items-data.json');
writeFileSync(out, JSON.stringify(masterable));
console.log(`Generated ${masterable.length} masterable items -> src/items-data.json`);
