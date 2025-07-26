// None of these can changes while a table is active
// or has sitting players
const TABLE_STATIC = {
  sb_size: 0.0, // Small blind of the table
  bb_size: 0.0, // Big blind of the table
  min_buyin: 0, // Minimum buy-in amount allowed
  max_buyin: 0, // Maximum buy-in amount allowed
  name: "", // Name of the table
  id: 0, // Unique ID of the table
  owner_player_id: 0, // Unique Player ID of the Table Owner
  game_type: "NLHE", // Game Type of the table
};

// Randomly assigns the button to one of the players
const ASSIGN_BUTTON = (players: any) => {
  // Pull from top of deck, compare, assign
  // If there's a tie, repeat for only the tying players
  console.log("players", players);
};

// Moves the button to the next highest seat
const MOVE_BUTTON = (players: any) => {};

// Pay blind for a specific player
const PAY_BLIND = (table: any, player: any, blindType: any) => {
  // Determine the blind amount from table information
  // Substract from player amount
  // Log
  // Notify player
};

// Assign blinds for the players
const ASSIGN_BLINDS = (players: Array<string>) => {
  const sbPlayer = players[0]; // Determine
  const bbPlayer = players[1]; // Determine
  // PAY_BLIND(activeTable, sbPlayer, "small");
  // PAY_BLIND(activeTable, bbPlayer, "big");
};

const DEAL_CARDS = (table: any, players: any) => {
  // Find UTG+0
};

let isFirstHand = true;

const PLAY_HAND = (players: any) => {
  // ACTIVE_DECK = FULL_DECK.clone();
  // SHUFFLE_DECK();
  // isFirstHand ? ASSIGN_BUTTON(players) : MOVE_BUTTON(players);
  // isFirstHand = false;
  // ASSIGN_BLINDS(players);
  // TODO - Edge case: what is 3 players and 2 go all in from blinds?
  /*
      Can hand be played? If so, do below.
      A hand cannot be played if:
        Less than 2 players are sitting with non-zero stack
        Owner has not explictly started the game
    */
  /*
      NOTE: If a user has not acted when prompted, twice in a row, they stand.
    */
  // DEAL_CARDS();
  // preflop();
  // flop();
  /*
    WHILE: A hand can be played:
    Start Hand:
      Execute PRE-FLOP Action:
        The server generates a new deck and shuffles
        The server determines the location of the button
        The server assigns small/big blinds
        Execute LOG_AND_UPDATE Action:
          The server logs the above actions
          The server updates the users with state change 
        Start user play cycle:
          WHILE: Users sitting users can act
          Determine next user to act
          Notify that user to act, starting timer for X seconds
          IF: no response in X seconds - 
            The server forces FOLD or CHECK, and updates state
            IF user is AFK - Execute AFK Action (user stands):
              ...TBD 
          ELSE:
            The server validates the user reply, and updates state
            IF validation fails: the server forces FOLD or CHECK
          FINALLY:
            Execute LOG_AND_UPDATE Action (see above)
          IF: one player remains in hand - 
            Execute WINNER Action:
              Move pot amount to WINNING player stack
              Execute LOG_AND_UPDATE Action (see above)
              Cleanup internal state; HAND COMPLETE
      Execute FLOP Action:
        The server updates the users with state change
        The server adds 3 cards to the board state
        Execute LOG_AND_UPDATE Action (see above)
        Start user play cycle (see above)
      Execute TURN Action:
        The server updates the users with state change
        The server adds 1 card to the board state
        Execute LOG_AND_UPDATE Action (see above)
        Start user play cycle (see above)      
      Execute RIVER Action:
        The server updates the users with state change
        The server adds 1 card to the board state
        Execute LOG_AND_UPDATE Action (see above)
        Start user play cycle (see above)
      Execute SHOWDOWN Action: (enhance workflow)
        Determine best hand among the remaining players
        Execute WINNER Action (see above)  
      SLEEP for 7 second (allow players a breather, UI updates)
      HAND COMPLETE
              */
  /*
      NOTE: LOG_AND_ACTION takes in an ACTION key, that determines
            the type of action taken, how to log, how to report the
            action back to playing users
    */
};
