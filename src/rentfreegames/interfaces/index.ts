export type ResponseError = {
    message: string
}

export interface Owner {
    userId: string,
    name?: string
}

// export interface Game {
//     BGGId: string
//     Name: string
//     Description: string
//     YearPublished: string
//     GameWeight: string
//     AvgRating: string
//     BayesAvgRating: string
//     StdDev: string
//     MinPlayers: string
//     MaxPlayers: string
//     ComAgeRec: string
//     BestPlayers: string
//     GoodPlayers: string
//     MfgPlaytime: string
//     ComMinPlaytime: string
//     ComMaxPlaytime: string
//     MfgAgeRec: string
//     Family: string
//     ImagePath: string
//     Rank: string,
//     owned?: boolean,
//     ownedBy?: [Owner]
// }

export interface Game {
    id:                          string;
    handle:                      string;
    url:                         string;
    bga_edit_url:                string;
    template_url:                string;
    name:                        string;
    price:                       string;
    price_ca:                    string;
    price_uk:                    string;
    price_au:                    string;
    msrp:                        number;
    msrps:                       Msrp[];
    discount:                    string;
    year_published:              number;
    min_players:                 number;
    max_players:                 number;
    player_counts:               number[];
    min_playtime:                number;
    max_playtime:                number;
    min_age:                     number;
    description:                 string;
    commentary:                  string;
    faq:                         string;
    thumb_url:                   string;
    image_url:                   string;
    matches_specs:               null;
    specs:                       any[];
    mechanics:                   Category[];
    categories:                  Category[];
    publishers:                  Designer[];
    designers:                   Designer[];
    primary_publisher:           Primary;
    primary_designer:            Primary;
    developers:                  any[];
    related_to:                  any[];
    related_as:                  any[];
    artists:                     string[];
    names:                       any[];
    rules_url:                   string;
    amazon_rank:                 number;
    official_url:                string;
    sell_sheet_url:              null;
    store_images_url:            null;
    comment_count:               number;
    num_user_ratings:            number;
    average_user_rating:         number;
    size_height:                 number;
    historical_low_prices:       HistoricalLowPrice[];
    active:                      boolean;
    num_user_complexity_votes:   number;
    average_learning_complexity: number;
    average_strategy_complexity: number;
    visits:                      number;
    lists:                       number;
    mentions:                    number;
    links:                       number;
    plays:                       number;
    rank:                        number;
    type:                        string;
    sku:                         string;
    upc:                         string;
    isbn:                        string;
    video_links:                 any[];
    availability_status:         string;
    num_distributors:            number;
    trending_rank:               number;
    listing_clicks:              number;
    is_historical_low:           boolean;
    skus:                        string[];
    sku_objects:                 SkuObject[];
    edit_url:                    string;
    players:                     string;
    playtime:                    string;
    msrp_text:                   string;
    price_text:                  string;
    tags:                        string[];
    images:                      Images;
    description_preview:         string;
    owned:                       boolean;
    ownedBy?:                    [Owner]
  }
  
  export interface Category {
    id:  string;
    name?: string;
    url: string;
  }

  export interface Mechanic {
    id:  string;
    name?: string;
    url: string;
  }
  
  export interface Designer {
    id:        string;
    num_games: null;
    score:     number;
    game:      GameClass;
    url:       string;
    images:    Images;
  }
  
  export interface GameClass {
  }
  
  export interface Images {
    thumb:    null | string;
    small:    null | string;
    medium:   null | string;
    large:    null | string;
    original: null | string;
  }
  
  export interface HistoricalLowPrice {
    country: string;
    date:    Date;
    price:   number;
    isLow:   boolean;
  }
  
  export interface Msrp {
    country: string;
    price:   number;
  }
  
  export interface Primary {
    id:   string;
    name: string;
    url:  string;
  }
  
  export interface SkuObject {
    name: string;
    sku:  string;
  }
  

export interface User {
    id: string,
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
