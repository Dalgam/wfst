import * as React from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(800);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const filtered = React.useMemo(
    () => category === 'All' ? allItems : allItems.filter((i) => i.category === category),
    [category],
  );

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

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h5" gutterBottom>
          Warframe Mastery Tracker
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {masteredCount} / {filtered.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={filtered.length > 0 ? (masteredCount / filtered.length) * 100 : 0}
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
          />
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
