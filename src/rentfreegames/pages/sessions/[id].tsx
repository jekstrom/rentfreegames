import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Divider, IconButton, InputBase, Paper, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { title } from 'process'
import React from 'react'
import useSWR from 'swr'
import GamesList from '../../components/gameList'
import Layout from '../../components/layout'
import PlayerList from '../../components/playersList'
import { ResponseError, Session } from '../../interfaces'
import utilStyles from '../../styles/utils.module.css'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

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

            <section>
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

            <PlayerList players={data.users} userEmail={userEmail} />

            <GamesList games={data?.games} />
        </Layout>
    )
}
