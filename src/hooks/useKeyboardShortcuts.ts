import * as React from "react";
import type { WFItem } from "../types";
import { CATEGORIES, itemByName } from "../constants";

type Params = {
  toggle: (uniqueName: string) => void;
  togglePart: (itemUniqueName: string, partUniqueName: string) => void;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  searchRef: React.RefObject<HTMLInputElement | null>;
  highlightedRef: React.MutableRefObject<WFItem | null>;
  search: string;
  searchOptions: string[];
  filterSearch: boolean;
  masteredFilter: "all" | "hide" | "only";
  mastered: Set<string>;
};

export function useKeyboardShortcuts({
  toggle,
  togglePart,
  setCategory,
  searchRef,
  highlightedRef,
  search,
  searchOptions,
  filterSearch,
  masteredFilter,
  mastered,
}: Params) {
  const searchValueRef = React.useRef(search);
  searchValueRef.current = search;
  const searchOptionsRef = React.useRef(searchOptions);
  searchOptionsRef.current = searchOptions;
  const filterSearchRef = React.useRef(filterSearch);
  filterSearchRef.current = filterSearch;
  const masteredFilterRef = React.useRef(masteredFilter);
  masteredFilterRef.current = masteredFilter;
  const masteredSetRef = React.useRef(mastered);
  masteredSetRef.current = mastered;

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      const item = highlightedRef.current;
      if (!(e.metaKey || e.ctrlKey)) return;
      const num = parseInt(e.key);
      if (item) {
        if (e.code === "Space") {
          e.preventDefault();
          toggle(item.uniqueName);
          const willBeMastered = !masteredSetRef.current.has(item.uniqueName);
          const hidingMastered =
            filterSearchRef.current && masteredFilterRef.current === "hide";
          const showingOnlyMastered =
            filterSearchRef.current && masteredFilterRef.current === "only";
          if (
            (hidingMastered && willBeMastered) ||
            (showingOnlyMastered && !willBeMastered)
          ) {
            const q = searchValueRef.current.trim().toLowerCase();
            const next =
              searchOptionsRef.current
                .filter(
                  (name) =>
                    name !== item.name && (!q || name.toLowerCase().includes(q))
                )
                .map((name) => itemByName.get(name) ?? null)
                .find(Boolean) ?? null;
            highlightedRef.current = next;
          }
          return;
        }
        if (num >= 1 && num <= 4 && item.parts[num - 1]) {
          e.preventDefault();
          togglePart(item.uniqueName, item.parts[num - 1].uniqueName);
          return;
        }
      } else {
        if (e.key === ".") {
          e.preventDefault();
          setCategory(
            (prev) =>
              CATEGORIES[(CATEGORIES.indexOf(prev) + 1) % CATEGORIES.length]
          );
          return;
        }
        if (e.key === ",") {
          e.preventDefault();
          setCategory(
            (prev) =>
              CATEGORIES[
                (CATEGORIES.indexOf(prev) - 1 + CATEGORIES.length) %
                  CATEGORIES.length
              ]
          );
          return;
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [toggle, togglePart, setCategory, searchRef, highlightedRef]);
}
