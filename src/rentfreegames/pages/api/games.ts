import { NextApiRequest, NextApiResponse } from 'next'
import { getSortedGamesData } from '../../lib/games'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await getSortedGamesData(req.query?.id)
  res.status(200).json(data)
}
