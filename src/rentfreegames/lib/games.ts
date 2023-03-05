import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { parse } from 'csv-parse'

const gamesDirectory = path.join(process.cwd(), '../../data')
const boardGameFileName = "games.csv";

export async function getSortedGamesData(id?: string | string[]) {
  const allGamesDataFilename = path.join(gamesDirectory, boardGameFileName);

  const records = [];

  const parser = fs
    .createReadStream(allGamesDataFilename)
    .pipe(parse({
      delimiter: ',',
      from_line: 1,
      columns: true
    }));

  for await (const record of parser) {
    record.Rank = record['Rank:boardgame'];
    if (id && record.BGGId == id) {
      records.push(record);
      break;
    }
    else {
      records.push(record);
    }
  }

  return records.sort((a, b) => {
    return a.Rank - b.Rank;
  });
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
  const gameData = id === undefined ? [] : await getSortedGamesData(id)

  return gameData[0]
}