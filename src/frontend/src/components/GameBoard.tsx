import { ServerEvent, UserEvent, Player } from "@donk/utils";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Paper,
  IconButton,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Info } from "@mui/icons-material";
import React, { useEffect } from "react";

const foldMessage = () => ({ type: UserEvent.Fold });
const checkMessage = () => ({ type: UserEvent.Check });
const callMessage = () => ({ type: UserEvent.Call });
const raiseMessage = (amount) => ({ type: UserEvent.Raise, val: amount });
const showMessage = () => ({ type: UserEvent.Show });
const sitMessage = (num) => ({ type: UserEvent.Sit, val: num });
const standMessage = (num) => ({ type: UserEvent.Stand, val: num });
const buyInMessage = (amount) => ({ type: UserEvent.BuyIn, val: amount });
const leaveMessage = () => ({ type: UserEvent.Leave });
const joinMessage = () => ({ type: UserEvent.Join });
const renameMessage = (name) => ({ type: UserEvent.Rename, val: name });
const readyMessage = () => ({ type: UserEvent.Ready });

let ws = null;

const sendWSMessage = (action: UserEvent, val: any) => {
  if (!ws) return;

  let message = "";
  if (action === UserEvent.Fold) {
    message = JSON.stringify(foldMessage());
  } else if (action === UserEvent.Check) {
    message = JSON.stringify(checkMessage());
  } else if (action === UserEvent.Call) {
    message = JSON.stringify(callMessage());
  } else if (action === UserEvent.Raise) {
    message = JSON.stringify(raiseMessage(val));
  } else if (action === UserEvent.Show) {
    message = JSON.stringify(showMessage());
  } else if (action === UserEvent.Sit) {
    message = JSON.stringify(sitMessage(val));
  } else if (action === UserEvent.Stand) {
    message = JSON.stringify(standMessage(val));
  } else if (action === UserEvent.BuyIn) {
    message = JSON.stringify(buyInMessage(val));
  } else if (action === UserEvent.Leave) {
    message = JSON.stringify(leaveMessage());
  } else if (action === UserEvent.Join) {
    message = JSON.stringify(joinMessage());
  } else if (action === UserEvent.Rename) {
    message = JSON.stringify(renameMessage(val));
  } else if (action === UserEvent.Ready) {
    message = JSON.stringify(readyMessage());
  } else {
    console.log("Unexpected event");
  }

  console.log("Sending message to server: %s", message);
  ws.send(message);
};

const eventToLog = (event) => {
  const { type, update } = event;
  let toReturn = "";
  if (type === ServerEvent.UserJoined) {
    toReturn = "User - " + update.name + " - joined the table";
  } else if (type === ServerEvent.UserLeft) {
    toReturn = "User - " + update.name + " - left the table";
  } else if (type === ServerEvent.TableState) {
    toReturn = "Loading table state for '" + update.table.name + "'";
  } else if (type === ServerEvent.UserInfo) {
    toReturn = "Loading user info";
  } else if (type === ServerEvent.Rename) {
    toReturn = `Player - ${update.prevName} - renamed to ${update.nextName}`;
  } else if (type === ServerEvent.PlayerSat) {
    toReturn = "Player - " + update.name + " - has sat at Seat " + update.location;
  } else if (type === ServerEvent.PlayerStood) {
    toReturn = "Player - " + update.name + " - has stood from Seat " + update.location;
  } else if (type === ServerEvent.PlayerBuyin) {
    toReturn = `Player - ${update.name} - has added ${update.amount} to their stack`;
  } else if (type === ServerEvent.Ready) {
    toReturn = `Player - ${update.name} - is ready`;
  }
  return toReturn;
};

// Set empty functions until React Hooks are set
let onTableUpdateHandler = (event: any) => {};
let onUserUpdateHandler = (event: any) => {};
let onPlayerSatHandler = (event: any) => {};
let onRenameHandler = (event: any) => {};
let onEventLogHandler = (event: any) => {};
let onNextStateHandler = (event: any) => {};

const setupWebSocketListeners = () => {
  if (!ws) return;

  ws.addEventListener("message", (event) => {
    let eventJSON = JSON.parse(event.data);
    console.log("server message: %o", eventJSON);
    if (eventJSON.type === ServerEvent.TableState) {
      onTableUpdateHandler(eventJSON);
    } else if (eventJSON.type === ServerEvent.UserInfo) {
      onUserUpdateHandler(eventJSON);
    } else if (eventJSON.type === ServerEvent.PlayerSat) {
      onPlayerSatHandler(eventJSON);
    } else if (eventJSON.type === ServerEvent.Rename) {
      onRenameHandler(eventJSON);
    }

    onNextStateHandler(eventJSON);
    onEventLogHandler(eventJSON);
  });
};

