import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BalanceIcon from '@mui/icons-material/Balance';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Link, Typography } from '@mui/material';
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

function FormRow({ sessionId, row, handleRating }: { sessionId: string, row: Game, handleRating: any }) {
    return (
        <React.Fragment>
            <Grid item xs={12} sm={12} md={4}>
                <Paper elevation={2} sx={{ height: "100%" }}>
                    <Grid item xs={12} sm sx={{ height: "88%" }} container padding={1} >
                        <Grid item xs={8} sx={{ height: "100%" }} container direction="column" spacing={2}>
                            <Grid item xs={4} sx={{ height: "100%" }} padding="3px">
                                {
                                    row.images.small ?
                                        <Link target="_blank" href={row.url}><img src={row.images.small} style={{ width: "100px", padding: "1px" }} /></Link>
                                        : <></>
                                }
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
                                    {row.ownedBy.length > 1 ? `${row.ownedBy.length} owners` : row.ownedBy.map(o => o.name).join(", ")}
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
                                    value={row.rating}
                                    sx={{ fontSize: 24, color: tomato }}
                                    precision={0.5}
                                    onChange={async (event, newValue) => {
                                        await handleRating(sessionId, row.id, newValue);
                                    }}
                                    icon={<FavoriteIcon fontSize="inherit" />}
                                    emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ display: 'flex', justifyContent: "right"}}>
                                <Typography variant="subtitle2" component="div" sx={{ color: "secondary.main", fontSize: 10, marginRight: "8px" }}>
                                    <FavoriteIcon sx={{ color: tomato, fontSize:14 }}/> {row.rating ? `AVG ${row.avg_rating}` : ""}
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

export function getUserGames(users: (User | GuestUser)[], userId: string, query: string, playerCount?: string, mechanic?: Mechanic, category?: Category, owned?: boolean, userRatings?: GameRating[], ratingSort?: string): Game[] {
    // Flatten list of games
    let games: Game[] = [];
    users.forEach(user => {
        user.games.forEach(game => {
            game.owned = user.id === userId;
            game.ownedBy = [{ name: user.name, userId: user.id }];
            game.rating = 2.5;
            game.avg_rating = 2.5;
            if (userRatings) {
                const gameRatings = userRatings.filter(r => r.gameId === game.id).map(r => r.rating);
                game.rating = userRatings.find(r => r.gameId === game.id && r.userId === userId)?.rating ?? 2.5;
                if (gameRatings && gameRatings.length > 0) {
                    game.avg_rating = Math.round((gameRatings.reduce((r, acc) => acc += r) / gameRatings.length) * 2) / 2 ?? 2.5;
                }
            }
            games.push(game);
        });
    });

    games = mergeGameOwners(games);

    if (query) {
        games = games.filter(g => g.name.toLowerCase().includes(query.toLowerCase()));
    }

    if (playerCount) {
        if (playerCount === "players") {
            games = getGamesByPlayerCount(games, users.length);
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

    return getUniqueGames(games).sort((a, b) => {
        if (ratingSort === "user") {
            return b.rating - a.rating;
        } else if (ratingSort === "session") {
            return b.avg_rating - a.avg_rating;
        }
    });
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

    const handleRating = async (sessionId: string, gameId: string, rating: number) => {
        if (sessionId && gameId && rating > 0) {
            const currentRatings = data?.gameSession?.userGameRatings ?? [];
            const newRating = { gameId: gameId, userId: data.sessionUser?.id ?? guestUser.id, rating: rating };
            if (currentRatings.length === 0 || !currentRatings.some(r => r.gameId === gameId && r.userId === data.sessionUser.id)) {
                currentRatings.push(newRating);
            }

            const newRatings = currentRatings.map(r => r.gameId === gameId && r.userId ===  (data.sessionUser?.id ?? guestUser.id) ? { ...r, rating: rating } : { ...r});

            const gameSession = data.gameSession;
            gameSession.userGameRatings = newRatings;
            let url = `/api/sessions/${sessionId}`;
            if (guestUser?.id) {
                url = `/api/sessions/${sessionId}?guestId=${guestUser.id}`;
            }
            await postData(url, { gameId, rating }).then(async () => {
                await mutate(url, {
                    ...data,
                    gameSession
                }, { revalidate: true });
            });
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
                        getUserGames(data.gameSession?.users, data.sessionUser?.id ?? guestUser.id, query, playerCount, mechanic, category, owned, data.gameSession?.userGameRatings, ratingSort).map((row) => (
                            <FormRow sessionId={data.gameSession.id} row={row} key={row.id} handleRating={handleRating} />
                        ))
                    }
                </Grid>
            </Grid>
        </Box>
    );
}