When a new client connects to a backend server, they include the corresponding game id
as part of the request. Disconnections drop them from the WSS. When any client makes an
update, a message gets published on the channel and every subscriber gets the message.
This is how everyone in the table stays up-to-date on player actions.

When 3 people are in the ready state, and it's time to begin, hand state is created and
stored in Redis as well. The server can do some things initially (set button, post blinds)
but players will be doing most of the interacting, in terms of call bet fold. When these
occur, it's similar to the above - user sends message to server, server relays to dealer,
dealer validates, and if valid updates and publishes a message to game-events to inform
the state change.

The questions from here:

1. How does the server relay the action to the dealer
2. How do dealers end up owning specific games? Should they?
3. How to trigger default behavior in the absense of a user command.

Let's focus on Problem 2 - the dealer lifecycle.

Before getting into that, let's set some domain bounds on the services.

"backend" is there for:

- Handling WS based events directly from the client
- Handling API based events directly from the client

This will be used for things like getting table data, game data, hand-history, stats,
whatever. It is an interface point for the client to request things, with the
potential to abstract away other things as necessary.

Managing an ongoing game/hand state, much like a real-life dealer, would be a conflict.

Hence, the introduction of "dealer" workspace/server.

Possibly, a master/worker architecture.

---

Imagine a 3-pod service of "dealer" containers. They are chilling, play has not started.
Then, play begins for one table.

So a reminder of the current state:

-

- Play starts
  - Data is sent to the dealer service (produced via stream)
- A hand is created
  - Dealer service does <action>, updating game-state (hand started)
  - Dealer service produces message to game-events, notifying of state change
    - Subscribers (players) retrieve updated game state
  - Creates a deck for the hand (redis store, TTL 1-hour)
  - Determines next <action> (how?)
  - Dealer service determines next <action>
  - Dealer service produces message for dealer consumer group to do <action> for <game>
- The dealer assigns "the button"
  - A consumer (dealer) receives the <action> for <game>
  - Dealer service retrieves game state from <game>
  - Dealer service validates whether <action> is possible
  - Dealer service enacts <action>, updating game-state
  - Dealer service produces message to game-events, notifying of state change
    - Subscribers (players via WSS-BE) retrieve state and update visually
  - Dealer service determines next <action>
  - Dealer service produces message for dealer consumer group to do <action> for <game>
- Small/big blind post (server)

Q: What happens when the next action is a user action (or default behavior)?
A: - Whether it's a default fallback or a player response, it's produced for the CG - The dealer service produces a message to game-events of "TO ACT", represent a player decision - Subscribers filter? Or do we have a dedicated pub/sub for this? Filter for now. - Expectation, player indicates a response (check, bet, fold) that the server produces for CG - The dealer service handles the game-state changes, and everything else -

Q: How does the dealer service know what to do, or what to expect next?
A: Consumer group ingesting from stream.

Actions:

- Assign button
- Post blinds
-

Decks need to get stored as well. Should be separate from game state to prevent leaks.

Thought about it more. I want to use a sorted set to organize a set of delayed triggers.
After a set interval, any active dealer service will try to pull the messages that have
passed the current time. Of those, they will attempt to delete them. Any success will mean
triggering them. A failure means another process has them.
If something should happen with trying to implement the default action, re-add it.
