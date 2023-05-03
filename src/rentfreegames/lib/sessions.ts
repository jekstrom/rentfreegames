import { CosmosClient } from '@azure/cosmos';
import { GameSwipe, GuestUser, Session, User } from '../interfaces';
import { nanoid } from 'nanoid/non-secure';
import * as crypto from 'crypto';

const endpoint = process.env.DB_ENDPOINT;
const key = process.env.DB_KEY;
const client = new CosmosClient({ endpoint, key });

const DATABASE = { id: "Session Database" };
const CONTAINER = { id: "Session Container" };

function cleanUser(user: User) {
  if (!user) {
    return user;
  }
  (user as any).email = null;
  (user as any).sub = null;
  delete user.sub;
  delete (user as any).email;
  return user;
}

export async function postSessionData(title: string, user: User): Promise<Session> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  try {
    const cleanedUser = cleanUser(user);
    const result = await container.items.create(
      {
        id: crypto.randomUUID(),
        title: title,
        created: new Date().toUTCString(),
        inviteId: `inv--${nanoid(6)}`,
        createdBy: cleanedUser,
        users: [cleanedUser],
        userGameRatings: [],
        userSwipes: []
      }
    );


    if (result.statusCode >= 400) {
      console.log(result.statusCode);
      console.log(result.substatus);
      return null;
    }

    return {
      id: result.resource.id,
      title: result.resource.title,
      created: new Date(result.resource.created),
      inviteId: result.resource.inviteId,
      createdBy: result.resource.createdBy,
      users: result.resource.users,
      userGameRatings: result.resource.userGameRatings,
      userSwipes: result.resource.userSwipes
    };
  }
  catch (ex) {
    console.log("Exception postSessionData: ", ex);
  }
}

export async function addSessionUser(sessionId: string, user: User, inviteId: string): Promise<Session> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  try {
    const existingSessions = await getSessionData(sessionId);
    if (existingSessions[0].inviteId !== inviteId) {
      return null;
    }
    const existingSession = existingSessions[0];
    (user as any).email = null;

    const result = await container.items.upsert(
      {
        id: existingSession.id,
        title: existingSession.title,
        created: existingSession.created,
        inviteId: existingSession.inviteId,
        createdBy: existingSession.createdBy,
        users: [...existingSession.users, user],
        userGameRatings: existingSession.userGameRatings,
        userSwipes: existingSession.userSwipes
      }
    );

    if (result.statusCode >= 400) {
      console.log(result.statusCode);
      console.log(result.substatus);
      return null;
    }

    return {
      id: result.resource.id,
      title: result.resource.title,
      created: new Date(result.resource.created),
      inviteId: result.resource.inviteId,
      createdBy: result.resource.createdBy,
      users: result.resource.users,
      userGameRatings: result.resource.userGameRatings,
      userSwipes: result.resource.userSwipes
    };
  }
  catch (ex) {
    console.log("Exception postSessionData: ", ex);
  }
}

export async function updateUserSwipes(sessionId: string, swipedGames: GameSwipe[]): Promise<Session> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  try {
    const existingSessions = await getSessionData(sessionId);
    const existingSession = existingSessions[0];

    existingSession.userSwipes = existingSession.userSwipes || [];
    existingSession.userSwipes = existingSession.userSwipes.filter(s => swipedGames.some(sw => !(s.userId === sw.userId && s.gameId === sw.gameId)));
    existingSession.userSwipes = [...existingSession.userSwipes, ...swipedGames];

    const result = await container.items.upsert(
      {
        id: existingSession.id,
        title: existingSession.title,
        created: existingSession.created,
        inviteId: existingSession.inviteId,
        createdBy: existingSession.createdBy,
        users: existingSession.users,
        userGameRatings: existingSession.userGameRatings,
        userSwipes: existingSession.userSwipes
      }
    );

    if (result.statusCode >= 400) {
      console.log(result.statusCode);
      console.log(result.substatus);
      return null;
    }

    return {
      id: result.resource.id,
      title: result.resource.title,
      created: new Date(result.resource.created),
      inviteId: result.resource.inviteId,
      createdBy: result.resource.createdBy,
      users: result.resource.users,
      userGameRatings: result.resource.userGameRatings,
      userSwipes: result.resource.userSwipes
    };
  }
  catch (ex) {
    console.log("Exception updateUserSwipes: ", ex.message);
  }
}