const GameBoard = () => {
  const [inputValue, setInputValue] = React.useState("");
  const onChangeHandler = (event) => {
    setInputValue(event.target.value);
  };

  const [actionValue, setActionValue] = React.useState(UserEvent.Ready);
  const onActionChangeHandler = (event) => {
    setActionValue(event.target.value);
  };

  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
  const handleInfoOpen = () => setInfoDialogOpen(true);
  const handleInfoClose = () => setInfoDialogOpen(false);

  const emptySeats: { [key: number]: Player } = {
    1: {} as Player,
    2: {} as Player,
    3: {} as Player,
    4: {} as Player,
    5: {} as Player,
    6: {} as Player,
    7: {} as Player,
    8: {} as Player,
    9: {} as Player,
  };

  const [tableValue, setTableValue] = React.useState<any>({});
  const [seatsValue, setSeatsValue] = React.useState<{ [key: number]: Player }>(emptySeats);
  const [playersValue, setPlayersValue] = React.useState([]);
  const [actionLogValue, setActionLogValue] = React.useState([]);

  useEffect(() => {
    ws = new WebSocket("ws://localhost:3032");
    ws.onopen = () => console.log("WebSocket open");
    setupWebSocketListeners();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  onTableUpdateHandler = (event) => {
    setTableValue(event.update.table);
  };

  const [userValue, setUserValue] = React.useState<any>({});
  onUserUpdateHandler = (event) => {
    setUserValue(event.update.state);
  };

  // Update client state based on most recent server state
  onNextStateHandler = (event) => {
    const { players } = event.nextState;
    if (userValue && event.type !== ServerEvent.Rename) {
      // RENAME updates the UserValue in it's own manner
      const userIndex = players.findIndex((p) => p.name === userValue.name);
      setUserValue(players[userIndex]);
    }
    const nextSeats = { ...emptySeats };
    players.forEach((p) => {
      if (p.isSitting) {
        nextSeats[p.assignedSeat] = p;
      }
    });
    setPlayersValue(players);
    setSeatsValue(nextSeats);
  };

  onPlayerSatHandler = (event) => {
    const { location, name } = event.update;
    const { players } = event.nextState;
    setPlayersValue(players);
    const nextSeats = { ...seatsValue };
    nextSeats[location] = players[players.findIndex((player) => player.name === name)];
    setSeatsValue(nextSeats);
  };

  onRenameHandler = (event) => {
    const { prevName, nextName } = event.update;
    if (userValue.name === prevName) {
      setUserValue({ ...userValue, name: nextName });
    }
  };

  onEventLogHandler = (event) => {
    setActionLogValue([...actionLogValue, eventToLog(event)]);
  };

  const onSend = () => {
    sendWSMessage(actionValue, inputValue);
    setInputValue("");
  };

  // Render all the logs of actions taken
  const renderLogs = () => (
    <ol>
      {actionLogValue.map((log, i) => (
        <li key={i}>{log}</li>
      ))}
    </ol>
  );

  // Render all the individual player seats
  const renderSeats = () => {
    const isDisabled = (seat) => {
      let toReturn = false;
      if (seat && seat.isSitting) {
        toReturn = true;
      } else if (userValue && userValue.isSitting) {
        toReturn = true;
      }
      return toReturn;
    };
    const canStand = (personInSeat) => userValue && userValue.assignedSeat === personInSeat.assignedSeat;
    return (
      <div>
        <p />
        {Object.entries(seatsValue).map(([key, value]) => (
          <div key={key}>
            Seat {key}: {value.name ? `Name: (${value.name}) ` : " "}
            {value.isSitting ? `Stack: (${value.stack}) ` : " "}
            <Button
              variant="contained"
              size="small"
              sx={{ display: canStand(value) ? "none" : "inline-flex", mr: 1 }}
              disabled={isDisabled(value)}
              onClick={() => sendWSMessage(UserEvent.Sit, key)}
            >
              Sit
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{ display: !canStand(value) ? "none" : "inline-flex" }}
              disabled={!canStand(value)}
              onClick={() => sendWSMessage(UserEvent.Stand, key)}
            >
              Stand
            </Button>
          </div>
        ))}
        <p />
      </div>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={handleInfoOpen}>
          <Info />
        </IconButton>
      </Box>
      {renderSeats()}

      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "200px",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
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
            <Button variant="contained" onClick={onSend}>
              Send
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 1 }} />

        <Typography variant="subtitle2" gutterBottom>
          Action Log
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 1,
            bgcolor: "grey.50",
          }}
        >
          <Box component="ol" sx={{ m: 0, pl: 2 }}>
            {actionLogValue.map((log, i) => (
              <Typography component="li" key={i} variant="body2" sx={{ mb: 0.5 }}>
                {log}
              </Typography>
            ))}
          </Box>
        </Box>
      </Paper>

      <Dialog open={infoDialogOpen} onClose={handleInfoClose} maxWidth="sm" fullWidth>
        <DialogTitle>Table Information</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="h6" component="div">
              {tableValue.name}
            </Typography>
            <Typography variant="body1">Small Blind: {tableValue.sbSize}</Typography>
            <Typography variant="body1">Big Blind: {tableValue.bbSize}</Typography>
            <Typography variant="body1">Min Buy-In: {tableValue.minBuyIn}</Typography>
            <Typography variant="body1">Max Buy-In: {tableValue.maxBuyIn}</Typography>
            <Typography variant="body1">Game Type: {tableValue.gameType}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInfoClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GameBoard;

// NEXT GOALS:
/*
 - DONE: Handle disconnection events (closing tab should update others; send event)
 - DONE: Handle "stand" events, updating UI
 - DONE: Handle "buy-in" events
 - DONE: Handle "Rename" events,
 - DONE: Handle "ready" events
 - DONE: Progress to game state updates
 - Handle stacks on stand/leave events (tracking money changes)
 - Handle name collisions for RENAME events
*/
