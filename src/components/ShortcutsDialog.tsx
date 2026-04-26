import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { Kbd } from "./Kbd";

type Props = {
  open: boolean;
  onClose: () => void;
  isMac: boolean;
};

export function ShortcutsDialog({ open, onClose, isMac }: Props) {
  const mod = isMac ? "⌘" : "Ctrl";
  const rows = [
    { heading: "Global" },
    { keys: [mod, "K"], desc: "Focus search bar" },
    { heading: "No item selected (not searching)" },
    { keys: [mod, ","], desc: "Cycle category left" },
    { keys: [mod, "."], desc: "Cycle category right" },
    { heading: "While searching" },
    { keys: ["↑", "↓"], desc: "Navigate autocomplete results" },
    { keys: ["Esc"], desc: "Clear search and close autocomplete" },
    { heading: "Item selected / highlighted in search" },
    { keys: [mod, "Space"], desc: "Toggle mastered on highlighted item" },
    { keys: [mod, "1"], desc: "Toggle component 1 on highlighted item" },
    { keys: [mod, "2"], desc: "Toggle component 2 on highlighted item" },
    { keys: [mod, "3"], desc: "Toggle component 3 on highlighted item" },
    { keys: [mod, "4"], desc: "Toggle component 4 on highlighted item" },
    { heading: "Card image" },
    { keys: [mod, "click"], desc: "Open wiki page for item in new tab" },
  ] as const;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Keyboard Shortcuts</DialogTitle>
      <DialogContent>
        {rows.map((row, i) =>
          "heading" in row ? (
            <Typography
              key={i}
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", mt: i === 0 ? 0 : 2 }}
            >
              {row.heading}
            </Typography>
          ) : (
            <Table key={i} size="small" sx={{ mb: 0 }}>
              <TableBody>
                <TableRow sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ width: 180, pl: 0 }}>
                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                      {row.keys.map((k, ki) => (
                        <React.Fragment key={ki}>
                          {ki > 0 && (
                            <Typography variant="caption" color="text.disabled">
                              +
                            </Typography>
                          )}
                          <Kbd>{k}</Kbd>
                        </React.Fragment>
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{row.desc}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
