import ForwardIcon from '@mui/icons-material/Forward';
import { Button } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import * as React from 'react';
import useSWR from 'swr';
import { ResponseError, User } from '../interfaces';
import { useGuestUserContext } from './GuestUserContext';

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function getUserGames(guestId?: string) {
    let url = "/api/users";
    if (url && guestId) {
        url += `?guestId=${guestId}`;
    }
    const { data, error, isLoading, isValidating } = useSWR<
        { message: string, user: User },
        ResponseError
    >(() => url, fetcher)

    return {
        data,
        isLoading,
        error,
        isValidating,
        url
    }
}


export default function UserGames() {
    const router = useRouter();

    const { data: userSession, status } = useSession();
    const userEmail = userSession?.user.email;

    const guestUser = useGuestUserContext();

    const { data, error, isLoading, isValidating, url } = getUserGames(guestUser?.id);

    if (error) {
        console.log("Failed to load user");
        return <div>Failed to load</div>
    }
    if (isLoading) {
        return <CircularProgress />
    }
    if (!data) {
        return null;
    }

    const myGames = () => {
        router.push(`/games?myGames=true`)
    }

    return (
        <div>
            {
                (status === "authenticated" || guestUser?.id) && data && data.user.games?.length > 0
                    ? <Grid item>
                        <Button onClick={myGames}><ForwardIcon sx={{ marginRight: 1, color: "secondary.light" }} /> My games ({data.user.games?.length ?? 0})</Button>
                    </Grid>
                    : <></>
            }

        </div>
    );
}