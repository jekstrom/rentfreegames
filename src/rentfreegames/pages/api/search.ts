import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { getUserData } from '../../lib/users'
import { Game, Category, Mechanic } from '../../interfaces'
import * as redis from 'redis'
import { ConflictResolutionMode } from '@azure/cosmos'

const root = "https://api.boardgameatlas.com/api"
const endpoint = `${root}/search`
const gameEndpoint = `${root}/game`
const client_id = process.env.BOARDGAME_ATLAS_CLIENT_ID

interface ApiResponse {
    games: Game[],
    count: number
}

interface CategoryApiResponse {
    categories: Category[]
}

interface MechanicApiResponse {
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

const getCategories = async (today: string) => {
    let categories = [] as Category[];
    const cache = await createCacheClient();
    try {
        const cacheKey = `categorylist:${today}`;
        const cacheResponse = await cache.get(cacheKey);
        if (cacheResponse) {
            const apiResponse = JSON.parse(cacheResponse) as CategoryApiResponse;
            categories = apiResponse.categories;
        }

        console.log("Categories: ", categories.length);

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

const getMechanics = async (today: string) => {
    let mechanics = [] as Mechanic[];
    const cache = await createCacheClient();
    try {
        const cacheKey = `mechanicslist:${today}`;
        const cacheResponse = await cache.get(cacheKey);
        if (cacheResponse) {
            const apiResponse = JSON.parse(cacheResponse) as MechanicApiResponse;
            mechanics = apiResponse.mechanics;
        }

        console.log("Mechanics: ", mechanics.length);

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

const buildSearchQuery = (query: string, page: number, pageLength: number, category: string, mechanic: string, players?: number) => {
    let searchQuery = `${endpoint}?client_id=${client_id}&limit=${pageLength}&skip=${page * pageLength ?? 0}`;
    console.log("Page: ", page);
    console.log("pageLength: ", page);
    console.log("skip: ", page * pageLength);
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
        searchQuery += `&gt_max_players=${players - 1}`;
    }
    return searchQuery;
}

const getSearchTitle = (req: NextApiRequest, categories: Category[], mechanics: Mechanic[]) => {
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
            title += ` games for ${players} players`;
        }
    }

    return title == "Search results for" ? "All games" : title;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const pageLength = 30;
    let cacheKey = `gamelist:${today}`;
    let totalPages = 1;

    if (req.method === 'GET') {
        const userData = await getUserData(session.user.email);
        const { query } = req
        const { q } = query
        const { p } = query
        const { cat } = query
        const { mec } = query
        const { players } = query
        const { owned } = query

        console.log("Query: ", query);

        const categories = await getCategories(today);
        const mechanics = await getMechanics(today);
        const title = getSearchTitle(req, categories, mechanics);

        if ((owned as string).toLowerCase() === "true") {
            const ownedGames = userData?.games?.filter(g => {
                return (cat ? g.categories.some(c => c.id === cat) : true)
                && (mec ? g.mechanics.some(m => m.id === mec) : true)
                && (players ? g.max_players >= parseInt(players as string) : true)
                && (q ? g.name.toLowerCase().includes(q as string) : true);
            }).map(g => {
                g.owned = true; 
                return g;
            }) ?? [];
            console.log("Owned games: ", ownedGames.length);
            res.status(200).json({ games: ownedGames, categories, mechanics, totalPages, title });
            return;
        }

        const searchQuery = buildSearchQuery(q as string, parseInt(p as string ?? "0"), pageLength, cat as string, mec as string, parseInt(players as string));
        

        console.log("Searchquery: ", searchQuery);

        let games = [] as Game[];

        if (searchQuery) {
            // Filter by search query
            const cache = await createCacheClient();
            try {
                cacheKey += `:${searchQuery}`;
                const cacheResponse = await cache.get(cacheKey);
                if (cacheResponse) {
                    const apiResponse = JSON.parse(cacheResponse) as ApiResponse;
                    games = apiResponse.games;
                    totalPages = apiResponse.count / pageLength;
                }

                if (!games || games.length === 0) {
                    console.log("Fetching results from API...");
                    const response = await fetch(searchQuery);
                    const apiResponse = await response.json() as ApiResponse;
                    games = apiResponse.games;
                    totalPages = apiResponse.count / pageLength;

                    console.log("Got Results: ", games.length);

                    // Cache games list for 1 day
                    await cache.set(cacheKey, JSON.stringify(apiResponse), { EX: 86400 });
                }
            } catch (error) {
                console.log(error);
            } finally {
                await cache.disconnect();
            }
        }

        games = games.map(game => {
            game.owned = userData.games.some(userGame => userGame.id === game.id);

            return game;
        });


        return games
            ? res.status(200).json({ games, categories, mechanics, totalPages: Math.floor(Math.min(totalPages, 1000 / pageLength)), title })
            : res.status(404).json({ message: `Games with query ${q} not found.` })
    }

    return res.json({
        message: 'Success'
    });
}
