import { CosmosClient } from '@azure/cosmos';
import { GameSwipe, GuestUser, Session, User } from '../interfaces';
import { nanoid } from 'nanoid/non-secure';
import * as crypto from 'crypto';
import dayjs, { Dayjs } from 'dayjs';

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
    var today = new Date();
    const result = await container.items.create(
      {
        id: crypto.randomUUID(),
        title: title,
        created: today.toUTCString(),
        inviteId: `inv--${nanoid(6)}`,
        createdBy: cleanedUser,
        startDate: dayjs(today),
        startTime: dayjs(today),
        expireDate: dayjs(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)), // One week in future
        location: "",
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
      startDate: dayjs(result.resource.startDate),
      startTime: dayjs(result.resource.startTime),
      expireDate: dayjs(result.resource.expireDate),
      location: result.resource.location,
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
        startDate: dayjs(existingSession.startDate),
        startTime: dayjs(existingSession.startTime),
        expireDate: dayjs(existingSession.expireDate),
        location: existingSession.location,
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
      startDate: dayjs(result.resource.startDate),
      startTime: dayjs(result.resource.startTime),
      expireDate: dayjs(result.resource.expireDate),
      location: result.resource.location,
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
        startDate: dayjs(existingSession.startDate),
        startTime: dayjs(existingSession.startTime),
        expireDate: dayjs(existingSession.expireDate),
        location: existingSession.location,
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
      startDate: dayjs(result.resource.startDate),
      startTime: dayjs(result.resource.startTime),
      expireDate: dayjs(result.resource.expireDate),
      location: result.resource.location,
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
    const today = new Date();
    const yesterday = dayjs(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000))
    const { resources } = await container.items
      .query({
        query: "SELECT \
            c.id, \
            c.inviteId, \
            c.title, \
            c.created, \
            c.startDate, \
            c.startTime, \
            c.expireDate, \
            c.createdBy.name, \
            c.location, \
            ARRAY_LENGTH(c.users) as numPlayers, \
            c.users \
        FROM c  \
        JOIN users in c.users \
        WHERE users.id = @id \
        AND c.expireDate >= @today",
        parameters: [{ name: "@id", value: id }, { name: "@today", value: yesterday.format("YYYY-MM-DD") }]
      })
      .fetchAll();

    let gameSessions = [] as Session[];
    resources.forEach(r => {
      gameSessions.push({
        id: r.id,
        title: r.title,
        created: new Date(r.created),
        startDate: dayjs(r.startDate),
        startTime: r.startTime ? dayjs(r.startTime) : null,
        expireDate: dayjs(r.expireDate),
        location: r.location,
        createdBy: { name: r.name, games: [], id: id, sub: "", image: "", gameRatings: [] },
        users: r.users.map(u => { return { name: u.name, games: [], id: u.id, sub: "", image: "" } }),
        numPlayers: r.numPlayers,
        inviteId: r.inviteId,
        numGames: r.users.map(u => u.games.length).reduce((count, sum) => sum += count)
      })
    });
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
            startDate: dayjs(gameSession.startDate),
            startTime: dayjs(gameSession.startTime),
            expireDate: dayjs(gameSession.expireDate),
            location: gameSession.location,
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
        startDate: dayjs(gameSession.startDate),
        startTime: dayjs(gameSession.startTime),
        expireDate: dayjs(gameSession.expireDate),
        location: gameSession.location,
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
            startDate: dayjs(gameSession.startDate),
            startTime: dayjs(gameSession.startTime),
            expireDate: dayjs(gameSession.expireDate),
            location: gameSession.location,
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
