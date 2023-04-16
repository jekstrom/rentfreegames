import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { getGameData } from '../../lib/games'
import { addGame, getUserData, removeGame } from '../../lib/users'
import { updateUserGameSessions } from '../../lib/sessions'
import { User } from '../../interfaces'

function cleanUser(user: User) {
    (user as any).email = null;
    (user as any).sub = null;
    return user;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }
    const userData = cleanUser(await getUserData(session.user.email));

    if (req.method === 'POST') {
        const payload = JSON.parse(req.body);
        if (!payload.id) {
            res.status(400).json({ message: "Missing id." });
            return;
        }

        const gameData = await getGameData(payload.id.toString());
        const user = await addGame(userData.id, gameData);
        const updatedSession = await updateUserGameSessions(user);
    } else if (req.method === 'DELETE') {
        const payload = JSON.parse(req.body);
        if (!payload.id) {
            res.status(400).json({ message: "Missing id." });
            return;
        }

        const user = await removeGame(userData.id, payload.id.toString());
        const updatedSession = await updateUserGameSessions(user);
    }

    return res.json({
        message: 'Success',
        user: session.user
    });
}
