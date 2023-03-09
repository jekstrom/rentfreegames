import { NextApiRequest, NextApiResponse } from 'next'
import { games } from '../../data/games'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const results = req.query.q ?
        games.filter(game => game.Name.toLowerCase().startsWith((req.query.q as string).toLowerCase())) : []
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ results }))
}
