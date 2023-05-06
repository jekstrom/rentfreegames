import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]'
import { getUserData, getGuestUserData } from '../../../lib/users'
import { getSessionData, getUserSessionsData, postSessionData } from '../../../lib/sessions'
import { User, GuestUser } from '../../../interfaces'

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

    if (!userData) {
        userData = await getGuestUserData(guestId as string);
    }
    if (!userData) {
        res.status(401).json({ message: "No user." });
        return;
    }

    if (req.method === 'POST') {
        const payload = JSON.parse(req.body);
        if (!payload.title) {
            res.status(400).json({ message: "Missing title." });
            return;
        }

        const newSession = await postSessionData(payload.title, userData);

        return res.json(newSession);
    } else if (req.method === 'GET') {
        let gameSessions = await getUserSessionsData(userData.id as string);    
    
        return gameSessions
            ? res.status(200).json(gameSessions)
            : res.status(404).json({ message: `User with id: ${userData?.id} not found.` })
    }

    res.status(404).json({ message: "Method not found." });
    return;
}
