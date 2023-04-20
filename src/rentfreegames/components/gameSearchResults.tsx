import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Game } from '../interfaces';
import { Tooltip, Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BalanceIcon from '@mui/icons-material/Balance';
import { useSession } from 'next-auth/react'
import { search } from '../pages/games';
import { useSWRConfig } from "swr"

const Img = styled('img')({
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
});

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

function FormRow({ row, numGames, handleToggle }: { row: Game, numGames: number, handleToggle: any }) {
    return (
        <React.Fragment>
            <Grid item xs={12} sm={12} md={numGames < 3 ? 12 : 4}>
                <Paper elevation={2} sx={{ height: "100%" }}>
                    <Grid item xs={12} sm container padding={1} >
                        <Grid item xs container direction="column" spacing={2}>
                            <Grid item xs padding="3px">
                                {
                                    row.images.small ?
                                        <img src={row.images.small} style={{ width: "100px", padding: "1px" }} />
                                        : <></>
                                }
                                <Tooltip title={row.name}>
                                    <Typography gutterBottom variant="overline" component="div" sx={ row.name.length > 15 ? { fontSize: 10, padding: "1px" } : { fontSize: 14, padding: "3px" }}>
                                        {row.name.length > 50 ? row.name.substring(0, 50) + "..." : row.name}
                                    </Typography>
                                </Tooltip>
                            </Grid>
                        </Grid>
                        <Grid item xs container direction="column" spacing={2}>
                            <Grid item sx={{ textAlign: "right" }}>
                                <Tooltip title={row.owned ? "Remove from collection" : "Add to collection"}>
                                    <Typography variant="subtitle1" component="div">
                                        {
                                            row.owned 
                                                ? <RemoveCircleIcon sx={{ color: 'secondary.light', p: 0, cursor: "pointer" }} onClick={handleToggle(row.id)} /> 
                                                : <AddCircleOutlineIcon sx={{ color: 'primary.main', p: 0, cursor: "pointer" }} onClick={handleToggle(row.id)} />
                                        }
                                    </Typography>
                                </Tooltip>
                            </Grid>
                            <Grid item sx={{ textAlign: "right" }}>
                                <Typography variant="subtitle1" component="div" sx={{ fontSize: 14 }}>
                                    <GroupIcon sx={{ fontSize: 14 }} /> {row.min_players} - {row.max_players}
                                </Typography>
                            </Grid>
                            <Grid item sx={{ textAlign: "right" }}>
                                <Typography variant="subtitle1" component="div" sx={{ fontSize: 14 }}>
                                    <BalanceIcon sx={{ fontSize: 14 }} /> {Math.round(row.average_learning_complexity * 100) / 100}
                                </Typography>
                            </Grid>
                            <Grid item sx={{ textAlign: "right" }}>
                                <Typography variant="subtitle1" component="div" sx={{ fontSize: 14 }}>
                                    <AccessTimeIcon sx={{ fontSize: 14 }} /> {row.playtime}
                                </Typography>
                            </Grid>
                        </Grid>

                    </Grid>
                </Paper>
            </Grid>
        </React.Fragment>
    );
}

const postData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}

const deleteData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'DELETE',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}

export default function GameSearchResults({
    title,
    queryValue,
    curPage,
    playerCount,
    category,
    mechanic,
    owned
}: {
    title: string,
    queryValue: string,
    curPage: number,
    playerCount: string,
    category: string,
    mechanic: string,
    owned: boolean
}) {
    const { data: session, status } = useSession();
    const userEmail = session?.user.email;

    const { data, error, isLoading, url } = search(queryValue, curPage, playerCount, category, mechanic, owned);
    const { mutate } = useSWRConfig()

    if (error) {
        console.log("Failed to load");
        return <div>Failed to load</div>
    }
    if (isLoading) {
        console.log("Loading...");
        return <img src="../public/Rentfreeanim.gif" />
    }
    if (!data) {
        console.log("data: ", data);
        return null;
    }

    const handleToggle = (id: string) => async () => {
        const currentGames = [...data.games];
        const selectedGame = currentGames.find(g => g.id === id);

        if (!selectedGame?.owned) {
            selectedGame.owned = true;
            if (status === "authenticated") {
                await mutate(url, {
                    ...data,
                    games: currentGames.map(g => g.id === id ? { ...g, owned: true } : { ...g})
                }, { revalidate: false });
                const response = await postData("/api/usergames", { id });
            }
        } else {
            selectedGame.owned = false;
            if (status === "authenticated") {
                await mutate(url, {
                    ...data,
                    games: currentGames.map(g => g.id === id ? { ...g, owned: false } : { ...g})
                }, { revalidate: false });
                const response = await deleteData("/api/usergames", { id });
            }
        }
    };
    return (
        <Box sx={{ flexGrow: 1, paddingTop: 2 }}>
             <Typography variant="h4" component="div">
                {title}
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Grid container item spacing={3}>
                    {
                        data.games.map((row) => (
                            <FormRow row={row} numGames={data.games.length} handleToggle={handleToggle} key={row.id} />
                        ))
                    }
                </Grid>
            </Grid>
        </Box>
    );
}