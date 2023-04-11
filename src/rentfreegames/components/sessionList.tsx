import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Typography from '@mui/material/Typography'
import React from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { Session } from '../interfaces'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Games() {
    const { data, error, isLoading } = useSWR<Session[]>('/api/sessions', fetcher);

    const { data: session, status } = useSession();
    const userEmail = session?.user.email;

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
        <div>
            <section className={utilStyles.headingMd}>
                <p>Sessions</p>
                <div>
                    length {data?.length}
                </div>
            </section>
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                aria-label="games"
            >
                {!data || data?.map(({ id, title, users, inviteId }) => (
                    <ListItem disablePadding key={id}>
                        <ListItemText
                            primary={title}
                            secondary={
                                <React.Fragment>
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        Players:
                                    </Typography>
                                    {users.length}
                                </React.Fragment>
                            }
                        />
                        <Link href={`/sessions/${id}`}><ArrowForwardIcon /></Link>
                        <Link href={`/sessions/invite/${inviteId}`}><ArrowOutwardIcon /></Link>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}
