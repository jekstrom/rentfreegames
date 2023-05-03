import { Game } from '../interfaces';
import * as redis from 'redis'

const endpoint = "https://api.boardgameatlas.com/api/search"
const client_id = process.env.BOARDGAME_ATLAS_CLIENT_ID

interface ApiResponse {
  games: Game[];
}

const createCacheClient = async () => {
  try {
    const cache = redis.createClient({
      url: `rediss://${process.env.REDIS_URL}:6380`,
      password: process.env.REDIS_PASSWORD
    });
    await cache.connect();
    cache.on("error", function (error) {
      console.error(error);
    });
    return cache;
  } catch (error) {
    console.log(error);
  }
}

const buildFieldsQueryString = () => {
  return "fields=id,name,description,description_preview,images,url,min_players,max_players,playtime,min_playtime,max_playtime,thumb_url,image_url,rank,average_learning_complexity,average_strategy_complexity,categories,mechanics,primary_publisher"
}

export async function getSortedGamesData(id?: string | string[]): Promise<Game[]> {
  let games = [] as Game[];
  const cache = await createCacheClient();
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const cacheKey = `gamelist:${today}:sorted`;


    const cacheResponse = await cache.get(cacheKey);

    if (cacheResponse) {
      games = JSON.parse(cacheResponse) as Game[];
    }

    if (!games || games.length === 0) {
      console.log("Fetching from API...");
      const response = await fetch(`${endpoint}?client_id=${client_id}&limit=30&ids=${id ?? ""}&order_by=rank&${buildFieldsQueryString()}`);
      const apiResponse = await response.json() as ApiResponse;
      games = apiResponse.games;
      games.forEach(g => g.description = "");

      // Cache games list for 1 day
      await cache.set(cacheKey, JSON.stringify(games), { EX: 86400 });
    }
  } catch (error) {
    console.log(error);
  } finally {
    await cache.disconnect();
  }
  return games;
}

export async function getGamesData(id: string | string[]): Promise<Game[]> {
  let games = [] as Game[];
  const cache = await createCacheClient();
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const cacheKey = `gameslist:${today}:id:${id}`;


    const cacheResponse = await cache.get(cacheKey);

    if (cacheResponse) {
      games = JSON.parse(cacheResponse) as Game[];
    }

    if (!games || games.length === 0) {
      console.log("Fetching from API...");
      const response = await fetch(`${endpoint}?client_id=${client_id}&ids=${id}&${buildFieldsQueryString()}`);
      const apiResponse = await response.json() as ApiResponse;
      games = apiResponse.games;
      games.forEach(g => g.description = "");

      // Cache games list for 1 day
      await cache.set(cacheKey, JSON.stringify(games), { EX: 86400 });
    }
  } catch (error) {
    console.log(error);
  } finally {
    await cache.disconnect();
  }
  return games;
}

export async function getGameData(id?: string): Promise<Game> {
  let games = await getGamesData(id);
  return games.length > 0 ? games[0] : null;
}
