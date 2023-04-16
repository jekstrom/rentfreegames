import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]'
import { getSessionDataByInviteId } from '../../../../lib/sessions'
import { getUserData } from '../../../../lib/users'
import { getMechanics, getCategories } from '../../../../lib/search'
import { User } from '../../../../interfaces'

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
    const { inviteId } = query

    let gameSession = await getSessionDataByInviteId(inviteId as string);

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const categories = await getCategories(today);
    const mechanics = await getMechanics(today);

    return gameSession
        ? res.status(200).json({ gameSession, user: userData, mechanics, categories })
        : res.status(404).json({ message: `Session with invite id: ${inviteId} not found.` })
}
