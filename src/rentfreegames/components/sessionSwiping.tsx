import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { AppBar, Button, IconButton, Toolbar, Typography, Grid, useMediaQuery } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import * as React from 'react';
import { useSession } from 'next-auth/react'
import { Game, GameRating, Owner, User, GameSwipe } from '../interfaces';
import { getSession } from '../pages/sessions/[id]';
import { useRouter } from 'next/router';
import { useGuestUserContext } from './GuestUserContext';
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import { tomato } from '../styles/theme';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ConfettiExplosion from 'react-confetti-explosion';
import dynamic from 'next/dynamic';

const postData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
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

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

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

export default function SessionSwiping() {
    const { data: session, status } = useSession();
    const userEmail = session?.user.email;
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState("");
    const guestUser = useGuestUserContext();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [snackState, setSnackState] = React.useState(false);
    const [isExploding, setIsExploding] = React.useState(false);

    const showSnack = () => {
        setSnackState(true);
    };

    const handleSnackClose = () => {
        setSnackState(false);
    };

    const { query } = useRouter()
    const { data, error, isLoading, isValidating } = getSession(query?.id as string, guestUser?.id)

    const flattenGames = (users: User[], userId: string, userRatings?: GameRating[]) => {
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

        return games;
    }

    const getUserGames = (users: User[], userId: string, userRatings?: GameRating[]) => {
        let games = flattenGames(users, userId, userRatings);

        games = mergeGameOwners(games);

        return getUniqueGames(games);
    }

    const getUserSwipableGames = (users: User[], userId: string, userRatings?: GameRating[], userSwipes?: GameSwipe[]) => {
        let games = getUserGames(users, userId, userRatings);
        if (userSwipes) {
            return games.filter(g => !userSwipes.some(s => s.gameId === g.id));
        }
        return games;
    }

    const [swipableGames, setSwipableGames] = React.useState(getUserSwipableGames(data?.gameSession?.users, data.sessionUser?.id ?? guestUser.id, data?.gameSession?.userGameRatings, data?.gameSession?.userSwipes));
    const [currentSwipe, setCurrentSwipe] = React.useState(swipableGames.length > 0 ? swipableGames[0] : null);

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

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onDragEnd = async (event, info, game) => {
        if (info.offset.x > 200) {
            const newSwipableGames = swipableGames.filter(g => g.id !== game.id);
            setSwipableGames(newSwipableGames);
            if (newSwipableGames.length > 0) {
                setCurrentSwipe(newSwipableGames[0]);
            }
            await addUserSwipedGame(game.id, true);
            if (newSwipableGames.length === 0) {
                setOpen(false);
                showSnack()
                setIsExploding(true);
            }
        } else if (info.offset.x < -200) {
            const newSwipableGames = swipableGames.filter(g => g.id !== game.id);
            setSwipableGames(newSwipableGames);
            if (newSwipableGames.length > 0) {
                setCurrentSwipe(newSwipableGames[0]);
            }
            await addUserSwipedGame(game.id, false);
            if (newSwipableGames.length === 0) {
                setOpen(false);
                showSnack()
                setIsExploding(true);
            }
        }
        if (swipableGames.length === 0) {
            setOpen(false);
            showSnack()
            setIsExploding(true);
        }
    }


    const addUserSwipedGame = async (gameId: string, liked: boolean) => {
        if (data?.gameSession?.id && gameId) {
            await postData(`/api/sessions/${data.gameSession.id}/user/${data.sessionUser?.id ?? guestUser.id}`, { gameId, liked });
        }
    }

    const GameCard = dynamic(() => import('./gameCard'))

    function GameModal({ games }: { games: Game[] | null }) {
        return (
            <Modal
                aria-labelledby={`transition-modal-games`}
                aria-describedby={`transition-modal-games-swiper`}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                sx={{ backdropFilter: "blur(5px)", }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={{
                        position: "absolute",
                        top: fullScreen ? "75%" : "50%",
                        left: "50%",
                        transform: 'translate(-50%, -50%)',
                        width: fullScreen ? "100%" : "600px",
                        height: fullScreen ? "100%" : "600px",
                        bgcolor: "transparent",
                        color: "primary.contrastText",
                        overflow: "hidden"
                    }} key="swipable-games">
                        {
                            games ? games.map((game) => (
                                currentSwipe?.id === game.id && swipableGames.some(g => g.id == game.id)
                                    ? <GameCard game={game} onDragEnd={onDragEnd} key={game.id} />
                                    : <div key={game.id}></div>
                            ))
                                : <Box sx={{ width: "100%", overflow: "hidden", userSelect: "none", display: "none" }} />
                        }
                    </Box>
                </Fade>
            </Modal>
        );
    }

    return (
        <Grid container>
            <Grid item xs={12} sm={12} md={12} sx={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                <>{isExploding && <ConfettiExplosion particleCount={250} />}</>
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
                <Box sx={{ paddingTop: 1, paddingRight: 1 }}>

                    {
                        swipableGames.length > 0
                            ? <Button variant="contained" onClick={handleClickOpen} sx={{ width: "100%", bgcolor: "secondary.main", color: "secondary.contrastText" }}>
                                Start Swiping
                            </Button>
                            : <></>
                    }

                    <GameModal games={getUserGames(data?.gameSession?.users, data.sessionUser?.id ?? guestUser.id, data?.gameSession?.userGameRatings)} />
                    <Snackbar
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        open={snackState}
                        onClose={handleSnackClose}
                        message="Swiping complete!"
                        key="bottomcenter"
                    />
                </Box>
            </Grid>
        </Grid>
    );
}
