import GitHubIcon from '@mui/icons-material/GitHub';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { signIn, signOut, useSession } from "next-auth/react";
import { DiscordIcon } from "./customIcons";
import TextField from '@mui/material/TextField';
import { useGuestUserContext, useSetGuestUserContext } from '../components/GuestUserContext'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { Box, Grid } from '@mui/material';
import Divider from '@mui/material/Divider';
import { useRouter } from 'next/router';
import { useState } from 'react';

const postData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}


export default function Signin({ redirect }: { redirect?: string }) {
    const { data: session, status } = useSession()
    const userEmail = session?.user.email
    const guestUser = useGuestUserContext();
    const setUser = useSetGuestUserContext();
    const router = useRouter();
    const [displayName, setDisplayName] = useState("Guest");

    const addGamesRoute = () => {
        if (redirect) {
            router.push(redirect)
        } else {
            router.push(`/games`)
        }
    }

    if (status === "loading") {
        return <p>Hang on there...</p>
    }

    if (status === "authenticated" || guestUser?.name !== "") {
        return (
            <>
                <Stack direction="row" spacing={2} sx={{ m: 1 }}>
                    <Button variant="outlined" onClick={() => {
                        if (guestUser?.name !== "") {
                            setUser({ name: '', games: [], isGuest: true, gameRatings: [] });
                        }
                        signOut();
                    }}>
                        Sign out
                    </Button>
                </Stack>
            </>
        )
    }

    const handleGuestUser = async () => {
        if (!guestUser || !guestUser?.id) {
            let userName = displayName;
            if (userName === "") {
                userName = "Guest";
            }
            const newGuestUser = { id: "", name: userName, games: [], isGuest: true, gameRatings: [] }

            // Persist new guest user
            const persistedGuestUser = await postData(`/api/users/guest/`, newGuestUser);
            newGuestUser.id = persistedGuestUser.user.id;
            setUser(newGuestUser);
        }

        addGamesRoute();
    }

    return (
        <Box sx={{ display: "flex" }}>
            <Grid container sx={{ margin: 1, width: { xs: "80vw", md: "40vw", lg: "30vw" } }}>
                <Grid container item xs={12} sx={{ margin: 1 }}>
                    <Grid item xs={6}>
                        <TextField id="outlined-display-name" label="Name" variant="outlined"
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Button variant="contained" endIcon={<EmojiEmotionsIcon sx={{ color: "secondary.light" }} />} onClick={() => handleGuestUser()} sx={{ bgcolor: "secondary.main", color: "secondary.contrastText", height: "100%" }}>
                            Continue as Guest
                        </Button>
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ margin: 1, xs: { width: "100%" }, md: { width: "50%" } }}>
                    <Divider sx={{ width: "100%" }} />
                </Grid>
                <Grid item xs={12} sx={{ margin: 1, xs: { width: "100%" }, md: { width: "50%" } }}>
                    <Button variant="contained" endIcon={<GitHubIcon />} onClick={() => signIn("github")} sx={{ width: "100%" }}>
                        Sign in using GitHub
                    </Button>
                </Grid>
                <Grid item xs={12} sx={{ margin: 1, xs: { width: "100%" }, md: { width: "50%" } }}>
                    <Button variant="contained" endIcon={<DiscordIcon />} onClick={() => signIn("discord")} sx={{ width: "100%" }}>
                        Sign in using Discord
                    </Button>
                </Grid>
                <Grid item xs={12} sx={{ margin: 1, xs: { width: "100%" }, md: { width: "50%" } }}>
                    <Button variant="contained" onClick={() => signIn("azure-ad-b2c")} sx={{ width: "100%" }}>
                        Sign in with Email
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}
