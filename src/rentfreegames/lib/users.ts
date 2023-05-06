import { NextApiRequest, NextApiResponse } from 'next'
import { CosmosClient } from '@azure/cosmos'
import { Profile } from 'next-auth';
import { User, Game, GuestUser } from '../interfaces';
import { JWT } from 'next-auth/jwt';
import * as crypto from 'crypto';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

const endpoint = process.env.DB_ENDPOINT;
const key = process.env.DB_KEY;
const client = new CosmosClient({ endpoint, key });

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY as string;
if (!accountName) {
    throw Error('Azure Storage accountName not found');
}
if (!accountKey) {
    throw Error('Azure Storage accountKey not found');
}

const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
);

export async function getUserData(email: string): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    const { resources } = await container.items
        .query({
            query: "SELECT * from u WHERE u.email = @email",
            parameters: [{ name: "@email", value: email }]
        })
        .fetchAll();

    return resources.find((u) => u.email === email) as User;
}

export async function getUserMetaData(email: string): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    const { resources } = await container.items
        .query({
            query: "SELECT u.id, u.image, u.name, u.sub from u WHERE u.email = @email",
            parameters: [{ name: "@email", value: email }]
        })
        .fetchAll();

    if (resources && resources.length > 0) {
        let user = resources[0] as any;
        user.games = [];
        return user;
    }

    return null;
}

export async function getGuestUserData(id: string): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    const { resources } = await container.items
        .query({
            query: "SELECT * from u WHERE u.id = @id",
            parameters: [{ name: "@id", value: id }]
        })
        .fetchAll();

    return resources.find((u) => u.id === id) as User;
}

export async function getGuestUserMetaData(id: string): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    const { resources } = await container.items
        .query({
            query: "SELECT u.id, u.image, u.name, u.sub from u WHERE u.id = @id",
            parameters: [{ name: "@id", value: id }]
        })
        .fetchAll();

    if (resources && resources.length > 0) {
        let user = resources.find((u) => u.id === id) as any;
        user.games = [];
        user.isGuest = true;
        return user;
    }

    return null;
}

export async function postUserData(profile: Profile): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    try {
        const result = await container.items.create(
            {
                id: crypto.randomUUID(),
                email: profile.email,
                image: profile.image,
                name: profile.name,
                sub: profile.sub,
                isGuest: true,
                games: []
            }
        );


        if (result.statusCode >= 400) {
            console.log(result.statusCode);
            console.log(result.substatus);
            return null;
        }

        return {
            id: result.resource.id,
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

export async function postGuestUserData(guestUser: GuestUser): Promise<GuestUser> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    try {
        const result = await container.items.create(
            {
                id: crypto.randomUUID(),
                email: '',
                image: '',
                name: guestUser.name,
                sub: '',
                games: [],
                isGuest: true
            }
        );


        if (result.statusCode >= 400) {
            console.log(result.statusCode);
            console.log(result.substatus);
            return null;
        }

        return {
            id: result.resource.id,
            image: result.resource.image,
            name: result.resource.name,
            sub: result.resource.sub,
            isGuest: true,
            games: []
        };
    }
    catch (ex) {
        console.log("Exception postUserData: ", ex);
    }
}

export async function postJWTUserData(profile: JWT): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    try {
        const result = await container.items.create(
            {
                id: crypto.randomUUID(),
                email: profile.email,
                image: profile.picture,
                name: profile.name,
                sub: profile.sub,
                games: []
            }
        );


        if (result.statusCode >= 400) {
            console.log(result.statusCode);
            console.log(result.substatus);
            return null;
        }

        return {
            id: result.resource.id,
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

export async function addGame(id: string, game: Game): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    const { resources } = await container.items
        .query({
            query: "SELECT * from u WHERE u.id = @id",
            parameters: [{ name: "@id", value: id }]
        })
        .fetchAll();

    const user = resources.find((u) => u.id === id) as User;

    try {
        if (!user.games) {
            user.games = [];
        }
        if (!user.games.some((g) => g.id === game.id)) {
            user.games.push(game);
        }

        const result = await container.items.upsert(
            {
                id: user.id,
                email: resources[0].email,
                image: user.image,
                name: user.name,
                sub: user.sub,
                games: user.games,
                isGuest: user.isGuest
            }
        );


        if (result.statusCode >= 400) {
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

export async function addAvatar(id: string, avatar: string): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    const { resources } = await container.items
        .query({
            query: "SELECT * from u WHERE u.id = @id",
            parameters: [{ name: "@id", value: id }]
        })
        .fetchAll();

    const user = resources.find((u) => u.id === id) as User;

    try {
        const result = await container.items.upsert(
            {
                id: user.id,
                email: resources[0].email,
                image: avatar,
                name: user.name,
                sub: user.sub,
                games: user.games,
                isGuest: user.isGuest
            }
        );


        if (result.statusCode >= 400) {
            console.log(result.statusCode);
            console.log(result.substatus);
            return null;
        }

        return user;
    }
    catch (ex) {
        console.log("Exception addAvatar: ", ex);
    }
}

export async function removeGame(id: string, gameId: string): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    const { resources } = await container.items
        .query({
            query: "SELECT * from u WHERE u.id = @id",
            parameters: [{ name: "@id", value: id }]
        })
        .fetchAll();

    const user = resources.find((u) => u.id === id) as User;

    try {
        if (!user.games) {
            user.games = [];
        }
        if (user.games.some((g) => g.id === gameId)) {
            user.games = user.games.filter((g) => g.id !== gameId);
        }

        const result = await container.items.upsert(
            {
                id: user.id,
                email: resources[0].email,
                image: user.image,
                name: user.name,
                sub: user.sub,
                games: user.games,
                isGuest: user.isGuest
            }
        );


        if (result.statusCode >= 400) {
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

export async function removeUserGames(id: string): Promise<User> {
    const { database } = await client.databases.createIfNotExists({ id: "User Database" });
    const { container } = await database.containers.createIfNotExists({ id: "User Container" });

    const { resources } = await container.items
        .query({
            query: "SELECT * from u WHERE u.id = @id",
            parameters: [{ name: "@id", value: id }]
        })
        .fetchAll();

    const user = resources.find((u) => u.id === id) as User;

    try {
        user.games = [];

        const result = await container.items.upsert(
            {
                id: user.id,
                email: resources[0].email,
                image: user.image,
                name: user.name,
                sub: user.sub,
                games: user.games,
                isGuest: user.isGuest
            }
        );


        if (result.statusCode >= 400) {
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

export async function uploadImage(imageData: any, userId: string): Promise<string> {
    try {
        const blobServiceClient = new BlobServiceClient(
            `https://${accountName}.blob.core.windows.net`,
            sharedKeyCredential
        );

        const containerName = 'content';
        const blobName = `${userId}_avatar_${imageData.originalFilename}.png`;
        
        const containerClient = await blobServiceClient.getContainerClient(
            containerName
        );

        const blobClient = await containerClient.getBlockBlobClient(blobName);

        console.log("Uploading to Azure storage blob: ", blobName);

        const response = await blobClient.uploadFile(imageData.filepath);

        console.log(response);

        return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
    } catch (ex) {
        console.log("Exception uploadImage: ", ex);
    }
}
