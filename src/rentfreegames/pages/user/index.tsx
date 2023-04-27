import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import utilStyles from '../../styles/utils.module.css'
import { useSession, signIn, signOut } from "next-auth/react"
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function User() {
    const { data: session, status } = useSession()
    const userEmail = session?.user.email

    if (status === "loading") {
        return <p>Hang on there...</p>
    }

    if (status === "authenticated") {
        return (
            <Layout>
                <>
                    <p>Signed in as {userEmail}</p>
                    {/* Get user content from database */}
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={() => signOut()}>
                            Sign out
                        </Button>
                    </Stack>
                </>
            </Layout>
        )
    }

    return (
        <Layout>
            <>
                <p>Not signed in.</p>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" endIcon={<GitHubIcon />} onClick={() => signIn("github")}>
                        Sign in using GitHub
                    </Button>
                </Stack>
            </>
        </Layout>
    )
}
