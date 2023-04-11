import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import useSWR from 'swr';
import GamesList from '../../../components/gameList';
import Layout from '../../../components/layout';
import PlayerList from '../../../components/playersList';
import { ResponseError, Session } from '../../../interfaces';
import utilStyles from '../../../styles/utils.module.css';
import ErrorPage from 'next/error'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SessionDetails() {
    const { data: session, status } = useSession();
    const userEmail = session?.user.email;

    const { query } = useRouter()
    const { data, error, isLoading, isValidating } = useSWR<
        Session,
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

    const joinSession = () => {
        console.log("Joining session");
    };

    const leaveSession = () => {
        console.log("Leaving session");
    };

    return (
        <Layout>
            <Head>
                <title>{data.title}</title>
            </Head>
            {
                !data?.users ? <ErrorPage statusCode={404} /> : <></>
            }
            <article>
                <h1 className={utilStyles.headingXl}>{data.title}</h1>
            </article>
            <section>
                {
                    data?.users ?
                        data?.users?.some(u => u.email === userEmail)
                            ? <Button variant="outlined" onClick={leaveSession}>Leave session</Button>
                            : <Button variant="contained" sx={{ width: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText', p: 2 }} onClick={joinSession}>Join session</Button>
                        : <></>
                }
            </section>
            {
                data?.users 
                    ? (
                    <section>
                        <PlayerList players={data.users} userEmail={userEmail} />

                        <GamesList games={data.games} />
                    </section>) 
                    : <></>
            }
        </Layout>
    )
}