export async function getSessionData(id?: string): Promise<Session[]> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  if (id && id.startsWith("inv--")) {
    const session = await getSessionDataByInviteId(id);
    return [session];
  }

  if (id) {
    const { resources } = await container.items
      .query({
        query: "SELECT * from s WHERE s.id = @id",
        parameters: [{ name: "@id", value: id }]
      })
      .fetchAll();

    for (const session of resources) {
      console.log(`Found ${session.id}, ${session.inviteId} is a session `);
    }
    let gameSessions = [] as Session[];
    gameSessions = resources.map(r => r as Session);

    return gameSessions;
  } else {
    const { resources } = await container.items
      .query({
        query: "SELECT * from s"
      })
      .fetchAll();

    let gameSessions = [] as Session[];
    gameSessions = resources.map(r => r as Session);
    return gameSessions;
  }
}

export async function getUserSessionsData(id?: string): Promise<Session[]> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  if (id) {
    const { resources } = await container.items
      .query({
        query: "SELECT c FROM c \
        JOIN users in c.users \
        WHERE users.id = @id",
        parameters: [{ name: "@id", value: id }]
      })
      .fetchAll();

    let gameSessions = [] as Session[];
    gameSessions = resources.map(r => r.c as Session);

    return gameSessions;
  }
}

export async function updateUserGameSessions(user: User): Promise<Session[]> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  if (user) {
    const cleanedUser = cleanUser(user);
    const { resources } = await container.items
      .query({
        query: "SELECT c FROM c \
        JOIN users in c.users \
        WHERE users.id = @id",
        parameters: [{ name: "@id", value: user.id }]
      })
      .fetchAll();

    if (resources && resources.length > 0) {
      let gameSessions = [] as Session[];
      gameSessions = resources.map(r => r.c as Session);

      for (const gameSession of gameSessions) {
        gameSession.users = gameSession.users.map(u => {
          if (u.id === user.id) {
            u.games = user.games;
          }
          return u;
        });
        const result = await container.items.upsert(
          {
            id: gameSession.id,
            title: gameSession.title,
            created: gameSession.created,
            inviteId: gameSession.inviteId,
            createdBy: gameSession.createdBy,
            users: gameSession.users,
            userGameRatings: gameSession.userGameRatings,
            userSwipes: gameSession.userSwipes
          }
        );

        if (result.statusCode >= 400) {
          console.log(result.statusCode);
          console.log(result.substatus);
          return null;
        }
      }
      return gameSessions;
    }
  }
  return [];
}

export async function updateSession(gameSession: Session): Promise<Session> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  if (gameSession) {
    const result = await container.items.upsert(
      {
        id: gameSession.id,
        title: gameSession.title,
        created: gameSession.created,
        inviteId: gameSession.inviteId,
        createdBy: gameSession.createdBy,
        users: gameSession.users,
        userGameRatings: gameSession.userGameRatings,
        userSwipes: gameSession.userSwipes
      }
    );

    if (result.statusCode >= 400) {
      console.log(result.statusCode);
      console.log(result.substatus);
      return null;
    }
  }

  return gameSession;
}

export async function updateUserGameSession(sessionId: string, user: User): Promise<Session[]> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  if (user) {
    const cleanedUser = cleanUser(user);
    const { resources } = await container.items
      .query({
        query: "SELECT c FROM c \
        JOIN users in c.users \
        WHERE users.id = @id",
        parameters: [{ name: "@id", value: user.id }]
      })
      .fetchAll();

    if (resources && resources.length > 0) {
      let gameSessions = [] as Session[];
      gameSessions = resources.map(r => r.c as Session).filter(s => s.id === sessionId);

      for (const gameSession of gameSessions) {
        gameSession.users = gameSession.users.map(u => {
          if (u.id === user.id) {
            u.games = user.games;
          }
          return u;
        });

        const result = await container.items.upsert(
          {
            id: gameSession.id,
            title: gameSession.title,
            created: gameSession.created,
            inviteId: gameSession.inviteId,
            createdBy: gameSession.createdBy,
            users: gameSession.users,
            userGameRatings: gameSession.userGameRatings,
            userSwipes: gameSession.userSwipes
          }
        );

        if (result.statusCode >= 400) {
          console.log(result.statusCode);
          console.log(result.substatus);
          return null;
        }
      }
      return gameSessions;
    }
  }
  return [];
}

export async function getSessionDataByInviteId(inviteId: string): Promise<Session> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  const { resources } = await container.items
    .query({
      query: "SELECT * from s WHERE s.inviteId = @inviteId",
      parameters: [{ name: "@inviteId", value: inviteId }]
    })
    .fetchAll();

  for (const session of resources) {
    console.log(`Found ${session.id}, ${session.inviteId} is a session `);
  }
  let gameSessions = [] as Session[];
  gameSessions = resources.map(r => r as Session);

  return gameSessions[0];
}
