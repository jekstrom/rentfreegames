import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]'
import { getGuestUserMetaData, getUserMetaData } from '../../../../lib/users'
import { User } from 'next-auth'
import { GuestUser } from '../../../../interfaces'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    let userData = null as User | GuestUser;
    userData = await getUserMetaData(session?.user?.email);

    const { query } = req
    const { guestId } = query

    if (!userData) {
        userData = await getGuestUserMetaData(guestId as string);
    }
    if (!userData) {
        res.status(401).json({ message: "No user." });
        return;
    }

    return res.json({
        message: 'Success',
        user: userData
    });
}
