import Layout from '../../../components/layout'
import Head from 'next/head'
import utilStyles from '../../../styles/utils.module.css'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import React from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { Session, ResponseError } from '../../../interfaces'
import GamesList from '../../../components/gameList';

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
            <article>
                <h1 className={utilStyles.headingXl}>{data.title}</h1>
            </article>
            <section>
                {
                   data.users.some(u => u.email === userEmail) 
                   ? <Button variant="outlined" onClick={leaveSession}>Leave session</Button>
                   : <Button variant="outlined" onClick={joinSession}>Join session</Button> 
                }
            </section>
            <article>
                <h2 className={utilStyles.headingXl}>Players</h2>
            </article>
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                aria-label="players"
            >
                {data?.users?.map(({ email, name }) => (
                    <ListItem disablePadding key={email}>
                        <ListItemButton role={undefined}>
                            <ListItemText 
                                sx={
                                    email === userEmail 
                                    ? { bgcolor: 'primary.main', color: 'primary.contrastText', p: 2 } 
                                    : { bgcolor: 'secondary.main', color: 'primary.contrastText', p: 2 }
                                } 
                                primary={name}
                                secondary="Host" // todo: determine host
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <GamesList games={data.games} />
        </Layout>
    )
}
