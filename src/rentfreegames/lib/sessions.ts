import { CosmosClient } from '@azure/cosmos';
import { Session, User } from '../interfaces';
import { nanoid } from 'nanoid/non-secure';

const endpoint = process.env.DB_ENDPOINT;
const key = process.env.DB_KEY;
const client = new CosmosClient({ endpoint, key });

const DATABASE = { id: "Session Database" };
const CONTAINER = { id: "Session Container" };

export async function postSessionData(title: string, user: User): Promise<Session> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  try {
    const result = await container.items.create(
      {
        id: crypto.randomUUID(),
        title: title,
        created: new Date().toUTCString(),
        inviteId: `inv--${nanoid()}`,
        createdBy: user,
        users: [user]
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
      users: result.resource.users
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

    const result = await container.items.upsert(
      {
        id: existingSession.id,
        title: existingSession.title,
        created: existingSession.created,
        inviteId: existingSession.inviteId,
        createdBy: existingSession.createdBy,
        users: [...existingSession.users, user]
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
      users: result.resource.users
    };
  }
  catch (ex) {
    console.log("Exception postSessionData: ", ex);
  }
}

export async function getSessionData(id?: string, email?: string): Promise<Session[]> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

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

export async function updateUserGameSessions(user: User): Promise<Session[]> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  if (user) {
    const { resources } = await container.items
      .query({
        query: "SELECT * FROM c \
        WHERE ARRAY_CONTAINS(c.users, {\"email\": \"@email\"},true)",
        parameters: [{ name: "@email", value: user.email }]
      })
      .fetchAll();

    if (resources && resources.length > 0) {
      let gameSessions = [] as Session[];
      gameSessions = resources.map(r => r as Session);

      for (const gameSession of gameSessions) {
        gameSession.users = gameSession.users.map(u => {
          if (u.email === user.email) {
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
            users: gameSession.users
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

export async function getSessionDataByInviteId(inviteId: string, email?: string): Promise<Session> {
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
