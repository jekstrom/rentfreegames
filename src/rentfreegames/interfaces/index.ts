export type ResponseError = {
    message: string
}

export interface Game {
    BGGId: string
    Name: string
    Description: string
    YearPublished: string
    GameWeight: string
    AvgRating: string
    BayesAvgRating: string
    StdDev: string
    MinPlayers: string
    MaxPlayers: string
    ComAgeRec: string
    BestPlayers: string
    GoodPlayers: string
    MfgPlaytime: string
    ComMinPlaytime: string
    ComMaxPlaytime: string
    MfgAgeRec: string
    Family: string
    ImagePath: string
    Rank: string,
    owned?: boolean
}

export interface User {
    id: string,
    email: string,
    image: string,
    name: string,
    sub: string
    games: Game[]
}
