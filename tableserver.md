// Table is created
// Player 1 (Owner) joins the table
// Player 2 joins the table
// Player 3 joins the table
// Player 1 sits at seat 3  (server call)
// Player 2 sits at seat 8  (server call)
// Player 3 sits at seat 1  (server call)
// Player 1 buys in for 40  (server call)
// Player 2 buys in for 35  (server call)
// Player 3 buys in for 50  (server call)
// PLayer 1 sits
// PLayer 2 sits
// Player 3 sits
// Player 4 joins the table
// Player 1 starts the game 


// Essentially, when the table is created, there can be 0-9 players
// Players that join start a Webhook auth-pattern between the server/client
//

// MVP Requirements:
/* 
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

*/

/*
 State Objects:
    1. TABLE STATE
      - Static and pre-defined. Never changes. Contains min/max, game types, table size, etc.
    2. PLAYER STATE
      - More dynamic. Represents details of the player, and how they interact with the table (sitting, standing, buying-in, ready)
      - Includes an ID that is a hash of the user's unique ID + table + randomized. Exists in scope of the current table/game. More later.
    3. GAME STATE
      - Represents the state of the active hand


*/

/*
  ARCHITECTURE
    - POKER_TABLE is a DynamoDB table
    - POKER_TABLE has a single item - "The Table" with set values
        - In the future, there can be n amount of tables
     
*/

/*

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
*/


/*
Other:
 - Server will drop player if it hasn't received action in awhile
 - Server will deallocate the POKER_TABLE if there are no players for a long period of time 
*/

/*
 How does the lambda determine the availability of the server, which to allocate?
 What is the sort of connection information that gets passed to allow for the WS connection?
 
*/

/*
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

*/