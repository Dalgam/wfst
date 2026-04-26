import * as React from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GitHubIcon from "@mui/icons-material/GitHub";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import FormControlLabel from "@mui/material/FormControlLabel";
import type { WFItem } from "./types";
import { CATEGORIES, CARD_MIN_WIDTH, CARD_HEIGHT, GAP, allItems, itemByName } from "./constants";
import { loadMastered, saveMastered, loadParts, saveParts } from "./storage";
import { openWiki } from "./utils";
import { Kbd } from "./components/Kbd";
import { ItemCard } from "./components/ItemCard";
import { ShortcutsDialog } from "./components/ShortcutsDialog";
import { useUrlState } from "./hooks/useUrlState";
import { useContainerWidth } from "./hooks/useContainerWidth";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useImportExport } from "./hooks/useImportExport";

export default function MasteryGrid() {
  const [mastered, setMastered] = React.useState<Set<string>>(loadMastered);
  const [parts, setParts] = React.useState<Record<string, string[]>>(loadParts);

  const {
    category,
    setCategory,
    search,
    setSearch,
    masteredFilter,
    setMasteredFilter,
    primeFilter,
    setPrimeFilter,
  } = useUrlState();

  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [filterSearch, setFilterSearch] = React.useState(false);
  const [showUnobtainable, setShowUnobtainable] = React.useState(false);

  const highlightedRef = React.useRef<WFItem | null>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const isMac = navigator.platform.toUpperCase().includes("MAC");

  const [containerRef, containerWidth] = useContainerWidth();
  const deferredSearch = React.useDeferredValue(search);

  const filtered = React.useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return allItems.filter((i) => {
      const matchCat = category === "All" || i.category === category;
      const matchSearch = !q || i.name.toLowerCase().includes(q);
      if (!showUnobtainable && i.obtainable === false) return false;
      if (masteredFilter === "hide" && mastered.has(i.uniqueName)) return false;
      if (masteredFilter === "only" && !mastered.has(i.uniqueName)) return false;
      if (primeFilter === "prime" && !i.isPrime) return false;
      if (primeFilter === "non-prime" && i.isPrime) return false;
      return matchCat && matchSearch;
    });
  }, [category, deferredSearch, masteredFilter, primeFilter, mastered, showUnobtainable]);

  const searchOptions = React.useMemo(() => {
    const pool = allItems.filter((i) => {
      if (!showUnobtainable && i.obtainable === false) return false;
      if (!filterSearch) return true;
      if (masteredFilter === "hide" && mastered.has(i.uniqueName)) return false;
      if (masteredFilter === "only" && !mastered.has(i.uniqueName)) return false;
      if (primeFilter === "prime" && !i.isPrime) return false;
      if (primeFilter === "non-prime" && i.isPrime) return false;
      return true;
    });
    return [...new Set(pool.map((i) => i.name))];
  }, [filterSearch, masteredFilter, primeFilter, mastered, showUnobtainable]);

  const masteredCount = React.useMemo(
    () => filtered.filter((i) => mastered.has(i.uniqueName)).length,
    [filtered, mastered]
  );

  const cols = Math.max(
    1,
    Math.floor((containerWidth + GAP) / (CARD_MIN_WIDTH + GAP))
  );
  const rows = Math.ceil(filtered.length / cols);

  const virtualizer = useWindowVirtualizer({
    count: rows,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 3,
  });

  const toggle = React.useCallback((uniqueName: string) => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(uniqueName)) next.delete(uniqueName);
      else next.add(uniqueName);
      saveMastered(next);
      return next;
    });
  }, []);

  const togglePart = React.useCallback(
    (itemUniqueName: string, partUniqueName: string) => {
      setParts((prev) => {
        const obtained = prev[itemUniqueName] ?? [];
        const next = obtained.includes(partUniqueName)
          ? obtained.filter((u) => u !== partUniqueName)
          : [...obtained, partUniqueName];
        const updated = { ...prev, [itemUniqueName]: next };
        saveParts(updated);
        return updated;
      });
    },
    []
  );

  useKeyboardShortcuts({
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
  });

  const { handleExport, handleImport, importRef } = useImportExport(
    mastered,
    parts,
    setMastered,
    setParts
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="h5">Warframe Mastery Tracker</Typography>
          <Tooltip title="GitHub">
            <Box
              component="a"
              href="https://github.com/dalgam/wfst"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              <GitHubIcon fontSize="small" />
            </Box>
          </Tooltip>
        </Box>
        <ShortcutsDialog
          open={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
          isMac={isMac}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "nowrap" }}
          >
            {masteredCount} / {filtered.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={
              filtered.length > 0 ? (masteredCount / filtered.length) * 100 : 0
            }
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
          />
          <ToggleButtonGroup
            value={masteredFilter}
            exclusive
            onChange={(_, v) => {
              if (v) setMasteredFilter(v);
            }}
            size="small"
          >
            <ToggleButton value="all" sx={{ px: 1.5 }}>
              All
            </ToggleButton>
            <ToggleButton value="hide" sx={{ px: 1.5 }}>
              Hide mastered
            </ToggleButton>
            <ToggleButton value="only" sx={{ px: 1.5 }}>
              Only mastered
            </ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup
            value={primeFilter}
            exclusive
            onChange={(_, v) => {
              if (v) setPrimeFilter(v);
            }}
            size="small"
          >
            <ToggleButton value="all" sx={{ px: 1.5 }}>
              All
            </ToggleButton>
            <ToggleButton value="prime" sx={{ px: 1.5 }}>
              Prime
            </ToggleButton>
            <ToggleButton value="non-prime" sx={{ px: 1.5 }}>
              Non-Prime
            </ToggleButton>
          </ToggleButtonGroup>
          <Button size="small" variant="outlined" onClick={handleExport}>
            Export
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => importRef.current?.click()}
          >
            Import
          </Button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            hidden
            onChange={handleImport}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<HelpOutlineIcon />}
            onClick={() => setShortcutsOpen(true)}
          >
            Shortcuts
          </Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Autocomplete
            freeSolo
            sx={{ flex: 1 }}
            autoHighlight
            options={searchOptions}
            filterOptions={(options, state) => {
              const q = state.inputValue.trim().toLowerCase();
              if (!q) return options;
              const matches = options.filter((o) => o.toLowerCase().includes(q));
              return matches.length > 0 ? matches : ["__no_results__"];
            }}
            inputValue={search}
            onInputChange={(_, value) => {
              setSearch(value);
              const q = value.trim().toLowerCase();
              const matchName = q
                ? searchOptions.find((name) =>
                    name.toLowerCase().includes(q)
                  )
                : undefined;
              highlightedRef.current = matchName
                ? (itemByName.get(matchName) ?? null)
                : null;
            }}
            onChange={(_, value) => {
              if (value !== "__no_results__") setSearch(value ?? "");
            }}
            onHighlightChange={(_, option) => {
              highlightedRef.current =
                option && option !== "__no_results__"
                  ? (itemByName.get(option) ?? null)
                  : null;
            }}
            renderOption={(props, option) => {
              if (option === "__no_results__") {
                return (
                  <li
                    {...props}
                    key="__no_results__"
                    style={{ pointerEvents: "none" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No results
                    </Typography>
                  </li>
                );
              }
              const item = itemByName.get(option);
              const itemMastered = item ? mastered.has(item.uniqueName) : false;
              const obtainedParts = item ? (parts[item.uniqueName] ?? []) : [];
              return (
                <li
                  {...props}
                  key={option}
                  onClick={(e) => {
                    if ((e.metaKey || e.ctrlKey) && item?.wikiaUrl) {
                      e.preventDefault();
                      openWiki(item.wikiaUrl);
                    } else {
                      (props as React.HTMLAttributes<HTMLLIElement>).onClick?.(
                        e
                      );
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      py: 0.5,
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <CheckCircleIcon
                        sx={{
                          fontSize: 16,
                          color: itemMastered
                            ? "primary.main"
                            : "action.disabled",
                        }}
                      />
                      <Typography variant="body2">{option}</Typography>
                    </Box>
                    {item && item.parts.length > 0 && (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {item.parts.map((part) => {
                          const partDone = obtainedParts.includes(
                            part.uniqueName
                          );
                          return (
                            <Chip
                              key={part.uniqueName}
                              label={part.name}
                              size="small"
                              variant={partDone ? "filled" : "outlined"}
                              color={partDone ? "primary" : "default"}
                              sx={{ height: 18, fontSize: "0.65rem" }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                inputRef={searchRef}
                label="Search items"
                size="small"
                sx={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearch("");
                    highlightedRef.current = null;
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
            )}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Typography variant="caption" color="text.disabled">
              +
            </Typography>
            <Kbd>K</Kbd>
          </Box>
          <Tooltip title="Apply active mastered and Prime filters to search results">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                  Filter search
                </Typography>
              }
              sx={{ mr: 0, flexShrink: 0 }}
            />
          </Tooltip>
          <Tooltip title="Show Founder-exclusive items that cannot be obtained">
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={showUnobtainable}
                  onChange={(e) => setShowUnobtainable(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                  Show unobtainable
                </Typography>
              }
              sx={{ mr: 0, flexShrink: 0 }}
            />
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={category}
          onChange={(_, v) => setCategory(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ flex: 1, px: 1 }}
        >
          {CATEGORIES.map((cat) => (
            <Tab key={cat} label={cat} value={cat} />
          ))}
        </Tabs>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ pr: 2, whiteSpace: "nowrap" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Typography variant="caption" color="text.disabled">
              +
            </Typography>
            <Kbd>,</Kbd>
            <Typography variant="caption" color="text.disabled">
              /
            </Typography>
            <Kbd>.</Kbd>
          </Box>
        </Typography>
      </Box>

      <Box ref={containerRef} sx={{ px: 2, pt: 2 }}>
        {filtered.length === 0 && (
          <Typography
            color="text.secondary"
            sx={{ py: 4, textAlign: "center" }}
          >
            No results
          </Typography>
        )}
        <Box sx={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIdx = virtualRow.index * cols;
            const rowItems = filtered.slice(startIdx, startIdx + cols);
            return (
              <Box
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: virtualRow.start,
                  left: 0,
                  right: 0,
                  height: CARD_HEIGHT,
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap: GAP,
                }}
              >
                {rowItems.map((item) => (
                  <ItemCard
                    key={item.uniqueName}
                    item={item}
                    done={mastered.has(item.uniqueName)}
                    obtainedParts={parts[item.uniqueName] ?? []}
                    onToggle={toggle}
                    onTogglePart={togglePart}
                  />
                ))}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
