import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { getSortedGamesData } from '../../lib/games'
import { getUserData } from '../../lib/users'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    if (req.method === 'GET') {
        const userData = await getUserData(session.user.email);
        let games = await getSortedGamesData();

        games = games.map(game => {
            game.owned = userData.games.some(userGame => userGame.BGGId === game.BGGId);

            return game;
        });

        return res.json({
            message: 'Success',
            games: games
        });
    }

    return res.json({
        message: 'Success'
    });
}
