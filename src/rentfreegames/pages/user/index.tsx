import Layout from '../../components/layout'
import { useSession, signIn, signOut } from "next-auth/react"
import { useGuestUserContext } from '../../components/GuestUserContext';
import Signin from '../../components/signin';
import { Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const deleteData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'DELETE',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}

export default function User() {
    const { data: session, status } = useSession()
    const userEmail = session?.user.email
    const guestUser = useGuestUserContext();

    if (status === "loading") {
        return <Layout><div style={{display: "flex", justifyContent: "center" }}><img src="/images/Rentfreeanim.gif" /></div></Layout>
    }

    const deleteUserGames = async () => {
        const response = await deleteData("/api/usergames/all", { guestId: guestUser?.id });
        console.log("response: ", response);
    }

    if (status === "authenticated" || guestUser?.name !== "") {
        return (
            <Layout>
                <>
                    <p>Signed in as {userEmail ?? guestUser?.name}</p>
                    <Signin />
                    <br/>
                    <Button variant="contained" endIcon={<DeleteIcon sx={{ color: "secondary.light" }} />} onClick={() => deleteUserGames()} sx={{ bgcolor: "secondary.main", color: "secondary.contrastText", height: "100%" }}>
                        Reset game collection
                    </Button>
                </>
            </Layout>
        )
    }

    return (
        <Layout>
            <>
                <Signin />
            </>
        </Layout>
    )
}
