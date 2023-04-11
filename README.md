# rentfreegames

A web app that maintains a database of users' board games along with some metadata:
* number of players
* time
* coop or comp
* heavy or casual

The user can create a "game session" and invite other people to the session.

in a game session:
* A list of games available that fit the number of users in the session will be displayed
* further filters are available in the UI for other metadata
* Some sort of voting mechanism?


To invite people to a game session, a user can create an invite link.

The games available are a union with all players' games that match the existing filters on that session, including # of players.

## Technical


### Database
* store games in elasticsearch
  * two indexes:
    * indexed by user id - each user has its own collection of games
    * indexed by game id - master index of games
* store sessions in cosmos db
* store user-sessions in cosmos db
* store users in cosmos db

* game
  * name - string
  * numPlayersMin - number
  * numPlayersMax - number
  * recNumOfPlayersMin - number?
  * recNumOfPlayersMax - number?
  * timeReqMin - time
  * timeReqMax - time
  * isCoop - bool
  * isCasual - bool
  * gameId - guid

* session
  * sessionId - guid
  * inviteId - string
  * name - string?
  * users - list of users { userId, username }

note: when getting a session we can use the userIds to calculate the list of games dynamically

* users
  * userId - guid
  * email - string
  * username - string
  * sessions - list of sessions { sessionId, name }

### API

Endpoints

* /games/<game id>?
  * GET - list of games from master list
  * POST - add a game to the master list
  * PUT - update a game in the master list
* /user/<user id>/games/<game id>?
  * GET - list of user's games
  * POST - add a game to the user's list
  * PUT - update a game in the user's list
* /user/<user id>
  * GET - get user details
  * POST - add user profile
  * PUT - update user profile
* /user/<user id>/session/<session id>
  * DELETE - remove user from a session
* /sessions
  * GET - list sessions
  * POST - create new session
* /sessions/<session id>
  * GET - get session details
  * PUT - update session
* /sessions/<session id>/invite
  * POST - create invite link
* /sessions/<session id>/invite/<invite id>
  * GET - get session details from invite

### Authn
azure ad b2c

### Authz
rbac ?

### Compute
azure functions serverless


### Frontend
react/redux
next.js?

### Mobile
Add ability to swipe left/right on games in a session
If multiple people swipe right on the same game, then that game is promoted in the session

### Future
Review hosts

publish public games session

expire game sessions