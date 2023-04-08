import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export function getAllSessionIds() {
  return ["1", "2"].map(id => {
    return {
      params: {
        id: id
      }
    }
  })
}

export async function getSessionData(id: string) {
  return {
    id: id,
    title: "session title",
    games: [
      {
        "BGGId": "1",
        "Name": "Die Macher",
        "Description": "die macher game seven sequential political race different region germany player charge national political party manage limited resource help party victory win party victory point regional election different way score victory point regional election supply eighty victory point depend size region party second party win regional election medium influence region party receive mediacontrol victory point party national party membership grow game progress supply fair number victory point lastly party score victory point party platform match national opinion end gamethe   edition feature party old west germany support   player   edition support player reunite germany update feature rule     edition support player add short fiveround variant additional rule update original designer",
        "YearPublished": "1986",
        "GameWeight": "4.3206",
        "AvgRating": "7.61428",
        "BayesAvgRating": "7.10363",
        "StdDev": "1.57979",
        "MinPlayers": "3",
        "MaxPlayers": "5",
        "ComAgeRec": "14.366666666666667",
        "LanguageEase": "1.3958333333333333",
        "BestPlayers": "5",
        "GoodPlayers": "['4', '5']",
        "NumOwned": "7498",
        "NumWant": "501",
        "NumWish": "2039",
        "NumWeightVotes": "761",
        "MfgPlaytime": "240",
        "ComMinPlaytime": "240",
        "ComMaxPlaytime": "240",
        "MfgAgeRec": "14",
        "NumUserRatings": "5354",
        "NumComments": "0",
        "NumAlternates": "2",
        "NumExpansions": "0",
        "NumImplementations": "0",
        "IsReimplementation": false,
        "Family": "Classic Line (Valley Games)",
        "Kickstarted": false,
        "ImagePath": "https://cf.geekdo-images.com/rpwCZAjYLD940NWwP3SRoA__original/img/yR0aoBVKNrAmmCuBeSzQnMflLYg=/0x0/filters:format(jpeg)/pic4718279.jpg",
        "Rank": "316",
        "RankStrat": "180",
        "RankAbstract": "21926",
        "RankFamily": "21926",
        "RankTheme": "21926",
        "RankCgs": "21926",
        "RankWargame": "21926",
        "Rankpartygame": "21926",
        "RankChildrengames": "21926",
        "CatTheme": "0",
        "CatStrat": "1",
        "CatWar": "0",
        "CatFamily": "0",
        "CatCgs": "0",
        "CatAbstract": "0",
        "CatParty": "0",
        "CatChildrens": "0"
      },
      {
        "BGGId": "2",
        "Name": "Dragonmaster",
        "Description": "dragonmaster tricktaking card game base old game call coup dtat player give supply plastic gem represent point player dealer different hand slightly different goal hand card deal dealer decide hand good suit current card player penalize point form crystal take certain trick card instance quotfirstquot quotlastquot call player penalize take trick player chance dealer hand player steal opportunity take trick certain hand end big pile gem win gamejewel content clear   extra green   extra red   extra blue   extra",
        "YearPublished": "1981",
        "GameWeight": "1.963",
        "AvgRating": "6.64537",
        "BayesAvgRating": "5.78447",
        "StdDev": "1.4544",
        "MinPlayers": "3",
        "MaxPlayers": "4",
        "ComAgeRec": "0",
        "LanguageEase": "27.0",
        "BestPlayers": "0",
        "GoodPlayers": "[]",
        "NumOwned": "1285",
        "NumWant": "72",
        "NumWish": "191",
        "NumWeightVotes": "54",
        "MfgPlaytime": "30",
        "ComMinPlaytime": "30",
        "ComMaxPlaytime": "30",
        "MfgAgeRec": "12",
        "NumUserRatings": "562",
        "NumComments": "0",
        "NumAlternates": "0",
        "NumExpansions": "0",
        "NumImplementations": "2",
        "IsReimplementation": true,
        "Family": "0",
        "Kickstarted": false,
        "ImagePath": "https://cf.geekdo-images.com/oQYhaJx5Lg3KcGis2reuWQ__original/img/owag4VgJDPyPt2ciYB9Hc5l4GnQ=/0x0/filters:format(jpeg)/pic4001505.jpg",
        "Rank": "3993",
        "RankStrat": "1577",
        "RankAbstract": "21926",
        "RankFamily": "21926",
        "RankTheme": "21926",
        "RankCgs": "21926",
        "RankWargame": "21926",
        "Rankpartygame": "21926",
        "RankChildrengames": "21926",
        "CatTheme": "0",
        "CatStrat": "1",
        "CatWar": "0",
        "CatFamily": "0",
        "CatCgs": "0",
        "CatAbstract": "0",
        "CatParty": "0",
        "CatChildrens": "0"
      }
    ]
  };
}