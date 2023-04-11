import Layout from '../../components/layout'
import { getSessionData } from '../../lib/sessions'
import Head from 'next/head'
import Date from '../../components/date'
import utilStyles from '../../styles/utils.module.css'
import { GetStaticProps, GetStaticPaths } from 'next'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import React from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { Session, ResponseError } from '../../interfaces'
import GamesList from '../../components/gameList'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function SessionDetails() {
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

    return (
        <Layout>
            <Head>
                <title>{data.title}</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{data.title}</h1>
            </article>
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
                            <ListItemText primary={name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <GamesList games={data?.games} />
        </Layout>
    )
}
