import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]'
import { getUserData } from '../../../lib/users'
import { getSessionData, postSessionData } from '../../../lib/sessions'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const userSession = await getServerSession(req, res, authOptions);

    if (!userSession?.user?.email) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    if (req.method === 'POST') {
        const payload = JSON.parse(req.body);
        if (!payload.title) {
            res.status(400).json({ message: "Missing title." });
            return;
        }

        const userData = await getUserData(userSession.user.email);

        const newSession = await postSessionData(payload.title, userData);
        console.log(newSession);

        return res.json(newSession);
    } else if (req.method === 'GET') {
        let payload = {} as any;
        if (req.body) {
            payload = JSON.parse(req.body);
        }

        let gameSessions = await getSessionData(payload?.id?.toString(), userSession.user.email);

        return res.json(gameSessions);
    }

    res.status(404).json({ message: "Method not found." });
    return;
}
