import * as React from "react";
import Box from "@mui/material/Box";

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="kbd"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 0.75,
        py: 0.25,
        borderRadius: "4px",
        border: "1px solid",
        borderColor: "grey.600",
        borderBottomWidth: "2px",
        bgcolor: "grey.800",
        color: "text.secondary",
        fontSize: "0.7rem",
        fontFamily: "monospace",
        lineHeight: 1.4,
        userSelect: "none",
      }}
    >
      {children}
    </Box>
  );
}
