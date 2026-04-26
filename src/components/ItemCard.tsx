import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { WFItem } from "../types";
import { CARD_HEIGHT, IMG_CDN } from "../constants";
import { getImageUrl, openWiki } from "../utils";

type CardProps = {
  item: WFItem;
  done: boolean;
  obtainedParts: string[];
  onToggle: (uniqueName: string) => void;
  onTogglePart: (itemUniqueName: string, partUniqueName: string) => void;
};

export const ItemCard = React.memo(function ItemCard({
  item,
  done,
  obtainedParts,
  onToggle,
  onTogglePart,
}: CardProps) {
  const unobtainable = item.obtainable === false;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: CARD_HEIGHT,
        borderRadius: 1,
        overflow: "hidden",
        border: "2px solid",
        borderColor: done ? "primary.main" : "transparent",
        transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
        bgcolor: "grey.800",
"&:hover": { transform: "scale(1.05)", boxShadow: 6 },
      }}
    >
      <Box
          onClick={(e) => {
            if ((e.metaKey || e.ctrlKey) && item.wikiaUrl) {
              openWiki(item.wikiaUrl);
            } else {
              onToggle(item.uniqueName);
            }
          }}
          sx={{
            position: "relative",
            cursor: "pointer",
            overflow: "hidden",
            flex: 1,
          }}
        >
          <Box
            component="img"
            src={getImageUrl(item)}
            alt={item.name}
            loading="lazy"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
            onError={(e) => {
              if (item.imageName) {
                (e.target as HTMLImageElement).src = `${IMG_CDN}${item.imageName}`;
              }
            }}
          />
          <Box
            component={item.wikiaUrl ? "a" : "div"}
            href={item.wikiaUrl}
            target="_blank"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              px: 1,
              py: 0.5,
              bgcolor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              gap: 0.5,
              textDecoration: "none",
              cursor: item.wikiaUrl ? "pointer" : "default",
              "&:hover": item.wikiaUrl ? { bgcolor: "rgba(0,0,0,0.75)" } : {},
            }}
          >
            <Typography
              variant="caption"
              noWrap
              sx={{ flex: 1, color: "grey.300", lineHeight: 1.3 }}
            >
              {item.name}
            </Typography>
            {unobtainable && (
              <Tooltip title="Unobtainable — Founder exclusive" placement="top">
                <InfoOutlinedIcon sx={{ fontSize: 13, color: "warning.main", flexShrink: 0 }} />
              </Tooltip>
            )}
            {item.wikiaUrl && (
              <OpenInNewIcon sx={{ fontSize: 13, color: "grey.400", flexShrink: 0 }} />
            )}
          </Box>
          {done && (
            <CheckCircleIcon
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                fontSize: 18,
                color: "primary.main",
                bgcolor: "background.paper",
                borderRadius: "50%",
              }}
            />
          )}

      </Box>

      {item.parts.length > 0 && (
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
          }}
        >
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
              label={
                <Typography variant="caption" noWrap>
                  {part.name}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
});
