import { NextApiRequest, NextApiResponse } from 'next'
import { CosmosClient } from '@azure/cosmos'
import { Profile } from 'next-auth';
import { User, Game } from '../interfaces';

const endpoint = process.env.DB_ENDPOINT;
const key = process.env.DB_KEY;
const client = new CosmosClient({ endpoint, key });

export default async (req: NextApiRequest, res: NextApiResponse) => {
    console.log("USER ENDPOINT")
    const results = {}
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    console.log(database.id);
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });
    console.log(container.id);

    const { resources } = await container.items
    .query({
        query: "SELECT * from c WHERE c.isCapitol = @isCapitol",
        parameters: [{ name: "@isCapitol", value: true }]
    })
    .fetchAll();

    for (const city of resources) {
        console.log(`${city.name}, ${city.state} is a capitol `);
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ results }))
}

export async function getUserData(email: string): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });
    
    const { resources } = await container.items
    .query({
        query: "SELECT * from u WHERE u.email = @email",
        parameters: [{ name: "@email", value: email }]
    })
    .fetchAll();

    for (const user of resources) {
        console.log(`${user.id}, ${user.email} is a user `);
    }
    return resources.find((u) => u.email === email);
}

export async function postUserData(profile: Profile): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });
    
    try {
        const result = await container.items.create(
            {
                id: profile.email,
                email: profile.email,
                image: profile.image,
                name: profile.name,
                sub: profile.sub,
                games: []
            }
        );
    

        if (result.statusCode != 200) {
            console.log(result.statusCode);
            console.log(result.substatus);
            return null;
        }

        return {
            id: result.resource.id,
            email: result.resource.email,
            image: result.resource.image,
            name: result.resource.name,
            sub: result.resource.sub,
            games: []
        };
    }
    catch (ex) {
        console.log("Exception postUserData: ", ex);
    }
}

export async function addGame(email: string, game: Game): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });
    
    const { resources } = await container.items
    .query({
        query: "SELECT * from u WHERE u.email = @email",
        parameters: [{ name: "@email", value: email }]
    })
    .fetchAll();

    for (const user of resources) {
        console.log(`${user.id}, ${user.email} is a user with games: ${user.games} `);
    }
    const user = resources.find((u) => u.email === email) as User;
    
    try {
        if (!user.games) {
            user.games = [];
        }
        if (!user.games.some((g) => g.BGGId === game.BGGId)) {
            user.games.push(game);
        }

        const result = await container.items.upsert(
            {
                id: user.email,
                email: user.email,
                image: user.image,
                name: user.name,
                sub: user.sub,
                games: user.games
            }
        );
    

        if (result.statusCode != 200) {
            console.log(result.statusCode);
            console.log(result.substatus);
            return null;
        }

        return user;
    }
    catch (ex) {
        console.log("Exception addGame: ", ex);
    }
}

export async function removeGame(email: string, bggId: string): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    const { resources } = await container.items
    .query({
        query: "SELECT * from u WHERE u.email = @email",
        parameters: [{ name: "@email", value: email }]
    })
    .fetchAll();

    for (const user of resources) {
        console.log(`${user.id}, ${user.email} is a user with games: ${user.games} `);
    }
    const user = resources.find((u) => u.email === email) as User;
    
    try {
        if (!user.games) {
            user.games = [];
        }
        if (user.games.some((g) => g.BGGId === bggId)) {
            user.games = user.games.filter((g) => g.BGGId !== bggId);
        }

        const result = await container.items.upsert(
            {
                id: user.email,
                email: user.email,
                image: user.image,
                name: user.name,
                sub: user.sub,
                games: user.games
            }
        );
    

        if (result.statusCode != 200) {
            console.log(result.statusCode);
            console.log(result.substatus);
            return null;
        }

        return user;
    }
    catch (ex) {
        console.log("Exception removeGame: ", ex);
    }
}
