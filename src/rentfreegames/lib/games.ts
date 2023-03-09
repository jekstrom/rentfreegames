import { games } from '../data/games'

export async function getSortedGamesData(id?: string | string[]) {
  if (id) {
    return [games.find((g) => g.BGGId === id)];
  } else {
    return games.sort((a, b) => {
      return parseFloat(a.Rank) - parseFloat(b.Rank);
    });
  }
}

export async function getGamesData(id: string | string[]) {
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


export async function getGameData(id?: string) {
  const gameData = id === undefined ? [] : await getGamesData(id)

  return gameData[0]
}