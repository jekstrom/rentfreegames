import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Divider, Grid, IconButton, InputBase, Paper, SelectChangeEvent, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ReactNode } from 'react'
import useSWR from 'swr'
import GameSessionResults from '../../components/gameSessionResults'
import Layout from '../../components/layout'
import PlayerList from '../../components/playersList'
import Search from '../../components/search'
import SearchFiltersCategory from '../../components/searchFiltersCategory'
import SearchFiltersMechanic from '../../components/searchFiltersMechanic'
import SearchFiltersOwned from '../../components/searchFiltersOwned'
import SearchFiltersPlayers from '../../components/searchFiltersPlayers'
import SearchSortRating from '../../components/searchRatingSort'
import { Category, Mechanic, ResponseError, Session, User } from '../../interfaces'
import utilStyles from '../../styles/utils.module.css'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function getSession(id: string) {
    const url = (id ? `/api/sessions/${id}` : null)
    const { data, error, isLoading, isValidating } = useSWR<
        { gameSession: Session, sessionUser: User, categories: Category[], mechanics: Mechanic[] },
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
    const [category, changeCategory] = React.useState(undefined);
    const [mechanic, changeMechanic] = React.useState(undefined);
    const [playerCount, setPlayers] = React.useState(undefined);
    const [queryValue, setQueryValue] = React.useState('')
    const [owned, setOwned] = React.useState(false)
    const [ratingSort, setRating] = React.useState("none")

    const { query } = useRouter()
    const { data, error, isLoading, isValidating } = getSession(query?.id as string)

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

    const onQueryChange = (event) => {
        setQueryValue(event.target.value);
    };

    const handleChangePlayers = (event: SelectChangeEvent<number>, child: ReactNode) => {
        setPlayers(event.target.value as number);
    };

    const onChangeCategory = (event: any, newValue: Category | null) => {
        console.log("onChangeCategory", newValue);
        changeCategory(newValue);
    };

    const onOwnedChange = (event) => {
        setOwned(event.target.checked);
    };

    const onRatingSortChange = (event) => {
        setRating(event.target.value);
    };

    const copy = () => {
        navigator.clipboard.writeText(new URL(`sessions/invite/${data.gameSession.inviteId}`, window.location.origin).href);
    }

    return (
        <Layout>
            <Head>
                <title>{data?.gameSession?.title} - RFG</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{data.gameSession.title}</h1>
            </article>

            {
                data.gameSession.createdBy.id === data.sessionUser.id
                    ? <section className={utilStyles.headingMd}>
                        <Typography align="justify" gutterBottom>
                            Share this invite code with your friends to invite them to this session
                        </Typography>
                        <Paper
                            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
                        >
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                value={data?.gameSession.inviteId}
                                readOnly
                                inputProps={{ 'aria-label': 'invite code' }}
                            />
                            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                            <IconButton type="button" color="primary" aria-label="copy" onClick={copy}>
                                <ContentCopyIcon />
                            </IconButton>
                        </Paper>
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="horizontal" />
                    </section>
                    : <></>
            }
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
                    <Grid item xs={12} sm={12} md={3} style={{ padding: "10px" }}>
                        <SearchFiltersOwned owned={owned} setOwned={onOwnedChange} />
                    </Grid>
                    
                </Grid>
                <Grid container columns={{ xs: 12, sm: 12, md: 12 }}>
                    <Grid item xs={12} sm={12} md={12}>
                        <SearchSortRating ratingSort={ratingSort} setRating={onRatingSortChange} label="Sort by" />
                    </Grid>
                </Grid>
            </section>

            <PlayerList players={data.gameSession.users} user={data.sessionUser} host={data.gameSession.createdBy} />

            <GameSessionResults id={query?.id as string} query={queryValue} playerCount={playerCount} mechanic={mechanic} category={category} owned={owned} ratingSort={ratingSort} title={"Games"} />
        </Layout>
    )
}
