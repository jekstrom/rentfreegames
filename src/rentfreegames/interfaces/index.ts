export type ResponseError = {
    message: string
}

export interface Owner {
    email: string,
    name?: string
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
    owned?: boolean,
    ownedBy?: [Owner]
}

export interface User {
    id: string,
    email: string,
    image: string,
    name: string,
    sub: string
    games: Game[]
}

export interface Session {
    id: string,
    title: string,
    created: Date,
    inviteId: string,
    users: User[],
    createdBy: User,
    games?: Game[]
}
