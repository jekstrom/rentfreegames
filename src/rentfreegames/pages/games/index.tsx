import { Grid, SelectChangeEvent, Typography } from '@mui/material'
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
import { Category, Game, Mechanic } from '../../interfaces'
import utilStyles from '../../styles/utils.module.css'
import { useSession } from 'next-auth/react'
import CircularProgress from '@mui/material/CircularProgress';

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function search(queryValue: string, curPage: number, playerCount: number, category: any, mechanic: any, owned: boolean) {
    const url = `/api/search?q=${queryValue ?? ""}&p=${curPage - 1}&players=${playerCount}&cat=${category?.id ?? ""}&mec=${mechanic?.id ?? ""}&owned=${owned}`
    const { data, error, isLoading } = useSWR<
        {
            games: Game[],
            categories: Category[],
            mechanics: Mechanic[],
            totalPages: number,
            title: string
        }>(url, fetcher);

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
    const [curPage, changePage] = React.useState(1);
    const [category, changeCategory] = React.useState(null);
    const [mechanic, changeMechanic] = React.useState(null);
    const [playerCount, setPlayers] = React.useState(2);
    const [queryValue, setQueryValue] = React.useState('')
    const [owned, setOwned] = React.useState(false)

    const { data, error, isLoading } = search(queryValue, curPage, playerCount, category, mechanic, owned);
    if (error) {
        console.log("Failed to load");
        return <Layout><div>Failed to load</div></Layout>
    }
    if (isLoading) {
        console.log("Loading...");
        return <Layout><CircularProgress /></Layout>
    }
    if (!data) {
        console.log("data: ", data);
        return null;
    }

    const handleChangePlayers = (event: SelectChangeEvent<number>, child: ReactNode) => {
        setPlayers(event.target.value as number);
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
            </Grid>
        </Layout>
    )
}
