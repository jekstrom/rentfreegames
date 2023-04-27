import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../../auth/[...nextauth]'
import { getUserData, postGuestUserData } from '../../../../lib/users'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (req.method === 'POST') {
        const payload = JSON.parse(req.body);
        if (!payload) {
            res.status(400).json({ message: "Missing payload." });
            return;
        }
        const result = await postGuestUserData(payload);

        return res.json({
            message: 'Success',
            user: result
        });
    }

    return res.json({
        message: 'Success'
    });
}
