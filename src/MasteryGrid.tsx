import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import itemsData from './items-data.json';

type WFItem = {
  uniqueName: string;
  name: string;
  category?: string;
  imageName?: string;
  wikiaThumbnail?: string;
  isPrime?: boolean;
  masteryReq?: number;
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
const STORAGE_KEY = 'wfst-mastered';

const allItems = itemsData as WFItem[];

function loadMastered(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    // ignore
  }
  return new Set();
}

function saveMastered(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function getImageUrl(item: WFItem): string {
  if (item.wikiaThumbnail) return item.wikiaThumbnail;
  return `${IMG_CDN}${item.imageName}`;
}

export default function MasteryGrid() {
  const [mastered, setMastered] = React.useState<Set<string>>(loadMastered);
  const [category, setCategory] = React.useState('All');

  const filtered = category === 'All' ? allItems : allItems.filter((i) => i.category === category);
  const masteredCount = filtered.filter((i) => mastered.has(i.uniqueName)).length;

  function toggle(uniqueName: string) {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(uniqueName)) next.delete(uniqueName);
      else next.add(uniqueName);
      saveMastered(next);
      return next;
    });
  }

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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(192px, 1fr))',
          gap: 1,
          p: 2,
        }}
      >
        {filtered.map((item) => {
          const done = mastered.has(item.uniqueName);
          return (
            <Tooltip key={item.uniqueName} title={item.name} placement="top" arrow>
              <Box
                onClick={() => toggle(item.uniqueName)}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: done ? 'primary.main' : 'transparent',
                  transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                  aspectRatio: '1',
                  bgcolor: 'grey.800',
                }}
              >
                <Box
                  component="img"
                  src={getImageUrl(item)}
                  alt={item.name}
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
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
                      bottom: 2,
                      right: 2,
                      fontSize: 16,
                      color: 'primary.main',
                      bgcolor: 'background.paper',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
