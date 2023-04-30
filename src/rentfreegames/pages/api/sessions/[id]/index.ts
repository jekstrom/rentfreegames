import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]'
import { getSessionData, updateSession } from '../../../../lib/sessions'
import { getCategories, getMechanics } from '../../../../lib/search'
import { getUserData, getGuestUserData } from '../../../../lib/users'
import { User, GuestUser, Game, GameRating, Owner } from '../../../../interfaces'

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

function getUniqueGames(games: Game[]) {
    // Unique games by BGGId
    let uniqueGames = Object.values(
        games.reduce((acc, obj) => ({ ...acc, [obj.id]: obj }), {})
    ) as Game[];

    // Remove duplicate owners
    for (const game of uniqueGames) {
        game.ownedBy = Object.values(game.ownedBy.reduce((acc, obj) => ({ ...acc, [obj.userId]: obj }), {})) as [Owner];
    }
    return uniqueGames;
}

function mergeGameOwners(games: Game[]): Game[] {
    for (const game of games) {
        const otherGame = games.find(g => g.id === game.id && g.ownedBy.every(o => game.ownedBy.every(ob => ob.userId !== o.userId)));
        if (otherGame) {
            game.ownedBy = otherGame.ownedBy.concat(game.ownedBy) as [Owner];
            otherGame.ownedBy = otherGame.ownedBy.concat(game.ownedBy) as [Owner];
            otherGame.owned = true;
        }
    }
    return games;
}

function flattenGames(users: User[], userRatings: GameRating[], userId: string) {
    let games: Game[] = [];
    if (!users) {
        return [];
    }
    users.forEach(user => {
        user.games.forEach(game => {
            game.owned = user.id === userId;
            game.ownedBy = [{ name: user.name, userId: user.id }];
            game.rating = 2.5;
            game.avg_rating = 2.5;
            if (userRatings) {
                const gameRatings = userRatings.filter(r => r.gameId === game.id).map(r => r.rating);
                game.rating = userRatings.find(r => r.gameId === game.id && r.userId === userId)?.rating ?? 2.5;
                if (gameRatings && gameRatings.length > 0) {
                    game.avg_rating = Math.round((gameRatings.reduce((r, acc) => acc += r) / gameRatings.length) * 2) / 2 ?? 2.5;
                }
            }
            games.push(game);
        });
    });

    games = mergeGameOwners(games);

    return getUniqueGames(games);
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const userSession = await getServerSession(req, res, authOptions);

    let userData = null as User | GuestUser;
    userData = cleanUser(await getUserData(userSession?.user?.email));

    const { query } = req
    const { guestId } = query
    const { id } = query

    if (!userData) {
        userData = await getGuestUserData(guestId as string);
    }
    if (!userData) {
        res.status(401).json({ message: "No user." });
        return;
    }
    
    if (!id) {
        res.status(400).json({ message: "Missing id." });
        return;
    }

    if (req.method === 'POST') {
        const payload = JSON.parse(req.body);
        if (!payload.gameId) {
            res.status(400).json({ message: "Missing gameId." });
            return;
        }
        if (!payload.rating) {
            res.status(400).json({ message: "Missing rating." });
            return;
        }

        if (parseFloat(payload.rating) < 0 || parseFloat(payload.rating) > 5) {
            res.status(400).json({ message: "Rating out of bounds." });
            return;
        }

        const gameSessions = await getSessionData(id as string);
        const gameSession = gameSessions[0];

        // Logic to restrict to only registered users, no guests
        // if (!gameSession.users.some(u => u.id == userData.id)) {
        //     console.log(`User ${userData.id} not found in session ${id}.`);
        //     res.status(404).json({ message: "User not found in session." });
        //     return;
        // }

        gameSession.userGameRatings = gameSession.userGameRatings || [];
        if (!gameSession.userGameRatings.some(u => u.userId == userData.id && u.gameId == payload.gameId)) {
            gameSession.userGameRatings.push({ userId: userData.id, gameId: payload.gameId, rating: payload.rating });
        }
        gameSession.userGameRatings.forEach(u => {
            if (u.userId == userData.id && u.gameId == payload.gameId) {
                u.rating = payload.rating;
            }
        });

        console.log("Updating user game session...", JSON.stringify(gameSession.userGameRatings));

        const newSession = await updateSession(gameSession);

        return res.json(newSession);
    } else {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

        let gameSessions = await getSessionData(id as string);
        let gameSession = gameSessions[0];

        gameSession.games = flattenGames(gameSession.users, gameSession.userGameRatings, userData.id);
        gameSession.users = gameSession.users.map(u => {u.games = []; return u});
        const categories = await getCategories(today);
        const mechanics = await getMechanics(today);

        return gameSession
            ? res.status(200).json({gameSession, categories, mechanics, sessionUser: userData})
            : res.status(404).json({ message: `User with id: ${id} not found.` })
    }
}
