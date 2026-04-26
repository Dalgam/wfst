import type { WFItem } from "./types";
import itemsData from "./items-data.json";

export const CATEGORIES = [
  "All",
  "Warframes",
  "Primary",
  "Secondary",
  "Melee",
  "Arch-Gun",
  "Arch-Melee",
  "Archwing",
  "Pets",
  "Sentinels",
  "Misc",
];

export const IMG_CDN = "https://cdn.warframestat.us/img/";
export const MASTERED_KEY = "wfst-mastered";
export const PARTS_KEY = "wfst-parts";
export const CARD_MIN_WIDTH = 192;
export const CARD_HEIGHT = 360;
export const GAP = 16;

export const allItems = itemsData as WFItem[];
export const itemByName = new Map(allItems.map((i) => [i.name, i]));
