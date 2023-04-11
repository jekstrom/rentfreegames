import { CosmosClient } from '@azure/cosmos'
import { Session, User } from '../interfaces';

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
        inviteId: crypto.randomUUID(),
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
      users: result.resource.users
    };
  }
  catch (ex) {
    console.log("Exception postSessionData: ", ex);
  }
}

function flattenGames(gameSessions: Session[], email?: string) {
  // flatten gameSessions.users.games to just gameSessions.games
  return gameSessions.map(session => {
    session.games = session.users.flatMap(user => {
      return user.games.map(g => {
        g.ownedBy = user.name
        g.owned = email && user.email === email;
        return g;
      });
    }).filter((game, index, self) =>
      self.findIndex(g => g.BGGId === game.BGGId) === index
    )

    return session;
  });
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

    return flattenGames(gameSessions, email);
  } else {
    const { resources } = await container.items
      .query({
        query: "SELECT * from s"
      })
      .fetchAll();

    let gameSessions = [] as Session[];
    gameSessions = resources.map(r => r as Session);
    return flattenGames(gameSessions, email);
  }
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

  return flattenGames(gameSessions, email)[0];
}
