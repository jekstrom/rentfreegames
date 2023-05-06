import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Game, GameRating } from '../interfaces';
import { Tooltip, Typography } from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BalanceIcon from '@mui/icons-material/Balance';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Rating from '@mui/material/Rating';
import { useSession } from 'next-auth/react'
import { search } from '../pages/games';
import { useSWRConfig } from "swr"
import { useGuestUserContext, useSetGuestUserContext } from '../components/GuestUserContext'
import { tomato } from '../styles/theme';
import { getUserMetaData } from './navBar'

function FormRow({ row, numGames, handleToggle, handleRating, userGameRatings, avgUserGameRatings }: { row: Game, numGames: number, handleToggle: any, handleRating: any, userGameRatings: GameRating[], avgUserGameRatings: GameRating[] }) {
    return (
        <React.Fragment key={row.id}>
            <Grid item xs={12} sm={12} md={numGames < 3 ? 12 : 4}>
                <Paper elevation={2} sx={{ height: "100%" }}>
                    <Grid item xs={12} sm sx={{ height: "88%" }} container padding={1} >
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
                    <Grid item container xs={12} >
                        <Grid item xs={8} >
                            <Box sx={{ '& > legend': { mt: 2 }, marginLeft: "8px", marginBottom: "8px" }}>
                                <Rating
                                    name="rating"
                                    value={userGameRatings ? userGameRatings.find(r => r.gameId === row.id)?.rating ?? 0 : 0}
                                    sx={{ fontSize: 24, color: tomato }}
                                    precision={0.5}
                                    onChange={async (event, newValue) => {
                                        await handleRating(row.id, newValue);
                                    }}
                                    icon={<FavoriteIcon fontSize="inherit" />}
                                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ display: 'flex', justifyContent: "right" }}>
                                <Typography variant="subtitle2" component="div" sx={{ color: "secondary.main", fontSize: 10, marginRight: "8px" }}>
                                    { avgUserGameRatings && avgUserGameRatings.find(r => r.gameId === row.id) ? <FavoriteIcon sx={{ color: tomato, fontSize: 14 }} /> : <></> } 
                                    {avgUserGameRatings && avgUserGameRatings.find(r => r.gameId === row.id) ? `AVG ${(Math.round(avgUserGameRatings.find(r => r.gameId === row.id)?.rating * 100) / 100).toFixed(2) ?? 0}` : ""}
                                </Typography>
                            </Box>
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
    const guestUser = useGuestUserContext();
    const setUser = useSetGuestUserContext();

    const { data, error, isLoading, url } = search(queryValue, curPage, playerCount, category, mechanic, owned, guestUser);
    const { data: userData, isLoading: userIsLoading, error: userError, isValidating, url: userUrl } = getUserMetaData(guestUser?.id);
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
        return null;
    }

    const handleToggle = (id: string) => async () => {
        const currentGames = [...data.games];
        const selectedGame = currentGames.find(g => g.id === id);

        if (!selectedGame?.owned) {
            selectedGame.owned = true;
            await mutate(url, {
                ...data,
                games: currentGames.map(g => g.id === id ? { ...g, owned: true } : { ...g})
            }, { revalidate: false });
            const response = await postData("/api/usergames", { id, guestId: guestUser?.id });

            if (guestUser && guestUser?.id) {
                setUser({...guestUser, games: [...guestUser?.games ?? [], id]});
            }
        } else {
            selectedGame.owned = false;
            await mutate(url, {
                ...data,
                games: currentGames.map(g => g.id === id ? { ...g, owned: false } : { ...g})
            }, { revalidate: false });
            const response = await deleteData("/api/usergames", { id, guestId: guestUser?.id });

            if (guestUser && guestUser?.id) {
                setUser({...guestUser, games: [...guestUser?.games?.filter(g => g !== id) ?? []]});
            }
        }
    };

    const handleRating = async (gameId: string, rating: number) => {
        if (gameId && rating > 0) {
            const currentRatings = data?.userGameRatings ?? [];
            const newRating = { gameId: gameId, userId: userData.user.id, rating: rating };
            if (currentRatings.length === 0 || !currentRatings.some(r => r.gameId === gameId && r.userId === userData.user.id)) {
                currentRatings.push(newRating);
            }

            const newRatings = currentRatings.map(r => r.gameId === gameId && r.userId === (userData.user.id) ? { ...r, rating: rating } : { ...r });

            let ratingsApi = `/api/users/ratings`;
            if (guestUser?.id) {
                ratingsApi += `?guestId=${guestUser.id}`;
            }
            await postData(ratingsApi, {ratings: [{ gameId, rating }]}).then(async () => {
                await mutate(url, {
                    ...data,
                    userGameRatings: newRatings
                }, { revalidate: true });
            });
        }
    };

    return (
        <Box sx={{ flexGrow: 1, paddingTop: 2 }}>
             <Typography variant="h4" component="div">
                {title}
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} key="gamesListContainer">
                <Grid container item spacing={3} key="gamesList">
                    {
                        data?.games?.length ? data?.games?.map((row) => (
                            <FormRow row={row} numGames={data.games.length} userGameRatings={data.userGameRatings} avgUserGameRatings={data.avgUserGameRatings} handleToggle={handleToggle} handleRating={handleRating} key={row.id} />
                        ))
                        : <></>
                    }
                </Grid>
            </Grid>
        </Box>
    );
}