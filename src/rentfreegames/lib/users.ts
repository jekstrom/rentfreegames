import { NextApiRequest, NextApiResponse } from 'next'
import { CosmosClient } from '@azure/cosmos'
import { Profile } from 'next-auth';

const endpoint = process.env.DB_ENDPOINT;
const key = process.env.DB_KEY;
const client = new CosmosClient({ endpoint, key });

export interface User {
    id: string,
    email: string,
    image: string,
    name: string,
    sub: string
}

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
                sub: profile.sub
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
            sub: result.resource.sub
        };
    }
    catch (ex) {
        console.log("Exception postUserData: ", ex);
    }
}