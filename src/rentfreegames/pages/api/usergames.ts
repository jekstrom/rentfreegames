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
        if (!payload.bggId) {
            res.status(400).json({ message: "Missing bggId." });
            return;
        }

        const gameData = await getGameData(payload.bggId.toString());
        console.log(gameData);
        const user = await addGame(session.user.email, gameData);
        console.log(user);

        const updatedSession = await updateUserGameSessions(user);
        console.log(updatedSession);
    } else if (req.method === 'DELETE') {
        const payload = JSON.parse(req.body);
        if (!payload.bggId) {
            res.status(400).json({ message: "Missing bggId." });
            return;
        }

        const user = await removeGame(session.user.email, payload.bggId.toString());
        console.log(user);
        const updatedSession = await updateUserGameSessions(user);
        console.log(updatedSession);
    }

    return res.json({
        message: 'Success',
        user: session.user
    });
}
