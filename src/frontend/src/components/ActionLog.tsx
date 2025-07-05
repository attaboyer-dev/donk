import { Box, Typography, TextField, IconButton } from "@mui/material";
import { Send } from "@mui/icons-material";
import React, { useState } from "react";

const ActionLog = ({ logs }) => {
  const [message, setMessage] = useState("");

  // TODO: Make this a websocket message process
  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        p: 2,
        bgcolor: "transparent",
      }}
    >
      <Box
        component="ol"
        sx={{
          m: 0,
          pl: 2,
          flexGrow: 1,
          overflowY: "auto",
          mb: 2,
        }}
      >
        {logs.map((log: string, i: number) => (
          <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
            {log}
          </Typography>
        ))}
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: "auto",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <IconButton color="primary" onClick={handleSend} disabled={!message.trim()}>
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};
export default ActionLog;
