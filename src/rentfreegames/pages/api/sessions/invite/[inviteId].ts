import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]'
import { getSessionDataByInviteId } from '../../../../lib/sessions'
import { getGuestUserData, getUserData } from '../../../../lib/users'
import { getMechanics, getCategories, buildSearchIdsQuery, searchGamesByIds } from '../../../../lib/search'
import { User, GuestUser } from '../../../../interfaces'

function cleanUser(user: User) {
    (user as any).email = null;
    (user as any).sub = null;
    delete user.sub;
    delete (user as any).email;
    return user;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const userSession = await getServerSession(req, res, authOptions);

    let userData = null as User | GuestUser;
    userData = userSession?.user?.email ? cleanUser(await getUserData(userSession.user.email)) : null;

    const { query } = req
    const { inviteId } = query
    const { guestId } = query

    let gameSession = await getSessionDataByInviteId(inviteId as string);

    if (guestId) {
        userData = await getGuestUserData(guestId as string);
    }

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const categories = await getCategories(today);
    const mechanics = await getMechanics(today);

    return gameSession
        ? res.status(200).json({ gameSession, user: userData, mechanics, categories })
        : res.status(404).json({ message: `Session with invite id: ${inviteId} not found.` })
}
