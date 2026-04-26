import type { WFItem } from "./types";
import { IMG_CDN } from "./constants";

export function getImageUrl(item: WFItem): string {
  return `${IMG_CDN}${item.imageName}`;
}

export function openWiki(url: string) {
  window.open(url, "_blank");
}
