import { Button, Grid, useMediaQuery } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal from '@mui/material/Modal';
import Snackbar from '@mui/material/Snackbar';
import { useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import * as React from 'react';
import ConfettiExplosion from 'react-confetti-explosion';
import { Game, GameRating, GameSwipe, Owner, User } from '../interfaces';
import { getSession } from '../pages/sessions/[id]';
import { useGuestUserContext } from './GuestUserContext';
import { useSWRConfig } from 'swr';

const postData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
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


    const getUserSwipableGames = (games: Game[], userId: string, userRatings?: GameRating[], userSwipes?: GameSwipe[]) => {
        if (userSwipes) {
            return games.filter(g => !userSwipes.some(s => s.userId == userId && s.gameId === g.id));
        }

        return games;
    }

    const [swipableGames, setSwipableGames] = React.useState(getUserSwipableGames(data?.gameSession?.games, data.sessionUser?.id ?? guestUser.id, data?.gameSession?.userGameRatings, data?.gameSession?.userSwipes));
    const [currentSwipe, setCurrentSwipe] = React.useState(swipableGames.length > 0 ? swipableGames[0] : null);
    const [swipedGames, setSwipedGames] = React.useState([] as GameSwipe[]);
    const { mutate } = useSWRConfig()

    let didMount = React.useRef(false);
    React.useEffect(() => {
        if (didMount.current && swipableGames.length === 0) {
            handleClose();
            showSnack()
            setIsExploding(true);
        } else {
            didMount.current = true;
        }
    }, [swipableGames]);

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

    const handleClose = async () => {
        setOpen(false);
        let url = (data?.gameSession?.id ? `/api/sessions/${data.gameSession.id}` : null)
        if (url && guestUser) {
            url += `?guestId=${guestUser.id}`
        }

        await mutate(url, {
            ...data,
           gameSession: {...data.gameSession, userSwipes: [...data.gameSession.userSwipes, ...swipedGames]}
        }, { revalidate: false });

        await postData(`/api/sessions/${data.gameSession.id}/user/${data.sessionUser?.id ?? guestUser.id}`, { swipedGames });
    };

    // handle all swipes on close or delay.
    const onDragEnd = async (event, info, game) => {
        if (info.offset.x > 200) {
            const newSwipableGames = swipableGames.filter(g => g.id !== game.id);
            setSwipableGames(newSwipableGames);
            if (newSwipableGames.length > 0) {
                setCurrentSwipe(newSwipableGames[0]);
            }
            addUserSwipedGame(data.sessionUser?.id ?? guestUser.id, game.id, true);
        } else if (info.offset.x < -200) {
            const newSwipableGames = swipableGames.filter(g => g.id !== game.id);
            setSwipableGames(newSwipableGames);
            if (newSwipableGames.length > 0) {
                setCurrentSwipe(newSwipableGames[0]);
            }
            addUserSwipedGame(data.sessionUser?.id ?? guestUser.id, game.id, false);
        }
    }


    const addUserSwipedGame = async (userId:string, gameId: string, liked: boolean) => {
        if (data?.gameSession?.id && gameId) {
            setSwipedGames([...swipedGames, { userId, gameId, swipedRight: liked } as GameSwipe]);
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
                key="games-SessionModal"
            >
                <Fade in={open} key="fade-in">
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
                            games ? games.map((game, index) => (
                                currentSwipe?.id === game.id && swipableGames.some(g => g.id == game.id)
                                    ? <div key="game-swipable"> { games[index+1] && <GameCard game={games[index+1]} onDragEnd={onDragEnd} key={games[index+1].id} /> } <GameCard game={game} onDragEnd={onDragEnd} key={game.id} /> </div>
                                    : <div key={game.id}></div>
                            ))
                                : <Box sx={{ width: "100%", overflow: "hidden", userSelect: "none", display: "none" }} key="no-game" />
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
                <Box sx={{ paddingTop: 1, paddingRight: 1 }} key="start-swiping-box">

                    {
                        swipableGames.length > 0
                            ? <Button variant="contained" onClick={handleClickOpen} sx={{ width: "100%", bgcolor: "secondary.main", color: "secondary.contrastText" }} key="start-swiping">
                                Start Swiping
                            </Button>
                            : <></>
                    }

                    <GameModal games={data?.gameSession?.games} key="games-modal" />
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
