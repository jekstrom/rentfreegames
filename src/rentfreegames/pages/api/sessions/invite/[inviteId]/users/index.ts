import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../../../auth/[...nextauth]'
import { getUserData } from '../../../../../../lib/users'
import { addSessionUser } from '../../../../../../lib/sessions'
import { User } from '../../../../../../interfaces'

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

    if (req.method === 'POST') {
        const payload = JSON.parse(req.body);
        if (!payload.inviteId) {
            res.status(400).json({ message: "Missing inviteId." });
            return;
        }
        if (!payload.sessionId) {
            res.status(400).json({ message: "Missing sessionId." });
            return;
        }

        const userData = cleanUser(await getUserData(userSession.user.email));

        const updatedSession = await addSessionUser(payload.sessionId, userData, payload.inviteId);

        return res.json(updatedSession);
    }

    res.status(404).json({ message: "Method not found." });
    return;
}
