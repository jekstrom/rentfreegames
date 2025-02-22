import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BalanceIcon from '@mui/icons-material/Balance';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Box, Button, Link, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useSWRConfig } from "swr";
import { Category, Game, Mechanic, Owner, User, GuestUser, GameRating } from '../interfaces';
import { getInviteSession } from '../pages/sessions/invite/[inviteId]';
import { useGuestUserContext } from './GuestUserContext';
import Image from "next/image";
import Rating from '@mui/material/Rating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { tomato } from '../styles/theme';

function FormRow({ row, userGameRatings, avgUserGameRatings }: { row: Game, userGameRatings: GameRating[], avgUserGameRatings: GameRating[] }) {
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
                                    disabled
                                    value={userGameRatings ? userGameRatings.find(r => r.gameId === row.id)?.rating ?? 0 : 0}
                                    sx={{ fontSize: 24, color: tomato }}
                                    precision={0.5}
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
    // Merge games' owners with same BGGId
    for (const game of games.filter(g => g.owned)) {
        const otherGame = games.find(g => g.id === game.id && g.ownedBy.every(o => game.ownedBy.indexOf(o) < 0));
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

function getUserGames(user: User | GuestUser, userId: string, query: string, playerCount?: string, mechanic?: Mechanic, category?: Category, owned?: boolean, sessionPlayerCount?: number): Game[] {
    // Flatten list of games
    let games: Game[] = [];
    if (user) {
        user.games.forEach(game => {
            game.owned = user.id === userId;
            game.ownedBy = [{ name: user.name, userId: user.id }];
            games.push(game);
        });
    }

    if (query) {
        games = games.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
    }
    
    if (playerCount) {
        if (playerCount === "players") {
            games = getGamesByPlayerCount(games, sessionPlayerCount);
        } else if (parseInt(playerCount) > 1) {
            games = games.filter(g => g.max_players >= parseInt(playerCount));
        } 
    }

    if (mechanic) {
        games = games.filter(g => g.mechanics.some(m => m.id == mechanic.id));
    }

    if (category) {
        games = games.filter(g => g.categories.some(c => c.id == category.id));
    }

    if (owned) {
        games = games.filter(g => g.owned);
    }

    games = mergeGameOwners(games);

    return getUniqueGames(games);
}

export default function GameSessionInviteResults({
    title,
    id,
    query,
    playerCount,
    mechanic,
    category,
    owned,
    sessionPlayerCount,
}: {
    title: string,
    id: string,
    query: string,
    playerCount?: string,
    mechanic?: Mechanic,
    category?: Category,
    owned?: boolean,
    sessionPlayerCount?: number
}) {
    const router = useRouter();
    const guestUser = useGuestUserContext();

    const { data, error, isLoading, isValidating, url } = getInviteSession(id, guestUser);
    const { mutate } = useSWRConfig()

    if (error) {
        console.log("Failed to load");
        return <div>Failed to load</div>
    }
    if (isLoading) {
        console.log("Loading...");
        return <CircularProgress />
    }
    if (!data) {
        return null;
    }

    const addGames = () => {
        router.push(`/games?inviteId=${id}`)
    }

    const games = getUserGames(data.user, data.user?.id, query, playerCount, mechanic, category, owned, sessionPlayerCount);

    return (
        <Box sx={{ flexGrow: 1, paddingTop: 2 }}>
            <Typography variant="h4" component="div">
                {title}
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                <Grid container item spacing={3}>
                    {
                        games.length > 0
                            ? games.map((row) => (
                                <FormRow row={row} userGameRatings={data.userGameRatings} avgUserGameRatings={data.avgUserGameRatings} key={row.id} />
                            ))
                            : <React.Fragment>
                                <Grid item xs={12} sm={12} md={12}>
                                    <Typography variant="overline" component="div" sx={{ fontSize: 14 }}>
                                        No Games Found
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={12}>
                                    <Button onClick={addGames}><AddCircleIcon sx={{ marginRight: 1, color: "secondary.light" }} /> Add games</Button>
                                </Grid>
                            </React.Fragment>
                    }
                </Grid>
            </Grid>
        </Box>
    );
}