import * as React from "react";
import { saveMastered, saveParts } from "../storage";

export function useImportExport(
  mastered: Set<string>,
  parts: Record<string, string[]>,
  setMastered: React.Dispatch<React.SetStateAction<Set<string>>>,
  setParts: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
) {
  const importRef = React.useRef<HTMLInputElement>(null);

  function handleExport() {
    const data = { mastered: [...mastered], parts };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wfst-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data.mastered)) {
          const next = new Set<string>(data.mastered);
          setMastered(next);
          saveMastered(next);
        }
        if (data.parts && typeof data.parts === "object") {
          setParts(data.parts);
          saveParts(data.parts);
        }
      } catch {
        /* ignore bad file */
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  return { handleExport, handleImport, importRef };
}
