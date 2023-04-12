import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]'
import { getSessionDataByInviteId } from '../../../../lib/sessions'
import { getUserData } from '../../../../lib/users'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const userSession = await getServerSession(req, res, authOptions);

    if (!userSession?.user?.email) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    const userData = await getUserData(userSession.user.email);

    const { query } = req
    const { inviteId } = query

    console.log("Getting session data for invite id: " + inviteId);

    let gameSession = await getSessionDataByInviteId(inviteId as string, userSession.user.email);

    return gameSession
        ? res.status(200).json({gameSession, user: userData})
        : res.status(404).json({ message: `Session with invite id: ${inviteId} not found.` })
}
