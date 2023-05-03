import Layout from '../../components/layout'
import { useSession, signIn, signOut } from "next-auth/react"
import { useGuestUserContext } from '../../components/GuestUserContext';
import Signin from '../../components/signin';

export default function User() {
    const { data: session, status } = useSession()
    const userEmail = session?.user.email
    const guestUser = useGuestUserContext();

    if (status === "loading") {
        return <p>Hang on there...</p>
    }

    if (status === "authenticated" || guestUser?.name !== "") {
        return (
            <Layout>
                <>
                    <p>Signed in as {userEmail ?? guestUser?.name}</p>
                    <Signin />
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
