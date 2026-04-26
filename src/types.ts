export type Part = { uniqueName: string; name: string };

export type WFItem = {
  uniqueName: string;
  name: string;
  category?: string;
  imageName?: string;
  wikiaUrl?: string;
  isPrime?: boolean;
  obtainable?: boolean;
  masteryReq?: number;
  parts: Part[];
};
