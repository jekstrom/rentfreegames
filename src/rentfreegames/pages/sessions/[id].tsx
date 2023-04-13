import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Divider, IconButton, InputBase, Paper, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr'
import GamesList from '../../components/gameList'
import GameTable from '../../components/gameTable'
import Layout from '../../components/layout'
import PlayerList from '../../components/playersList'
import { ResponseError, Session, User, Game, Owner } from '../../interfaces'
import utilStyles from '../../styles/utils.module.css'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function getGamesByPlayerCount(games: Game[], numPlayers: number): Game[] {
    return games.filter(g => parseInt(g.MinPlayers) <= numPlayers && parseInt(g.MaxPlayers) >= numPlayers);
}

function mergeGameOwners(games: Game[]): Game[] {
    // Merge games' owners with same BGGId
    for (const game of games.filter(g => g.owned)) {
        const otherGame = games.find(g => g.BGGId === game.BGGId && g.ownedBy.every(o => game.ownedBy.indexOf(o) < 0));
        if (otherGame) {
            game.ownedBy = otherGame.ownedBy.concat(game.ownedBy) as [Owner];
            otherGame.ownedBy = otherGame.ownedBy.concat(game.ownedBy) as [Owner];
            otherGame.owned = true;
        }
    }
    return games;
}

function getUniqueGames(games: Game[]){ 
    // Unique games by BGGId
    let uniqueGames = Object.values(
        games.reduce((acc, obj) => ({ ...acc, [obj.BGGId]: obj }), {})
    ) as Game[];

    // Remove duplicate owners
    for (const game of uniqueGames) {
        game.ownedBy = Object.values(game.ownedBy.reduce((acc, obj) => ({ ...acc, [obj.email]: obj }), {})) as [Owner];
    }
    return uniqueGames;
}

function getUserGames(users: User[], email: string): Game[] {
    // Flatten list of games
    let games: Game[] = [];
    users.forEach(user => {
        user.games.forEach(game => {
            game.owned = user.email === email;
            game.ownedBy = [{ name: user.name, email: user.email }];
            games.push(game);
        });
    });

    games = getGamesByPlayerCount(games, users.length)

    games = mergeGameOwners(games);
    
    return getUniqueGames(games);
}

export default function SessionDetails() {
    const { data: session, status } = useSession();
    const userEmail = session?.user.email;

    const { query } = useRouter()
    const { data, error, isLoading, isValidating } = useSWR<
        Session,
        ResponseError
    >(() => (query.id ? `/api/sessions/${query.id}` : null), fetcher)

    if (error) {
        console.log("Failed to load");
        return <div>Failed to load</div>
    }
    if (isLoading) {
        console.log("Loading...");
        return <div>Loading...</div>
    }
    if (!data) {
        console.log("data: ", data);
        return null;
    }

    const copy = () => {
        navigator.clipboard.writeText(new URL(`sessions/invite/${data.inviteId}`, window.location.origin).href);
    }

    return (
        <Layout>
            <Head>
                <title>{data.title} - RFG</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{data.title}</h1>
            </article>

            {
                data.createdBy.email == userEmail
                    ? <section>
                        <Typography align="justify" gutterBottom>
                            Share this invite code with your friends to invite them to this session
                        </Typography>
                        <Paper
                            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
                        >
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                value={data?.inviteId}
                                readOnly
                                inputProps={{ 'aria-label': 'invite code' }}
                            />
                            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                            <IconButton type="button" color="primary" aria-label="copy" onClick={copy}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Paper>
                    </section>
                    : <></>
            }

            <PlayerList players={data.users} userEmail={userEmail} host={data.createdBy} />

            <GameTable games={getUserGames(data?.users, userEmail)} title={"Games"} />
        </Layout>
    )
}
