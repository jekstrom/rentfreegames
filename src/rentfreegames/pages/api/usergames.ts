import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { getGameData } from '../../lib/games'
import { addGame, removeGame } from '../../lib/users'
import { updateUserGameSessions } from '../../lib/sessions'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    if (req.method === 'POST') {
        const payload = JSON.parse(req.body);
        if (!payload.id) {
            res.status(400).json({ message: "Missing id." });
            return;
        }

        const gameData = await getGameData(payload.id.toString());
        const user = await addGame(session.user.email, gameData);
        const updatedSession = await updateUserGameSessions(user);
    } else if (req.method === 'DELETE') {
        const payload = JSON.parse(req.body);
        if (!payload.id) {
            res.status(400).json({ message: "Missing id." });
            return;
        }

        const user = await removeGame(session.user.email, payload.id.toString());
        const updatedSession = await updateUserGameSessions(user);
    }

    return res.json({
        message: 'Success',
        user: session.user
    });
}
