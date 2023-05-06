import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]'
import { getGuestUserData, getUserData, addGameRatings } from '../../../../lib/users'
import { User } from 'next-auth'
import { GuestUser } from '../../../../interfaces'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    let userData = null as User | GuestUser;
    userData = await getUserData(session?.user?.email);

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
        if (!payload || !payload.ratings) {
            res.status(400).json({ message: "Missing payload." });
            return;
        }

        const response = await addGameRatings(userData.id, payload.ratings);

        console.log("response", response);
    }

    return res.json({
        message: 'Success',
        user: userData
    });
}
