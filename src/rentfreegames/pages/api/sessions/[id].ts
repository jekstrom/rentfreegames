import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]'
import { getSessionData } from '../../../lib/sessions'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const userSession = await getServerSession(req, res, authOptions);

    if (!userSession?.user?.email) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    const { query } = req
    const { id } = query

    console.log("Getting session data for id: " + id);

    let gameSessions = await getSessionData(id as string, userSession.user.email);

    return gameSessions
        ? res.status(200).json(gameSessions[0])
        : res.status(404).json({ message: `User with id: ${id} not found.` })
}
