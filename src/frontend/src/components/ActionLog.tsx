import { Box, Typography } from "@mui/material";
import React from "react";

const ActionLog = ({ logs }) => {
  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        p: 2,
        bgcolor: "transparent",
      }}
    >
      <Box component="ol" sx={{ m: 0, pl: 2 }}>
        {logs.map((log, i) => (
          <Typography component="li" key={i} variant="body2" sx={{ mb: 0.5 }}>
            {log}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};
export default ActionLog;
