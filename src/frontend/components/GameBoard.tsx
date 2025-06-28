import React from "react";

const ws = new WebSocket("ws://localhost:3032");
ws.onopen = (e) => console.log("WebSocket open");

let messageEventListener = (e) => console.log(JSON.parse(e.data));
ws.addEventListener("message", messageEventListener);

const USER_INFO = "USER_INFO";
const TABLE_STATE = "TABLE_STATE";
const PLAYER_SAT = "PLAYER_SAT";
const PLAYER_STOOD = "PLAYER_STOOD";
const RENAME = "RENAME";
const USER_JOINED = "USER_JOINED";
const USER_LEFT = "USER_LEFT";
const PLAYER_BUYIN = "PLAYER_BUYIN";
const READY = "READY";

const foldMessage = () => ({ type: "FOLD" });
const checkMessage = () => ({ type: "CHECK" });
const callMessage = () => ({ type: "CALL" });
const raiseMessage = (amount) => ({ type: "RAISE", val: amount });
const showMessage = () => ({ type: "SHOW" });
const sitMessage = (num) => ({ type: "SIT", val: num });
const standMessage = (num) => ({ type: "STAND", val: num });
const buyInMessage = (amount) => ({ type: "BUYIN", val: amount });
const leaveMessage = () => ({ type: "LEAVE" });
const joinMessage = () => ({ type: "JOIN" });
const renameMessage = (name) => ({ type: "RENAME", val: name });
const readyMessage = () => ({ type: "READY" });

const sendWSMessage = (action, val) => {
  let message = "";
  if (action === "FOLD") {
    message = JSON.stringify(foldMessage());
  } else if (action === "CHECK") {
    message = JSON.stringify(checkMessage());
  } else if (action === "CALL") {
    message = JSON.stringify(callMessage());
  } else if (action === "RAISE") {
    message = JSON.stringify(raiseMessage(val));
  } else if (action === "SHOW") {
    message = JSON.stringify(showMessage());
  } else if (action === "SIT") {
    message = JSON.stringify(sitMessage(val));
  } else if (action === "STAND") {
    message = JSON.stringify(standMessage(val));
  } else if (action === "BUYIN") {
    message = JSON.stringify(buyInMessage(val));
  } else if (action === "LEAVE") {
    message = JSON.stringify(leaveMessage());
  } else if (action === "JOIN") {
    message = JSON.stringify(joinMessage());
  } else if (action === "RENAME") {
    message = JSON.stringify(renameMessage(val));
  } else if (action === "READY") {
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
  if (type === USER_JOINED) {
    toReturn = "User - " + update.name + " - joined the table";
  } else if (type === USER_LEFT) {
    toReturn = "User - " + update.name + " - left the table";
  } else if (type === TABLE_STATE) {
    toReturn = "Loading table state for '" + update.table.name + "'";
  } else if (type === USER_INFO) {
    toReturn = "Loading user info";
  } else if (type === RENAME) {
    toReturn = `Player - ${update.prevName} - renamed to ${update.nextName}`;
  } else if (type === PLAYER_SAT) {
    toReturn = "Player - " + update.name + " - has sat at Seat " + update.location;
  } else if (type === PLAYER_STOOD) {
    toReturn = "Player - " + update.name + " - has stood from Seat " + update.location;
  } else if (type === PLAYER_BUYIN) {
    toReturn = `Player - ${update.name} - has added ${update.amount} to their stack`;
  } else if (type === READY) {
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

ws.addEventListener(
  "message",
  (messageEventListener = (event) => {
    let eventJSON = JSON.parse(event.data);
    if (eventJSON.type === TABLE_STATE) {
      onTableUpdateHandler(eventJSON);
    } else if (eventJSON.type === USER_INFO) {
      onUserUpdateHandler(eventJSON);
    } else if (eventJSON.type === PLAYER_SAT) {
      onPlayerSatHandler(eventJSON);
    } else if (eventJSON.type === RENAME) {
      onRenameHandler(eventJSON);
    }

    onNextStateHandler(eventJSON);
    onEventLogHandler(eventJSON);
  }),
);

const GameBoard = () => {
  const [inputValue, setInputValue] = React.useState("");
  const onChangeHandler = (event) => {
    setInputValue(event.target.value);
  };

  const [actionValue, setActionValue] = React.useState("READY");
  const onActionChangeHandler = (event) => {
    setActionValue(event.target.value);
  };

  const emptySeats = {
    1: {},
    2: {},
    3: {},
    4: {},
    5: {},
    6: {},
    7: {},
    8: {},
    9: {},
  };

  const [tableValue, setTableValue] = React.useState({});
  const [seatsValue, setSeatsValue] = React.useState<any>(emptySeats);
  const [playersValue, setPlayersValue] = React.useState([]);
  const [actionLogValue, setActionLogValue] = React.useState([]);
  onTableUpdateHandler = (event) => {
    setTableValue(event.update.table);
  };

  const [userValue, setUserValue] = React.useState<any>();
  onUserUpdateHandler = (event) => {
    setUserValue(event.update.state);
  };

  // Update client state based on most recent server state
  onNextStateHandler = (event) => {
    const { players } = event.nextState;
    if (userValue && event.type !== RENAME) {
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
      console.log("renameUserValue", userValue);
      let test = { ...userValue, name: nextName };
      console.log("test", test);
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
            <button hidden={canStand(value)} disabled={isDisabled(value)} onClick={() => sendWSMessage("SIT", key)}>
              Sit
            </button>
            <button hidden={!canStand(value)} disabled={!canStand(value)} onClick={() => sendWSMessage("STAND", key)}>
              Stand
            </button>
          </div>
        ))}
        <p />
      </div>
    );
  };

  //console.log('Table Value:', tableValue);
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
            <option value="READY">Ready</option>
            <option value="FOLD">Fold</option>
            <option value="CHECK">Check</option>
            <option value="CALL">Call</option>
            <option value="RAISE">Raise</option>
            <option value="SHOW">Show</option>
            <option value="STAND">Stand</option>
            <option value="BUYIN">Buy In</option>
            <option value="RENAME">Rename</option>
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
