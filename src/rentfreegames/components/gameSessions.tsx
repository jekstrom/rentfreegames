import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import useSWR from 'swr'
import { ResponseError, Session } from '../interfaces'
import Link from '@mui/material/Link';
import CasinoIcon from '@mui/icons-material/Casino';

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function getUserGameSessions() {
    const url = "/api/sessions"
    const { data, error, isLoading, isValidating } = useSWR<
        Session[],
        ResponseError
    >(() => url, fetcher)

    return {
        data,
        isLoading,
        error,
        isValidating,
        url
    }
}

export default function UserGameSessions() {
    const { data: userSession, status } = useSession();
    const userEmail = userSession?.user.email;

    const { data, error, isLoading, isValidating, url } = getUserGameSessions();

    if (error) {
        console.log("Failed to load sessions");
        return <div>Failed to load</div>
    }
    if (isLoading) {
        console.log("Loading...");
        return <div style={{ display: "flex", justifyContent: "center" }}><img src="/images/Rentfreeanim.gif" /></div>
    }
    if (!data) {
        console.log("data: ", data);
        return null;
    }

    return (
        <div>
            {
                status === "authenticated" && data && data.length > 0
                    ? <section>
                        <Grid container sx={{ display: 'flex', alignItems: 'center' }} spacing={{ xs: 1, md: 1 }} columns={{ xs: 12, sm: 12, md: 12 }}>
                            {data.map((session) => (
                                <Grid key={session.id} item xs={12} sm={12} md={12}>
                                    <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: "100%" }}>
                                        <Grid container>
                                            <Grid item xs={12} sm={12} md={12}>
                                                <Typography variant="h5" component="div">
                                                    <Link href={`/sessions/${session.id}`} sx={{ color: "secondary.light" }}>{session.title}</Link>
                                                </Typography>
                                                <Typography variant="caption" component="p" sx={{ color: "primary.light" }}>
                                                    <Tooltip title={session.created.toString()} placement="top">
                                                        <AccessTimeIcon sx={{ color: "primary.main", fontSize: 16 }} />
                                                    </Tooltip>
                                                    &nbsp;Started {new Date(session.created).toLocaleDateString()}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={12} md={4}>
                                                <Typography variant="body2" component="p">
                                                    <GroupIcon sx={{ color: "primary.main", fontSize: 16 }} />&nbsp; {session.users.length} players
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={12} md={4}>
                                                <Typography variant="body2" component="p">
                                                    <CasinoIcon sx={{ color: "primary.main", fontSize: 16 }} />&nbsp; {session.users.map(u => u.games.length).reduce((count, sum) => sum += count)} games
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={12} md={4}>
                                                <Typography variant="body2" component="p">
                                                    <PersonIcon sx={{ color: "primary.main", fontSize: 16 }} />
                                                    &nbsp;Hosted by&nbsp;
                                                    {
                                                        session.createdBy.name === userSession?.user?.name
                                                            ? "you"
                                                            : session.createdBy.name
                                                    }
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            ))
                            }
                        </Grid>
                    </section>
                    : <section>
                        <Typography variant="h5" component="div">
                            You have no game sessions yet.
                        </Typography>
                    </section>
            }

        </div>
    );
}