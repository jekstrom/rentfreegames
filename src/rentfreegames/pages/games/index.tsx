import { Button, Grid, SelectChangeEvent, Typography } from '@mui/material'
import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import Head from 'next/head'
import React, { ReactNode } from 'react'
import useSWR from 'swr'
import GameSearchResults from '../../components/gameSearchResults'
import Layout, { siteTitle } from '../../components/layout'
import Search from '../../components/search'
import SearchFiltersCategory from '../../components/searchFiltersCategory'
import SearchFiltersMechanic from '../../components/searchFiltersMechanic'
import SearchFiltersPlayers from '../../components/searchFiltersPlayers'
import SearchFiltersOwned from '../../components/searchFiltersOwned'
import { Category, Game, GuestUser, Mechanic } from '../../interfaces'
import utilStyles from '../../styles/utils.module.css'
import CircularProgress from '@mui/material/CircularProgress';
import { Router, useRouter } from 'next/router'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGuestUserContext } from '../../components/GuestUserContext'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function search(queryValue: string, curPage: number, playerCount: string, category: any, mechanic: any, owned: boolean, guestUser: GuestUser) {
    let url = `/api/search?q=${queryValue ?? ""}&p=${curPage - 1}&players=${playerCount}&cat=${category?.id ?? ""}&mec=${mechanic?.id ?? ""}&owned=${owned}`
    if (url && guestUser?.id) {
        url += `&guestId=${guestUser.id}`
    }
    const { data, error, isLoading } = useSWR<
        {
            games: Game[],
            categories: Category[],
            mechanics: Mechanic[],
            totalPages: number,
            title: string
        }>(url, fetcher);

    // if (guestUser && guestUser.games.length > 0) {
    //     data?.games.forEach(game => {
    //         game.owned = guestUser.games.some(g => g === game.id);
    //     });
    //     if (data && owned) {
    //         data.games = data?.games?.filter(g => g.owned) ?? [];
    //     }
    // }

    return {
        data,
        isLoading,
        error,
        url
    }
}

export default function Games({
    games
}: {
    games: Game[]
}) {
    const router = useRouter();
    const { query } = useRouter();
    const { myGames } = query;
    const guestUser = useGuestUserContext();

    const [curPage, changePage] = React.useState(1);
    const [category, changeCategory] = React.useState(null);
    const [mechanic, changeMechanic] = React.useState(null);
    const [playerCount, setPlayers] = React.useState("any");
    const [queryValue, setQueryValue] = React.useState('')
    const [owned, setOwned] = React.useState(myGames === "true")

    const { data, error, isLoading } = search(queryValue, curPage, playerCount, category, mechanic, owned, guestUser);
    if (error) {
        console.log("Failed to load");
        return <Layout><div>Failed to load</div></Layout>
    }
    if (isLoading) {
        console.log("Loading...");
        return <Layout><div style={{ display: "flex", justifyContent: "center" }}><img src="/images/Rentfreeanim.gif" /></div></Layout>
    }
    if (!data) {
        return null;
    }

    const handleChangePlayers = (event: SelectChangeEvent<string>, child: ReactNode) => {
        setPlayers(event.target.value as string);
    };

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        changePage(value);
    };

    const onChangeCategory = (event: any, newValue: Category | null) => {
        console.log("onChangeCategory", newValue);
        changeCategory(newValue);
    };

    const onQueryChange = (event) => {
        setQueryValue(event.target.value);
    };

    const onOwnedChange = (event) => {
        router.push({
            query: { myGames: event.target.checked ? 'true' : 'false' }
        },
            undefined, { shallow: true }
        )
        setOwned(event.target.checked);
    };

    return (
        <Layout>
            <Head>
                <title>{siteTitle}</title>
            </Head>
            <section className={utilStyles.headingMd}>
                <p>{data?.title ?? ""}</p>
                <Grid container columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={12} sm={12} md={query && query.inviteId ? 8 : 12}>
                        <Search queryValue={queryValue} setQueryValue={onQueryChange} />
                    </Grid>
                    {
                        query && query.inviteId
                            ? <Grid item xs={12} sm={12} md={4} style={{ padding: 20, display: "flex", justifyContent: "flex-end" }}>
                                <Button variant="contained" color="primary" href={`/sessions/invite/${query.inviteId}`}><ArrowBackIcon sx={{ color: "secondary.light", fontSize: 20 }} /> Back to invite</Button>
                            </Grid>
                            : <></>
                    }
                    <Grid item xs={12} sm={12} md={3}>
                        <SearchFiltersCategory categories={data.categories} category={category} setCategory={onChangeCategory} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={3}>
                        <SearchFiltersMechanic mechanics={data.mechanics} mechanic={mechanic} setMechanic={changeMechanic} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={3} style={{ padding: "10px" }}>
                        <SearchFiltersPlayers player={playerCount} setPlayers={handleChangePlayers} isSearch={true} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={3} style={{ padding: "10px" }}>
                        <SearchFiltersOwned owned={owned} setOwned={onOwnedChange} />
                    </Grid>
                </Grid>
            </section>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Grid item xs={12} sm={12} md={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Stack spacing={1}>
                        <Pagination count={data.totalPages} page={curPage} onChange={handleChange} shape="rounded" />
                    </Stack>
                </Grid>
                <Grid item>
                    <GameSearchResults
                        title=""
                        queryValue={queryValue}
                        curPage={curPage}
                        playerCount={playerCount}
                        category={category}
                        mechanic={mechanic}
                        owned={owned}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Stack spacing={1}>
                        <Pagination count={data.totalPages} page={curPage} onChange={handleChange} shape="rounded" />
                    </Stack>
                </Grid>
            </Grid>
        </Layout>
    )
}
