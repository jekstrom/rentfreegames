import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { getUserData } from './users'
import { Game, Category, Mechanic } from '../interfaces'
import * as redis from 'redis'


const root = "https://api.boardgameatlas.com/api"
const endpoint = `${root}/search`
const gameEndpoint = `${root}/game`
const client_id = process.env.BOARDGAME_ATLAS_CLIENT_ID

export interface ApiResponse {
    games: Game[],
    count: number
}

export interface CategoryApiResponse {
    categories: Category[]
}

export interface MechanicApiResponse {
    mechanics: Mechanic[]
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

export const getCategories = async (today: string) => {
    let categories = [] as Category[];
    const cache = await createCacheClient();
    try {
        const cacheKey = `categorylist:${today}`;
        const cacheResponse = await cache.get(cacheKey);
        if (cacheResponse) {
            const apiResponse = JSON.parse(cacheResponse) as CategoryApiResponse;
            categories = apiResponse.categories;
        }

        if (!categories || categories.length === 0) {
            console.log("Fetching categories from API...");
            const response = await fetch(`${gameEndpoint}/categories?client_id=${client_id}`);
            const apiResponse = await response.json() as CategoryApiResponse;
            categories = apiResponse.categories;

            // Cache games list for 1 day
            await cache.set(cacheKey, JSON.stringify(apiResponse), { EX: 86400 });
        }
    } catch (error) {
        console.log(error);
    } finally {
        await cache.disconnect();
    }
    return categories;
}

export const getMechanics = async (today: string) => {
    let mechanics = [] as Mechanic[];
    const cache = await createCacheClient();
    try {
        const cacheKey = `mechanicslist:${today}`;
        const cacheResponse = await cache.get(cacheKey);
        if (cacheResponse) {
            const apiResponse = JSON.parse(cacheResponse) as MechanicApiResponse;
            mechanics = apiResponse.mechanics;
        }

        if (!mechanics || mechanics.length === 0) {
            console.log("Fetching mechanics from API...");
            const response = await fetch(`${gameEndpoint}/mechanics?client_id=${client_id}`);
            const apiResponse = await response.json() as MechanicApiResponse;
            mechanics = apiResponse.mechanics;

            // Cache games list for 1 day
            await cache.set(cacheKey, JSON.stringify(apiResponse), { EX: 86400 });
        }
    } catch (error) {
        console.log(error);
    } finally {
        await cache.disconnect();
    }
    return mechanics;
}

const buildFieldsQueryString = () => {
    return "fields=id,name,description_preview,images,url,min_players,max_players,playtime,min_playtime,max_playtime,thumb_url,image_url,rank,average_learning_complexity,average_strategy_complexity,categories,mechanics,primary_publisher"
}

export const buildSearchQuery = (query: string, page: number, pageLength: number, category: string, mechanic: string, players?: string) => {
    let searchQuery = `${endpoint}?client_id=${client_id}&limit=${pageLength}&skip=${page * pageLength ?? 0}&${buildFieldsQueryString()}`;
    if (query) {
        searchQuery += `&name=${query.substring(0, 50)}`;
    }
    if (category) {
        searchQuery += `&categories=${category.substring(0, 50)}`;
    }
    if (mechanic) {
        searchQuery += `&mechanics=${mechanic.substring(0, 50)}`;
    }
    if (players) {
        if (players === "any") {
            players = "1";
        }
        searchQuery += `&gt_max_players=${parseInt(players) - 1}`;
    }
    return searchQuery;
}

export const buildSearchIdsQuery = (ids: string[]) => {
    let searchQuery = `${endpoint}?client_id=${client_id}&limit=100&${buildFieldsQueryString()}`;

    if (ids) {
        searchQuery += `&ids=${ids.join(",")}`;
    }

    return searchQuery;
}

export const searchGamesByIds = async (searchQuery: string) => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    let cacheKey = `gamelist:${today}`;
    let games = [] as Game[];

    if (searchQuery) {
        const cache = await createCacheClient();
        try {
            cacheKey += `:${searchQuery}`;
            const cacheResponse = await cache.get(cacheKey);
            if (cacheResponse) {
                const apiResponse = JSON.parse(cacheResponse) as ApiResponse;
                games = apiResponse.games;
            }

            if (!games || games.length === 0) {
                console.log("Fetching results from API...");
                const response = await fetch(searchQuery);
                const apiResponse = await response.json() as ApiResponse;
                games = apiResponse.games;

                // Cache games list for 1 day
                await cache.set(cacheKey, JSON.stringify(apiResponse), { EX: 86400 });
            }
        } catch (error) {
            console.log(error);
        } finally {
            await cache.disconnect();
        }
    }
    return games;
}

export const getSearchTitle = (req: NextApiRequest, categories: Category[], mechanics: Mechanic[]) => {
    if (!req.query) {
        return "All games";
    }

    const { query } = req
    const { q } = query
    const { cat } = query
    const { mec } = query
    const { players } = query
    const { owned } = query

    if ((owned as string).toLowerCase() === "true") {
        return "My games";
    }

    let title = "Search results for";
    let and = false;

    if (q) {
        title += ` "${q}"`;
        and = true;
    }

    if (cat) {
        const categoryString = categories?.find(c => c.id === cat)?.name;
        if (categoryString) {
            if (and) {
                title += ` and in category "${categoryString}"`;
            } else {
                title += ` games in category "${categoryString}"`;
            }
        }
        and = true;
    }

    if (mec) {
        const mechanicString = mechanics?.find(m => m.id === mec)?.name;
        if (mechanicString) {
            if (and) {
                title += ` and with mechanic "${mechanicString}"`;
            } else {
                title += ` games with mechanic "${mechanicString}"`;
            }
        }
        and = true;
    }

    if (players && parseInt(players as string) > 1) {
        if (and) {
            title += ` and for at least ${players} players`;
        } else {
            title += ` games for at least ${players} players`;
        }
    }

    return title == "Search results for" ? "All games" : title;
}

