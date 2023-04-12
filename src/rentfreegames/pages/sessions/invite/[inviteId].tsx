import Button from '@mui/material/Button';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';
import GamesList from '../../../components/gameList';
import Layout from '../../../components/layout';
import PlayerList from '../../../components/playersList';
import { ResponseError, Session, Game, User } from '../../../interfaces';
import utilStyles from '../../../styles/utils.module.css';
import ErrorPage from 'next/error'

const postData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function getUserGames(users: User[], email: string): Game[] {
    let games: Game[] = [];
    users.forEach(user => {
        user.games.forEach(game => {
            game.owned = user.email === email;
            game.ownedBy = [{name: user.name, email: user.email}];
            games.push(game);
        });
    });

    // Return only unique games by BGGId
    return Object.values(
        games.reduce((acc, obj) => ({ ...acc, [obj.BGGId]: obj }), {})
    );
}

export default function SessionDetails() {
    const { data: session, status } = useSession();
    const userEmail = session?.user.email;
    const router = useRouter();

    const { query } = useRouter()
    const { data, error, isLoading, isValidating } = useSWR<
        {gameSession: Session, user: User},
        ResponseError
    >(() => (query.inviteId ? `/api/sessions/invite/${query.inviteId}` : null), fetcher)
    
    if (error) {
        console.log("Failed to load: ", error);
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

    const joinSession = async () => {
        console.log("Joining session");
        if (status === "authenticated") {
            const response = await postData(`/api/sessions/invite/${query.inviteId}/users`, { sessionId: data.gameSession.id, inviteId: data.gameSession.inviteId });
            console.log(response);
            router.push(`/sessions/${response.id}`)
        }
    };

    const leaveSession = () => {
        console.log("Leaving session");
    };

    return (
        <Layout>
            <Head>
                <title>{data.gameSession.title} invite - RFG</title>
            </Head>
            {
                !data?.gameSession.users ? <ErrorPage statusCode={404} /> : <></>
            }
            <article>
                <h1 className={utilStyles.headingXl}>{data.gameSession.title}</h1>
            </article>
            <section>
                {
                    data?.gameSession.users ?
                        data?.gameSession.users?.some(u => u.email === userEmail)
                            ? <Button variant="outlined" onClick={leaveSession}>Leave session</Button>
                            : <Button variant="contained" sx={{ width: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText', p: 2 }} onClick={joinSession}>Join session</Button>
                        : <></>
                }
            </section>
            {
                data?.gameSession.users 
                    ? (
                    <section>
                        <PlayerList players={data.gameSession.users} userEmail={userEmail} host={data.gameSession.createdBy} />

                        <GamesList games={getUserGames(data.gameSession.users, userEmail)} title={"Session Games"} />

                        <GamesList games={getUserGames([data.user], userEmail)} title={"Your Games"} />
                    </section>) 
                    : <></>
            }
        </Layout>
    )
}
