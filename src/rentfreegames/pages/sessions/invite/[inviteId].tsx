import { Grid, SelectChangeEvent } from '@mui/material';
import Button from '@mui/material/Button';
import ErrorPage from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import useSWR from 'swr';
import GameSessionInviteResults from '../../../components/gameSessionInviteResults';
import Layout from '../../../components/layout';
import PlayerList from '../../../components/playersList';
import Search from '../../../components/search';
import SearchFiltersPlayers from '../../../components/searchFiltersPlayers';
import { Category, Mechanic, ResponseError, Session, User } from '../../../interfaces';
import utilStyles from '../../../styles/utils.module.css';
import GameSessionResults from '../../../components/gameSessionResults';
import SearchFiltersCategory from '../../../components/searchFiltersCategory';
import SearchFiltersMechanic from '../../../components/searchFiltersMechanic';
import { useSession } from 'next-auth/react';
import { Sign } from 'crypto';
import Signin from '../../../components/signin';

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

export const getInviteSession = (inviteId: string) => {
    const url = (inviteId ? `/api/sessions/invite/${inviteId}` : null);

    const { data, error, isLoading, isValidating } = useSWR<
        { gameSession: Session, user: User, categories: Category[], mechanics: Mechanic[] },
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

export default function SessionDetails() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const { query } = useRouter()

    const [category, changeCategory] = React.useState(null);
    const [mechanic, changeMechanic] = React.useState(null);
    const [playerCount, setPlayers] = React.useState("any");
    const [queryValue, setQueryValue] = React.useState('')
    const [owned, setOwned] = React.useState(false)

    const { data, error, isLoading, isValidating } = getInviteSession(query?.inviteId as string)

    if (error) {
        console.log("Failed to load session");
        return <Layout><div>Failed to load</div></Layout>
    }
    if (isLoading) {
        console.log("Loading...");
        return <Layout><div style={{display: "flex", justifyContent: "center" }}><img src="/images/Rentfreeanim.gif" /></div></Layout>
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

    const onQueryChange = (event) => {
        setQueryValue(event.target.value);
    };

    const handleChangePlayers = (event: SelectChangeEvent<string>, child: ReactNode) => {
        setPlayers(event.target.value as string);
    };

    const onChangeCategory = (event: any, newValue: Category | null) => {
        console.log("onChangeCategory", newValue);
        changeCategory(newValue);
    };

    const onOwnedChange = (event) => {
        setOwned(event.target.checked);
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
            {
                status === "authenticated" 
                    ? <section>
                        <section>
                            {
                                data?.gameSession.users ?
                                    data?.gameSession.users?.some(u => u.id === data.user.id)
                                        ? <Button variant="outlined" onClick={leaveSession}>Leave session</Button>
                                        : <Button variant="contained" sx={{ width: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText', p: 2 }} onClick={joinSession}>Join session</Button>
                                    : <></>
                            }
                        </section>
                        <section>
                            <Grid container columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={12} sm={12} md={12}>
                                    <Search queryValue={queryValue} setQueryValue={onQueryChange} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={3}>
                                    <SearchFiltersCategory categories={data.categories} category={category} setCategory={onChangeCategory} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={3}>
                                    <SearchFiltersMechanic mechanics={data.mechanics} mechanic={mechanic} setMechanic={changeMechanic} />
                                </Grid>
                                <Grid item xs={12} sm={12} md={3} style={{ padding: "10px" }}>
                                    <SearchFiltersPlayers player={playerCount} setPlayers={handleChangePlayers} />
                                </Grid>
                            </Grid>
                        </section>
                        {
                            data?.gameSession.users
                                ? (
                                    <section>
                                        <PlayerList players={data.gameSession.users} user={data.user} host={data.gameSession.createdBy} />

                                        <GameSessionResults id={query?.inviteId as string} query={queryValue} playerCount={playerCount} mechanic={mechanic} category={category} owned={owned} title={"Session Games"} />

                                        <GameSessionInviteResults id={query?.inviteId as string} query={queryValue} playerCount={playerCount} mechanic={mechanic} category={category} owned={true} sessionPlayerCount={data?.gameSession?.users?.length} title={"Your Games"} />
                                    </section>)
                                : <></>
                        }
                    </section>
                    : <section>
                        <PlayerList players={data.gameSession.users} user={data.user} host={data.gameSession.createdBy} />
                        
                        <Signin />
                    </section>
            }
        </Layout>
    )
}
