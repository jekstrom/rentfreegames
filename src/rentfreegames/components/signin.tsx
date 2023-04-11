import GitHubIcon from '@mui/icons-material/GitHub';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { signIn, signOut, useSession } from "next-auth/react";

export default function Signin() {
    const { data: session, status } = useSession()
    const userEmail = session?.user.email

    if (status === "loading") {
        return <p>Hang on there...</p>
    }

    if (status === "authenticated") {
        return (
            <>
                <Stack direction="row" spacing={2} sx={{ m: 1 }}>
                    <Button variant="outlined" onClick={() => signOut()}>
                        Sign out
                    </Button>
                </Stack>
            </>
        )
    }

    return (
        <>
            <Stack direction="row" spacing={2} sx={{ m: 1 }}>
                <Button variant="contained" endIcon={<GitHubIcon />} onClick={() => signIn("github")}>
                    Sign in using GitHub
                </Button>
            </Stack>
        </>
    )
}
