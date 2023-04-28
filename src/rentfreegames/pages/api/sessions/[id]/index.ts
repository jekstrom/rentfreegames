import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]'
import { getSessionData, updateSession } from '../../../../lib/sessions'
import { getCategories, getMechanics } from '../../../../lib/search'
import { getUserData, getGuestUserData } from '../../../../lib/users'
import { User, GuestUser } from '../../../../interfaces'

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

        const categories = await getCategories(today);
        const mechanics = await getMechanics(today);

        return gameSession
            ? res.status(200).json({gameSession, categories, mechanics, sessionUser: userData})
            : res.status(404).json({ message: `User with id: ${id} not found.` })
    }
}
