import { games } from '../data/games'
import { Game } from '../interfaces'

export async function getSortedGamesData(id?: string | string[]): Promise<Game[]> {
  if (id) {
    return [games.find((g) => g.BGGId === id)];
  } else {
    return games.sort((a, b) => {
      return parseFloat(a.Rank) - parseFloat(b.Rank);
    });
  }
}

export async function getGamesData(id: string | string[]): Promise<Game[]> {
  if (id) {
    return [games.find((g) => g.BGGId === id)];
  } else {
    return games;
  }
}

export async function getAllGameIds() {
  const records = await getSortedGamesData();
  return records.map(r => {
    return {
      params: {
        BGGId: r.BGGId
      }
    }
  })
}


export async function getGameData(id?: string): Promise<Game> {
  const gameData = id === undefined ? [] : await getGamesData(id)

  return gameData[0]
}