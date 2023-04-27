import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { getGameData } from '../../lib/games'
import { addGame, getUserData, getGuestUserData, removeGame } from '../../lib/users'
import { updateUserGameSessions } from '../../lib/sessions'
import { User, GuestUser } from '../../interfaces'

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
    const session = await getServerSession(req, res, authOptions);

    const payload = JSON.parse(req.body);
    if (!payload.id) {
        res.status(400).json({ message: "Missing id." });
        return;
    }

    let userData = null as User | GuestUser;
    if (session?.user?.email) {
        userData = cleanUser(await getUserData(session.user.email));
    } else if (payload.guestId) {
        userData = await getGuestUserData(payload.guestId);
    } else {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    let updatedUser = null as User | GuestUser;
    if (req.method === 'POST') {
        const gameData = await getGameData(payload.id.toString());
        updatedUser = await addGame(userData.id, gameData);
        const updatedSession = await updateUserGameSessions(updatedUser);
    } else if (req.method === 'DELETE') {
        updatedUser = await removeGame(userData.id, payload.id.toString());
        const updatedSession = await updateUserGameSessions(updatedUser);
    }

    return res.json({
        message: 'Success',
        user: updatedUser
    });
}
