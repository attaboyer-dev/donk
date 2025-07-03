import { ServerEvent, UserEvent, Player } from "@donk/utils";
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
  
  ws.addEventListener(
    "message",
    (event) => {
      let eventJSON = JSON.parse(event.data);
      console.log('server message: %o', eventJSON)
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
            <button hidden={canStand(value)} disabled={isDisabled(value)} onClick={() => sendWSMessage(UserEvent.Sit, key)}>
              Sit
            </button>
            <button hidden={!canStand(value)} disabled={!canStand(value)} onClick={() => sendWSMessage(UserEvent.Stand, key)}>
              Stand
            </button>
          </div>
        ))}
        <p />
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ textAlign: "left", width: "800px", fontSize: "calc(10px + 1vmin)" }}>
          <div>
            <div>Table Name: {tableValue.name}</div>
            <div>Small Blind Size: {tableValue.sbSize}</div>
            <div>Big Blind Size: {tableValue.bbSize}</div>
            <div>Min Buy-In: {tableValue.minBuyIn}</div>
            <div>Max Buy-In: {tableValue.maxBuyIn}</div>
            <div>Game Type: {tableValue.gameType}</div>
          </div>
          {renderSeats()}
        </div>

        <div>
          <label>Actions: </label>
          <input onChange={onChangeHandler} value={inputValue} />
          <select name="Action" onChange={onActionChangeHandler} value={actionValue}>
            <option value={UserEvent.Ready}>Ready</option>
            <option value={UserEvent.Fold}>Fold</option>
            <option value={UserEvent.Check}>Check</option>
            <option value={UserEvent.Call}>Call</option>
            <option value={UserEvent.Raise}>Raise</option>
            <option value={UserEvent.Show}>Show</option>
            <option value={UserEvent.Stand}>Stand</option>
            <option value={UserEvent.BuyIn}>Buy In</option>
            <option value={UserEvent.Rename}>Rename</option>
          </select>
        </div>
        <button onClick={onSend}>Send</button>
        <p>Action Log:</p>
        <div
          style={{
            textAlign: "left",
            width: "800px",
            height: "200px",
            overflowY: "scroll",
            fontSize: "calc(10px + 1vmin)",
          }}
        >
          {renderLogs()}
        </div>
      </header>
    </div>
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
