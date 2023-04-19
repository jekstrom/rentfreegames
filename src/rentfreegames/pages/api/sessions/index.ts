import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]'
import { getUserData } from '../../../lib/users'
import { getSessionData, getUserSessionsData, postSessionData } from '../../../lib/sessions'
import { User } from '../../../interfaces'

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

        const userData = cleanUser(await getUserData(userSession.user.email));

        const newSession = await postSessionData(payload.title, userData);

        return res.json(newSession);
    } else if (req.method === 'GET') {
        const userSession = await getServerSession(req, res, authOptions);

        if (!userSession?.user?.email) {
            res.status(401).json({ message: "You must be logged in." });
            return;
        }
        const userData = cleanUser(await getUserData(userSession.user.email));
    
        let gameSessions = await getUserSessionsData(userData.id as string);    
    
        return gameSessions
            ? res.status(200).json(gameSessions)
            : res.status(404).json({ message: `User with id: ${userData?.id} not found.` })
    }

    res.status(404).json({ message: "Method not found." });
    return;
}
