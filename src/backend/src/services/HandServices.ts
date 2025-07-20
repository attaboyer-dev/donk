import { DeckService, Table } from "@donk/utils";

export const playHand = (table: Table) => {
  const deckService = new DeckService();
  let deck = deckService.getFreshDeck();
  deck = deckService.shuffle(deck);
};

const getDeck = () => {
  const deckService = new DeckService();
  let deck = deckService.getFreshDeck();
  return deckService.shuffle(deck);
};

const PLAY_HAND = (game: any) => {
  // ACTIVE_DECK = FULL_DECK.clone();
  // SHUFFLE_DECK();
  let deck = getDeck();

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
