import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../../auth/[...nextauth]'
import { getGameData } from '../../../../../lib/games'
import { addGame, getUserData, getGuestUserData, removeGame } from '../../../../../lib/users'
import { updateUserSwipes } from '../../../../../lib/sessions'
import { User, GuestUser } from '../../../../../interfaces'

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
    const session = await getServerSession(req, res, authOptions);

    const payload = JSON.parse(req.body);
    const { query } = req
    const { userId } = query
    const { id } = query

    if (!id) {
        res.status(400).json({ message: "Missing session id." });
        return;
    }

    if (!userId) {
        res.status(400).json({ message: "Missing user id." });
        return;
    }

    let userData = null as User | GuestUser;
    if (session?.user?.email) {
        userData = cleanUser(await getUserData(session.user.email));
    } else if (!userData) {
        userData = await getGuestUserData(userId as string);
    } else {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    let updatedUser = null as User | GuestUser;
    if (req.method === 'POST') {
        console.log("POSTING to session user endpoint");

        if (!payload.gameId) {
            res.status(400).json({ message: "Missing game id." });
            return;
        }

        const updatedSession = await updateUserSwipes(
            id as string,
            userData.id,
            payload.gameId as string,
            payload.liked as boolean
        );

        return res.json({
            message: 'Success',
            session: updatedSession
        });
    }
    return res.json({
        message: 'Success',
        session: {}
    });
}
