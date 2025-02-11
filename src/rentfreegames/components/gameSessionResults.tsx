import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BalanceIcon from '@mui/icons-material/Balance';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Button, Link, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import { useSWRConfig } from "swr";
import { Category, Game, Mechanic, Owner, User, GuestUser, GameRating } from '../interfaces';
import { getSession } from '../pages/sessions/[id]';
import Rating from '@mui/material/Rating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { tomato } from '../styles/theme';
import { useGuestUserContext } from './GuestUserContext';
import Image from "next/image";
import { getUserMetaData } from './navBar'

function FormRow({ sessionId, row, handleRating, userGameRatings, avgUserGameRatings }: { sessionId: string, row: Game, handleRating: any, userGameRatings: GameRating[], avgUserGameRatings: GameRating[] }) {
    return (
        <React.Fragment>
            <Grid item xs={12} sm={12} md={4}>
                <Paper elevation={2} sx={{ height: "100%" }}>
                    <Grid item xs={12} sm sx={{ height: "88%" }} container padding={1} >
                        <Grid item xs={8} sx={{ height: "100%" }} container direction="column" spacing={2}>
                            <Grid item xs={4} sx={{ height: "150px" }} padding="3px">
                                <Box sx={{ position: "relative", width: "100px", height: "100px", overflow: "hidden" }}>
                                {
                                    row.images.small ?
                                        <Link target="_blank" href={row.url}><Image fill alt={row.name} src={row.images.small} /></Link>
                                        : <></>
                                }
                                </Box>
                                <Tooltip title={row.name}>
                                    <Typography gutterBottom variant="overline" component="div" sx={row.name.length > 15 ? { fontSize: 10, padding: "1px" } : { fontSize: 14, padding: "3px" }}>
                                        {row.name.length > 50 ? row.name.substring(0, 50) + "..." : row.name}
                                    </Typography>
                                </Tooltip>
                            </Grid>
                        </Grid>
                        <Grid item xs={4} container direction="column" spacing={3}>
                            <Grid item sx={{ textAlign: "right" }}>
                                <Typography variant="subtitle1" component="div" sx={{ fontSize: 14 }}>
                                    <GroupIcon sx={{ fontSize: 14 }} /> {row.min_players} - {row.max_players}
                                </Typography>
                            </Grid>
                            <Grid item sx={{ textAlign: "right" }}>
                                <Typography variant="subtitle1" component="div" sx={{ fontSize: 14 }}>
                                    <Tooltip title={row.ownedBy.map(o => o.name).join(", ")}>
                                        <PersonIcon sx={{ fontSize: 14 }} />
                                    </Tooltip>
                                    {row.ownedBy.length > 1 ? `${row.ownedBy.length} owners` : row.ownedBy.map(o => o.name.split(' ').some(n => n.length > 10) ? `${o.name.substring(0, 10)}...` : o.name).join(", ")}
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

function getGamesByPlayerCount(games: Game[], numPlayers: number): Game[] {
    return games.filter(g => g.min_players <= numPlayers && g.max_players >= numPlayers);
}

function mergeGameOwners(games: Game[]): Game[] {
    for (const game of games) {
        const otherGame = games.find(g => g.id === game.id && g.ownedBy.every(o => game.ownedBy.every(ob => ob.userId !== o.userId)));
        if (otherGame) {
            game.ownedBy = otherGame.ownedBy.concat(game.ownedBy) as [Owner];
            otherGame.ownedBy = otherGame.ownedBy.concat(game.ownedBy) as [Owner];
            otherGame.owned = true;
        }
    }
    return games;
}

function getUniqueGames(games: Game[]) {
    // Unique games by BGGId
    let uniqueGames = Object.values(
        games.reduce((acc, obj) => ({ ...acc, [obj.id]: obj }), {})
    ) as Game[];

    // Remove duplicate owners
    for (const game of uniqueGames) {
        game.ownedBy = Object.values(game.ownedBy.reduce((acc, obj) => ({ ...acc, [obj.userId]: obj }), {})) as [Owner];
    }
    return uniqueGames;
}

function getUserGames(userId: string, games: Game[], userCount: number, query: string, playerCount?: string, mechanic?: Mechanic, category?: Category, owned?: boolean, ratingSort?: string, userGameRatings?: GameRating[], avgUserGameRatings?: GameRating[]): Game[] {
    // Flatten list of games
    if (!games) {
        return [];
    }

    if (query) {
        games = games.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
    }

    if (playerCount) {
        if (playerCount === "players") {
            games = getGamesByPlayerCount(games, userCount);
        } else if (parseInt(playerCount) > 1) {
            games = games.filter(g => g.max_players >= parseInt(playerCount));
        }
    }
    
    if (mechanic) {
        console.log("Filtering by mechanic: ", mechanic)
        games = games.filter(g => g.mechanics.some(m => m.id == mechanic.id));
    }

    if (category) {
        games = games.filter(g => g.categories.some(c => c.id == category.id));
    }

    if (owned) {
        games = games.filter(g => g.owned);
    }

    if (userGameRatings && avgUserGameRatings) {
        return games.sort((a, b) => {
            if (ratingSort === "user") {
                return (userGameRatings.find(r => r.userId === userId && r.gameId === b.id)?.rating ?? 0) - (userGameRatings.find(r => r.userId === userId && r.gameId === a.id)?.rating ?? 0);
            } else if (ratingSort === "avg") {
                return (avgUserGameRatings.find(r => r.gameId === b.id)?.rating ?? 0) - (avgUserGameRatings.find(r => r.gameId === a.id)?.rating ?? 0);
            }
        });
    }

    return games;
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

export default function GameSessionResults({
    title,
    id,
    query,
    playerCount,
    mechanic,
    category,
    owned,
    ratingSort
}: {
    title: string,
    id: string,
    query: string,
    playerCount?: string,
    mechanic?: Mechanic,
    category?: Category,
    owned?: boolean,
    ratingSort?: string
}) {
    const { data: session, status } = useSession();
    const userEmail = session?.user.email;
    const guestUser = useGuestUserContext();
    
    const { data, error, isLoading, isValidating, url } = getSession(id, guestUser?.id);
    const { data: userData, isLoading: userIsLoading, error: userError, isValidating: userIsValidating, url: userUrl } = getUserMetaData(guestUser?.id);
    const [showGamesList, setShowGamesList] = React.useState(true)
    const { mutate } = useSWRConfig()

    if (error || userError) {
        console.log("Failed to load");
        return <div>Failed to load</div>
    }
    if (isLoading || userIsLoading) {
        console.log("Loading...");
        return <CircularProgress />
    }
    if (!data) {
        return null;
    }

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
            await postData(ratingsApi, {ratings: [{ userId: userData.user.id, gameId, rating }]}).then(async () => {
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
                {title} <Button onClick={() => setShowGamesList(!showGamesList)}><sub>{showGamesList ? "hide" : "show"}</sub></Button>
            </Typography>
            {
                showGamesList
                ? <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid container item spacing={3}>
                        {
                            getUserGames(
                                userData?.user?.id,
                                data.gameSession?.games, 
                                data.gameSession?.users?.length ?? 0, 
                                query, 
                                playerCount, 
                                mechanic, 
                                category, 
                                owned, 
                                ratingSort,
                                data.userGameRatings, 
                                data.avgUserGameRatings
                            ).map((row) => (
                                <FormRow sessionId={data.gameSession.id} row={row} key={row.id} handleRating={handleRating} userGameRatings={data.userGameRatings} avgUserGameRatings={data.avgUserGameRatings} />
                            ))
                        }
                    </Grid>
                </Grid>
                : <></>
            }

        </Box>
    );
}