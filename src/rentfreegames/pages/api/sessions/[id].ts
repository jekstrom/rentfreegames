import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]'
import { getSessionData } from '../../../lib/sessions'
import { getCategories, getMechanics } from '../../../lib/search'
import { getUserData } from '../../../lib/users'
import { User } from '../../../interfaces'

function cleanUser(user: User) {
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
    const userData = cleanUser(await getUserData(userSession.user.email));

    const { query } = req
    const { id } = query
    if (!id) {
        res.status(400).json({ message: "Missing id." });
        return;
    }

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    let gameSessions = await getSessionData(id as string);
    let gameSession = gameSessions[0];

    const categories = await getCategories(today);
    const mechanics = await getMechanics(today);

    return gameSession
        ? res.status(200).json({gameSession, categories, mechanics, sessionUser: userData})
        : res.status(404).json({ message: `User with id: ${id} not found.` })
}
