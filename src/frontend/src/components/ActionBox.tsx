import React, { useState } from "react";
import { UserEvent } from "@donk/utils";
import { Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField } from "@mui/material";

const ActionBox = ({ sendWSMessage }) => {
  const [inputValue, setInputValue] = useState("");
  const onChangeHandler = (event) => {
    setInputValue(event.target.value);
  };

  const [actionValue, setActionValue] = useState(UserEvent.Ready);
  const onActionChangeHandler = (event) => {
    setActionValue(event.target.value);
  };

  const handleSend = () => {
    sendWSMessage(actionValue, inputValue);
    setInputValue("");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        height: "100px",
        p: 2,
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255,255,255,0.2)",
        transition: "left 0.3s ease",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
        <TextField
          label="Value"
          variant="outlined"
          size="small"
          value={inputValue}
          onChange={onChangeHandler}
          sx={{ minWidth: 120 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select value={actionValue} label="Action" onChange={onActionChangeHandler}>
            <MenuItem value={UserEvent.Ready}>Ready</MenuItem>
            <MenuItem value={UserEvent.Fold}>Fold</MenuItem>
            <MenuItem value={UserEvent.Check}>Check</MenuItem>
            <MenuItem value={UserEvent.Call}>Call</MenuItem>
            <MenuItem value={UserEvent.Raise}>Raise</MenuItem>
            <MenuItem value={UserEvent.Show}>Show</MenuItem>
            <MenuItem value={UserEvent.Stand}>Stand</MenuItem>
            <MenuItem value={UserEvent.BuyIn}>Buy In</MenuItem>
            <MenuItem value={UserEvent.Rename}>Rename</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Stack>
    </Paper>
  );
};

export default ActionBox;
