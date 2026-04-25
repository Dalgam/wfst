import * as React from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormControlLabel from '@mui/material/FormControlLabel';
import itemsData from './items-data.json';

type Part = { uniqueName: string; name: string };

type WFItem = {
  uniqueName: string;
  name: string;
  category?: string;
  imageName?: string;
  wikiaThumbnail?: string;
  isPrime?: boolean;
  masteryReq?: number;
  parts: Part[];
};

const CATEGORIES = [
  'All',
  'Warframes',
  'Primary',
  'Secondary',
  'Melee',
  'Arch-Gun',
  'Arch-Melee',
  'Archwing',
  'Pets',
  'Sentinels',
  'Misc',
];

const IMG_CDN = 'https://cdn.warframestat.us/img/';
const MASTERED_KEY = 'wfst-mastered';
const PARTS_KEY = 'wfst-parts';
const CARD_MIN_WIDTH = 192;
const CARD_HEIGHT = 360;
const GAP = 8;

const allItems = itemsData as WFItem[];
const itemByName = new Map(allItems.map((i) => [i.name, i]));

function loadMastered(): Set<string> {
  try {
    const raw = localStorage.getItem(MASTERED_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function saveMastered(set: Set<string>) {
  localStorage.setItem(MASTERED_KEY, JSON.stringify([...set]));
}

function loadParts(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(PARTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveParts(parts: Record<string, string[]>) {
  localStorage.setItem(PARTS_KEY, JSON.stringify(parts));
}

function getImageUrl(item: WFItem): string {
  if (item.wikiaThumbnail) return item.wikiaThumbnail;
  return `${IMG_CDN}${item.imageName}`;
}


type CardProps = {
  item: WFItem;
  done: boolean;
  obtainedParts: string[];
  onToggle: (uniqueName: string) => void;
  onTogglePart: (itemUniqueName: string, partUniqueName: string) => void;
};

const ItemCard = React.memo(function ItemCard({ item, done, obtainedParts, onToggle, onTogglePart }: CardProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: CARD_HEIGHT,
        borderRadius: 1,
        overflow: 'hidden',
        border: '2px solid',
        borderColor: done ? 'primary.main' : 'transparent',
        transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
        bgcolor: 'grey.800',
        '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
      }}
    >
      <Tooltip title={item.name} placement="top" arrow>
        <Box
          onClick={() => onToggle(item.uniqueName)}
          sx={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', flex: 1 }}
        >
          <Box
            component="img"
            src={getImageUrl(item)}
            alt={item.name}
            loading="lazy"
            sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            onError={(e) => {
              if (item.imageName) {
                (e.target as HTMLImageElement).src = `${IMG_CDN}${item.imageName}`;
              }
            }}
          />
          {done && (
            <CheckCircleIcon
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                fontSize: 18,
                color: 'primary.main',
                bgcolor: 'background.paper',
                borderRadius: '50%',
              }}
            />
          )}
        </Box>
      </Tooltip>

      {item.parts.length > 0 && (
        <Box sx={{ px: 1, py: 0.5, borderTop: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          {item.parts.map((part) => (
            <FormControlLabel
              key={part.uniqueName}
              control={
                <Checkbox
                  size="small"
                  checked={obtainedParts.includes(part.uniqueName)}
                  onChange={() => onTogglePart(item.uniqueName, part.uniqueName)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ py: 0.25 }}
                />
              }
              label={<Typography variant="caption" noWrap>{part.name}</Typography>}
              sx={{ m: 0 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
});

export default function MasteryGrid() {
  const [mastered, setMastered] = React.useState<Set<string>>(loadMastered);
  const [parts, setParts] = React.useState<Record<string, string[]>>(loadParts);
  const [category, setCategory] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [masteredFilter, setMasteredFilter] = React.useState<'all' | 'hide' | 'only'>('all');
  const deferredSearch = React.useDeferredValue(search);
  const highlightedRef = React.useRef<WFItem | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(800);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const filtered = React.useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return allItems.filter((i) => {
      const matchCat = category === 'All' || i.category === category;
      const matchSearch = !q || i.name.toLowerCase().includes(q);
      if (masteredFilter === 'hide' && mastered.has(i.uniqueName)) return false;
      if (masteredFilter === 'only' && !mastered.has(i.uniqueName)) return false;
      return matchCat && matchSearch;
    });
  }, [category, deferredSearch, masteredFilter, mastered]);

  const masteredCount = React.useMemo(
    () => filtered.filter((i) => mastered.has(i.uniqueName)).length,
    [filtered, mastered],
  );

  const cols = Math.max(1, Math.floor((containerWidth + GAP) / (CARD_MIN_WIDTH + GAP)));
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

  const togglePart = React.useCallback((itemUniqueName: string, partUniqueName: string) => {
    setParts((prev) => {
      const obtained = prev[itemUniqueName] ?? [];
      const next = obtained.includes(partUniqueName)
        ? obtained.filter((u) => u !== partUniqueName)
        : [...obtained, partUniqueName];
      const updated = { ...prev, [itemUniqueName]: next };
      saveParts(updated);
      return updated;
    });
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const item = highlightedRef.current;
      if (!item || !(e.metaKey || e.ctrlKey)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle(item.uniqueName);
        return;
      }
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4 && item.parts[num - 1]) {
        e.preventDefault();
        togglePart(item.uniqueName, item.parts[num - 1].uniqueName);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggle, togglePart]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h5" gutterBottom>
          Warframe Mastery Tracker
        </Typography>
        <Autocomplete
          freeSolo
          autoHighlight
          options={[...new Set(allItems.map((i) => i.name))]}
          inputValue={search}
          onInputChange={(_, value) => {
            setSearch(value);
            const q = value.trim().toLowerCase();
            highlightedRef.current = q ? (allItems.find((i) => i.name.toLowerCase().includes(q)) ?? null) : null;
          }}
          onChange={(_, value) => setSearch(value ?? '')}
          onHighlightChange={(_, option) => {
            highlightedRef.current = option ? (itemByName.get(option) ?? null) : null;
          }}
          renderOption={(props, option) => {
            const item = itemByName.get(option);
            const itemMastered = item ? mastered.has(item.uniqueName) : false;
            const obtainedParts = item ? (parts[item.uniqueName] ?? []) : [];
            return (
              <li {...props} key={option}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: itemMastered ? 'primary.main' : 'action.disabled' }} />
                    <Typography variant="body2">{option}</Typography>
                  </Box>
                  {item && item.parts.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {item.parts.map((part) => {
                        const partDone = obtainedParts.includes(part.uniqueName);
                        return (
                          <Chip
                            key={part.uniqueName}
                            label={part.name}
                            size="small"
                            variant={partDone ? 'filled' : 'outlined'}
                            color={partDone ? 'primary' : 'default'}
                            sx={{ height: 18, fontSize: '0.65rem' }}
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
            <TextField {...params} label="Search items" size="small" sx={{ mb: 2 }} />
          )}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {masteredCount} / {filtered.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={filtered.length > 0 ? (masteredCount / filtered.length) * 100 : 0}
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
          />
          <ToggleButtonGroup
            value={masteredFilter}
            exclusive
            onChange={(_, v) => { if (v) setMasteredFilter(v); }}
            size="small"
          >
            <ToggleButton value="all" sx={{ px: 1.5 }}>All</ToggleButton>
            <ToggleButton value="hide" sx={{ px: 1.5 }}>Hide mastered</ToggleButton>
            <ToggleButton value="only" sx={{ px: 1.5 }}>Only mastered</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Tabs
        value={category}
        onChange={(_, v) => setCategory(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
      >
        {CATEGORIES.map((cat) => (
          <Tab key={cat} label={cat} value={cat} />
        ))}
      </Tabs>

      <Box ref={containerRef} sx={{ px: 2, pt: 2 }}>
        <Box
          sx={{
            height: virtualizer.getTotalSize(),
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIdx = virtualRow.index * cols;
            const rowItems = filtered.slice(startIdx, startIdx + cols);
            return (
              <Box
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: virtualRow.start,
                  left: 0,
                  right: 0,
                  height: CARD_HEIGHT,
                  display: 'grid',
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
