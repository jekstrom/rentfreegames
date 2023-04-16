import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]'
import { getSessionData } from '../../../lib/sessions'
import { getCategories, getMechanics } from '../../../lib/search'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const userSession = await getServerSession(req, res, authOptions);

    if (!userSession?.user?.email) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    const { query } = req
    const { id } = query
    if (!id) {
        res.status(400).json({ message: "Missing id." });
        return;
    }

    console.log("Getting session data for id: " + id);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    let gameSessions = await getSessionData(id as string, userSession.user.email);
    let gameSession = gameSessions[0];

    const categories = await getCategories(today);
    const mechanics = await getMechanics(today);

    return gameSession
        ? res.status(200).json({gameSession, categories, mechanics})
        : res.status(404).json({ message: `User with id: ${id} not found.` })
}
