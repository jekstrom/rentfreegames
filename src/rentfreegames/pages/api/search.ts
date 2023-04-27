import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { getGuestUserData, getUserData } from '../../lib/users'
import { Game, GuestUser, User } from '../../interfaces'
import * as redis from 'redis'
import { getCategories, getMechanics, getSearchTitle, buildSearchQuery, ApiResponse } from '../../lib/search'

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

const getOwnedGames = async (email: string, owned: string, cat: string, mec: string, players: string, q: string, guestId?: string) => {
    let userData = cleanUser(await getUserData(email));
    if (!userData) {
        userData = await getGuestUserData(guestId as string);
    }

    if ((owned as string).toLowerCase() === "true") {
        return userData?.games?.filter(g => {
            return (cat ? g.categories.some(c => c.id === cat) : true)
            && (mec ? g.mechanics.some(m => m.id === mec) : true)
            && (players && players !== "any" && players !== "players" ? g.max_players >= parseInt(players as string) : true)
            && (q ? g.name.toLowerCase().includes(q as string) : true);
        }).map(g => {
            g.owned = true; 
            return g;
        }) ?? [];
    }
    return []
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const pageLength = 45;
    let cacheKey = `gamelist:${today}`;
    let totalPages = 1;

    if (req.method === 'GET') {
        const { query } = req
        const { q } = query
        const { p } = query
        const { cat } = query
        const { mec } = query
        const { players } = query
        const { owned } = query
        const { guestId } = query

        console.log("Queryxx: ", query);

        const categories = await getCategories(today);
        const mechanics = await getMechanics(today);
        const title = getSearchTitle(req, categories, mechanics);

        if ((session?.user?.email || guestId) && (owned as string).toLowerCase() === "true") {
            const ownedGames = await getOwnedGames(session?.user?.email, owned as string, cat as string, mec as string, players as string, q as string, guestId as string);
            res.status(200).json({ games: ownedGames, categories, mechanics, totalPages, title });
            return;
        }

        const searchQuery = buildSearchQuery(q as string, parseInt(p as string ?? "0"), pageLength, cat as string, mec as string, players as string);
        
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

        if (session?.user?.email || guestId) {
            let userData = cleanUser(await getUserData(session?.user?.email));
            if (!userData) {
                userData = await getGuestUserData(guestId as string);
            }
            games = games.map(game => {
                game.owned = userData.games.some(userGame => userGame.id === game.id);

                return game;
            });
        }


        return games
            ? res.status(200).json({ games, categories, mechanics, totalPages: Math.floor(Math.min(totalPages, 1000 / pageLength)), title })
            : res.status(404).json({ message: `Games with query ${q} not found.` })
    }

    return res.json({
        message: 'Success'
    });
}
