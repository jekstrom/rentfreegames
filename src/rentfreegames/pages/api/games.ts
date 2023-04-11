import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from './auth/[...nextauth]'
import { getSortedGamesData, searchGames } from '../../lib/games'
import { getUserData } from '../../lib/users'
import { Game } from '../../interfaces'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    if (req.method === 'GET') {
        const userData = await getUserData(session.user.email);
        const { query } = req
        const { q } = query

        let games = [] as Game[];
        if (q) {
            games = await searchGames(q as string);
        } else {
            games = await getSortedGamesData();
        }

        games = games.map(game => {
            game.owned = userData.games.some(userGame => userGame.BGGId === game.BGGId);

            return game;
        });

        return games
        ? res.status(200).json(games)
        : res.status(404).json({ message: `Games with query ${q} not found.` })
    }

    return res.json({
        message: 'Success'
    });
}
