import { ServerEvent, UserEvent, Player } from "@donk/utils";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Toolbar,
  Divider,
} from "@mui/material";
import { Info, ChevronLeft, ChevronRight, Person } from "@mui/icons-material";
import React, { useEffect } from "react";
import ActionLog from "./ActionLog";
import ActionBox from "./ActionBox";
import { useApi } from "../contexts/ApiContext";

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
  } else if (type === ServerEvent.GameState) {
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
    if (eventJSON.type === ServerEvent.GameState) {
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
  const api = useApi();
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
  const handleInfoOpen = () => setInfoDialogOpen(true);
  const handleInfoClose = () => setInfoDialogOpen(false);

  const [actionLogOpen, setActionLogOpen] = React.useState(true);
  const handleToggleActionLog = () => setActionLogOpen(!actionLogOpen);

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
    // Fetch table data from API
    const fetchTableData = async () => {
      try {
        const tableData = await api.tables.getById(1);
        setTableValue(tableData);
      } catch (error) {
        console.error("Failed to fetch table data:", error);
      }
    };

    fetchTableData();

    ws = new WebSocket("ws://localhost:8080/socket?gameId=1");
    ws.onopen = () => console.log("WebSocket open");
    setupWebSocketListeners();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [api]);

  onTableUpdateHandler = (event) => {
    setTableValue(event.update.table);
  };

  const [userValue, setUserValue] = React.useState<any>(null);
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
      if (p.assignedSeat > 0) {
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

  // Calculate seat position in oval layout
  const calculateSeatPosition = (seatIndex: number, totalSeats: number) => {
    // Define custom angles for each seat to create more space between specific seats
    const customAngles = {
      1: 0,
      2: 35,
      3: 80,
      4: 135,
      5: 165,
      6: 195,
      7: 225,
      8: 280,
      9: 325,
    };

    const angleInDegrees = customAngles[seatIndex] || ((seatIndex - 1) * 360) / totalSeats;
    const angle = (angleInDegrees * Math.PI) / 180 - Math.PI / 2;

    const radiusX = 40; // percentage of container width
    const radiusY = 33; // percentage of container height
    const centerX = 50;
    const centerY = 50;

    return {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle),
      rotation: angle * (180 / Math.PI) + 90,
    };
  };

  // Render all the individual player seats
  const renderSeats = () => {
    const isDisabled = (player: Player) => {
      let toReturn = false;
      if (player && player.assignedSeat > 0) {
        toReturn = true;
      } else if (userValue && userValue.assignedSeat > 0) {
        toReturn = true;
      }
      return toReturn;
    };
    const canStand = (personInSeat) =>
      userValue && userValue.assignedSeat === personInSeat.assignedSeat;

    const totalSeats = Object.keys(seatsValue).length;

    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: "50vh", sm: "60vh", md: "70vh" },
          minHeight: "400px",
          maxHeight: "800px",
          margin: "0 auto",
          background: "linear-gradient(135deg, #0f4c3a 0%, #1a6b4d 100%)",
          borderRadius: "50%",
          border: "8px solid #8b4513",
          boxShadow: "inset 0 0 50px rgba(0,0,0,0.3), 0 0 30px rgba(0,0,0,0.5)",
          overflow: "visible",
        }}
      >
        {/* Poker table center */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40%",
            height: "30%",
            background: "#1a6b4d",
            borderRadius: "50%",
            border: "2px solid rgb(205, 196, 190)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)",
          }}
        ></Box>

        {/* Render seats around the oval */}
        {Object.entries(seatsValue).map(([key, value]) => {
          const seatNum = parseInt(key);
          const position = calculateSeatPosition(seatNum, totalSeats);

          return (
            <Box
              key={key}
              sx={{
                position: "absolute",
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: "translate(-50%, -50%)",
                minWidth: { xs: "80px", sm: "100px", md: "120px" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* Seat indicator */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Person
                  sx={{
                    fontSize: { xs: "48px", sm: "64px", md: "80px" },
                    color: value.assignedSeat > 0 ? "#4a90e2" : "#BBB",
                    filter:
                      value.assignedSeat > 0 ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" : "none",
                    transition: "all 0.3s ease",
                  }}
                />
                {value.name && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "white",
                      fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.7rem" },
                      textAlign: "center",
                      maxWidth: "80px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      mt: -0.5,
                    }}
                  >
                    {value.name}
                  </Typography>
                )}
              </Box>

              {/* Stack display */}
              {value.assignedSeat > 0 && value.stack && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "white",
                    background: "rgba(0,0,0,0.7)",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem" },
                  }}
                >
                  ${value.stack}
                </Typography>
              )}

              {/* Action buttons */}
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    display: canStand(value) ? "none" : "inline-flex",
                    fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem" },
                    minWidth: { xs: "40px", sm: "50px", md: "60px" },
                    height: { xs: "24px", sm: "28px", md: "32px" },
                  }}
                  disabled={isDisabled(value)}
                  onClick={() => sendWSMessage(UserEvent.Sit, key)}
                >
                  Sit
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    display: !canStand(value) ? "none" : "inline-flex",
                    fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem" },
                    minWidth: { xs: "40px", sm: "50px", md: "60px" },
                    height: { xs: "24px", sm: "28px", md: "32px" },
                    color: "white",
                    borderColor: "white",
                  }}
                  disabled={!canStand(value)}
                  onClick={() => sendWSMessage(UserEvent.Stand, key)}
                >
                  Stand
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  const drawerWidth = 250;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        background: "#2c3e50",
      }}
    >
      {/* Action Log Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={actionLogOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Typography variant="h6">Action Log</Typography>
          <IconButton onClick={handleToggleActionLog}>
            <ChevronLeft />
          </IconButton>
        </Toolbar>
        <Divider />
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <ActionLog logs={actionLogValue} />
        </Box>
      </Drawer>

      {/* Toggle Button for when drawer is closed */}
      {!actionLogOpen && (
        <Box
          sx={{
            position: "fixed",
            left: 10,
            top: 100,
            transform: "translateY(-50%)",
            zIndex: 1000,
          }}
        >
          <IconButton
            onClick={handleToggleActionLog}
            sx={{
              background: "rgba(255,255,255,0.9)",
              color: "#2c3e50",
              "&:hover": {
                background: "rgba(255,255,255,1)",
              },
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      )}

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          ml: actionLogOpen ? 0 : 0,
          transition: "margin-left 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 0,
            background: "#2c3e50",
          }}
        >
          <IconButton onClick={handleInfoOpen} sx={{ color: "white" }}>
            <Info />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pb: { xs: "120px", sm: "120px", md: "120px" }, // Account for fixed bottom panel
            transform: !actionLogOpen ? "translateX(-150px)" : "translateX(0)",
            transition: "transform 0.3s ease",
          }}
        >
          {renderSeats()}
        </Box>

        <ActionBox sendWSMessage={sendWSMessage} />
      </Box>

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
