import { NextApiRequest, NextApiResponse } from 'next'
import { CosmosClient } from '@azure/cosmos'

const endpoint = process.env.DB_ENDPOINT;
const key = process.env.DB_KEY;
const client = new CosmosClient({ endpoint, key });

export default async (req: NextApiRequest, res: NextApiResponse) => {
    console.log("USER ENDPOINT")
    const results = {}
    const { database } = await client.databases.createIfNotExists({ id: "Test Database" });
    console.log(database.id);
    const { container } = await database.containers.createIfNotExists({ id: "Test Database" });
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
