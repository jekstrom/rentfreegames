import { CosmosClient } from '@azure/cosmos'
import { Game } from '../interfaces';

const endpoint = process.env.DB_ENDPOINT;
const key = process.env.DB_KEY;
const client = new CosmosClient({ endpoint, key });

const DATABASE = { id: "Games Database" };
const CONTAINER = { id: "Games" };

export async function getSortedGamesData(id?: string | string[]): Promise<Game[]> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  if (id) {
    const { resources } = await container.items
    .query({
      query: "SELECT * from g WHERE g.BGGId = @id",
      parameters: [{ name: "@id", value: id }]
    })
    .fetchAll();

  return resources.map(r => r as Game).sort(g => parseFloat(g.Rank));
  } else {
    const { resources } = await container.items
    .query({
      query: "SELECT * FROM g",
    })
    .fetchAll();

  return resources.map(r => r as Game).sort(g => parseFloat(g.Rank));
  }
}

export async function getGamesData(id: string | string[]): Promise<Game[]> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  if (id) {
    const { resources } = await container.items
      .query({
        query: "SELECT * from g WHERE g.BGGId = @id",
        parameters: [{ name: "@id", value: id }]
      })
      .fetchAll();
  
    return resources.map(r => r as Game);
  } else {
    const { resources } = await container.items
      .query({
        query: "SELECT * FROM g",
      })
      .fetchAll();
  
    return resources.map(r => r as Game);
  }
}

export async function getAllGameIds() {
  const records = await getSortedGamesData();
  return records.map(r => {
    return {
      params: {
        BGGId: r.BGGId
      }
    }
  })
}


export async function getGameData(id?: string): Promise<Game> {
  const gameData = id === undefined ? [] : await getGamesData(id)

  return gameData[0]
}

export async function searchGames(query: string): Promise<Game[]> {
  const { database } = await client.databases.createIfNotExists(DATABASE);
  const { container } = await database.containers.createIfNotExists(CONTAINER);

  console.log("Searching for " + query);

  const { resources } = await container.items
    .query({
      query: "SELECT * from g WHERE LOWER(g.Name) LIKE @query",
      parameters: [{ name: "@query", value: `%${query.toLocaleLowerCase()}%` }]
    })
    .fetchAll();

    console.log("Found games: " + resources.length);

  return resources.map(r => r as Game);
}
