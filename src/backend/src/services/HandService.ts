import { Table } from "src/shared/src";

const STARTING_DECK = [
  "As",
  "2s",
  "3s",
  "4s",
  "5s",
  "6s",
  "7s",
  "8s",
  "9s",
  "Ts",
  "Js",
  "Qs",
  "Ks",
  "Ac",
  "2c",
  "3c",
  "4c",
  "5c",
  "6c",
  "7c",
  "8c",
  "9c",
  "Tc",
  "Jc",
  "Qc",
  "Kc",
  "Ad",
  "2d",
  "3d",
  "4d",
  "5d",
  "6d",
  "7d",
  "8d",
  "9d",
  "Td",
  "Jd",
  "Qd",
  "Kd",
  "Ah",
  "2h",
  "3h",
  "4h",
  "5h",
  "6h",
  "7h",
  "8h",
  "9h",
  "Th",
  "Jh",
  "Qh",
  "Kh",
];

export class HandService {
  playHand = (table: Table) => {
    let deck = this.getFreshDeck();
    deck = this.shuffle(deck);
  };

  getDeck = () => {
    let deck = this.getFreshDeck();
    return this.shuffle(deck);
  };

  PLAY_HAND = (game: any) => {
    // ACTIVE_DECK = FULL_DECK.clone();
    // SHUFFLE_DECK();
    let deck = this.getDeck();

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

  shuffle = (deck: string[]) => {
    return deck.sort(() => Math.random() - 0.5);
  };

  burn = (deck: string[]) => {
    return deck.shift();
  };

  deal = (deck: string[]) => {
    return deck.shift();
  };

  getFreshDeck = () => {
    return this.shuffle([...STARTING_DECK]);
  };
}
