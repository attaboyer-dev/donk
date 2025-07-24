// Table is created
// Player 1 (Owner) joins the table
// Player 2 joins the table
// Player 3 joins the table
// Player 1 sits at seat 3 (server call)
// Player 2 sits at seat 8 (server call)
// Player 3 sits at seat 1 (server call)
// Player 1 buys in for 40 (server call)
// Plyaer 2 buys in for 35 (server call)
// Player 3 buys in for 50 (server call)
// PLayer 1 sits
// PLayer 2 sits
// Player 3 sits
// Player 4 joins the table
// Player 1 starts the game

// Essentially, when the table is created, there can be 0-9 players
// Players that join start a Webhook auth-pattern between the server/client
//

// MVP Requirements:
/\*

- A single, static poker table - "The Table" - is available to all users
- Users must provide an alias upon joining a poker table
- Users can select a seat upon joining a poker table
- Users are standing when they join a poker table
- Users can sit in their seat at any time
- Users can buy-in between the table min/max
- Users can "Ready" if the table hasn't started and they are sitting
- A table becomes active once all sitting players are "Ready"
- Users who are standing are not dealt hands in an active table
- Users who are sitting are dealt hands if they have a non-zero stack
- Users can buy-in up to the max if they are not actively in a hand
- Users can stand if they are not actively in a hand
- Users can leave the table if they are standing
- A table becomes inactive when there is < 2 sitting users with a positive stack

- NICE TO HAVE: All movement of money is logged

\*/

/\*
State Objects: 1. TABLE STATE - Static and pre-defined. Never changes. Contains min/max, game types, table size, etc. 2. PLAYER STATE - More dynamic. Represents details of the player, and how they interact with the table (sitting, standing, buying-in, ready) - Includes an ID that is a hash of the user's unique ID + table + randomized. Exists in scope of the current table/game. More later. 3. GAME STATE - Represents the state of the active hand

\*/

/\*
ARCHITECTURE - POKER_TABLE is a DynamoDB table - POKER_TABLE has a single item - "The Table" with set values - In the future, there can be n amount of tables

\*/

/\*

How do we think about the about the relationship between poker tables and servers?

- Poker tables need to get allocated/deallocated to a server
- Load Balancing used to spin up new servers as necessary

Assume 100 tables, with roughly 5-8 players each. Servers can roughly handle 20 tables max.

"Join Table" Workflow:

- Client calls Lambda JOIN_TABLE Lambda
- Lambda checks whether the POKER_TABLE is allocated to a server
  - IF: YES - Return game server connection info to client
  - ELSE: Allocate POKER_TABLE to available server - Return game server connection info to client
- Lambda return credentials to client for connection
- Client leverages credentials to game server for POKER_TABLE
- If accepted - Client displays "POKER_TABLE" view
- Server adds PLAYER to TABLE, and starts to get keep track
  \*/

/\*
Other:

- Server will drop player if it hasn't received action in awhile
- Server will deallocate the POKER_TABLE if there are no players for a long period of time
  \*/

/\*
How does the lambda determine the availability of the server, which to allocate?
What is the sort of connection information that gets passed to allow for the WS connection?

\*/

/\*
TO DO:

- Create DynamoDB Table for POKER_TABLE
- Create Lambda game-server connection microservice
- Create AMI/EC2 template for game servers
- Create ELB/NLB for routing traffic into game servers from client
- Create Load Balancer for EC2s
- Create Application Load Balance for routing requests to a lambda function
- Create Route53 record for public traffic
- Create the front-end application
- Create the back-end server logic
- Hosting/serving solution for the FE resources (S3)?

\*/

Thoughts:

A user needs to be created before anything else. To do this, there needs to be an email verification flow
in part to ensure we can do a "Forgot Password" type flow.

Once the user is created, they should be able to create a table.
For creating a table, they can select a game type, min/max buy in and small blind / big blind amounts.
In the future, more things get added. Particularly, allowing a set of players access to the table.

A table cannot have it's attributes changed after creating. A new table has to be created.

Once a table is created, the owner of the table can decide to "Start Game" for that table.
This creates a "Game" mapped against the table ID.

A game has a reference to the table, based on the ID.
Players can come and go.

A player, is a user representation within a game.
This includes the money they've bought in with, their location,
whether they're sitting or standing, etc.

A game can be active or inactive (hands being played).
A game can be open or closed, where closed is a terminal state.

A game has a number of HANDS associated to it.
Each hand represents the full set of action for a round of poker, from start to finish.

A game's state is representitive of things between hands. It gets updated after each hand completes.
A hand represents a set of actions. It also keeps track of the game state in-flux.
For example: while a hand is in progress the internal GAME state have different
values for how much each player has behind, whether they've folded. Their position, etc.

Movements of players or additional buy-ins are reflected as the game state gets updated between hands.

Each hand is captured and stored against an ID.
Each hand has a list of structued actions against it.

Each hand is mapped to a set of users (players) who played within it.
Those players can review the hands, and have them tracked against them.
Each user has their total profit/loss per hand tracked against them
based on their hands.

Anatomy of a Hand

- Determine participating players
  - Is sitting
  - Is ready
  - Has money behind
- If there's not enough particpating players
  - Set timer: after period: ACTTION: game is closed
- Determine button assignment
  - Is first hand? Deal cards and show highest.
  - No first hand? Move button to next qualifying player
- ACTION: Assign button
- ACTION: Post blinds

NOTE:

- After any period of money being moved into a pot, a CHECK is done whether the player is all in.
- If a player is all in, the current pot becomes a sub-pot.
- The ids of eligible players are mapped against it.
- The player who is all-in becomes uneligible; similar to a fold

TODO:

- How to handle standing to avoid blinds?
- How to you handle pots and side-pots

07/20

I have a series of database entities, but, I need a way to convert them into relevant structures for the UI/backend.

Thinking at the pre-state:

- There is a set of users
- There is a table with stored attributes
- There is a game that's been created FROM that table
- The game was JUST opened up, with players that have yet to join

Then

NEXT STEPS:

- Load a single table and game into the database

Websocket Server Implementation Logic

Definitions:

- WSS: Websocket Server

Assumptions:

- A WSS may have multiple client connections for various ongoing games
- Connection clients (players) of a game may be spread across multiple WSS
- WSS are expected to be distributed across K8S pods, and may go down at any time

Thoughts:

As a client connects to a WSS, it indicates what game it's attempting to join.
Validation is done to associate that connection to an internal user (TODO) as well
as check whether that user has access to a given table/game (TODO).

Upon connecting to a table and after validation, a client will attempt to subscribe
to a Redis channel corresponding to the requested game. This channel will have
messages published against it whenever the game state is updated. By joining, this
triggers the "playedAdded" event, modifying the game state. A message gets published.

To simplify: whenever the game state is altered, an update is done in Redis to reflect
it and a message it published to the game channel indicating _what_ changed.
Subscribers of the channel, learning of the change, retrieve the updated game state,
and send to the clients.
