import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import utilStyles from '../../styles/utils.module.css'
import Link from 'next/link'
import Search from '../../components/search'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Typography from '@mui/material/Typography'
import React from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { Game } from '../../interfaces'

const postData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}

const deleteData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'DELETE',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Games() {
    const { data, error, isLoading } = useSWR<Game[]>('/api/games', fetcher);

    const { data: session, status } = useSession();
    const userEmail = session?.user.email;
    const [allGames, starGame] = React.useState([]);

    if (error) {
        console.log("Failed to load");
        return <div>Failed to load</div>
    }
    if (isLoading) {
        console.log("Loading...");
        return <div>Loading...</div>
    }
    if (!data) {
        console.log("data: ", data);
        return null;
    }

    const handleToggle = (bggId: string) => async () => {
        const currentGames = allGames.length === 0 ? data : [...allGames];
        const selectedGame = currentGames.find(g => g.BGGId === bggId);

        if (!selectedGame.owned) {
            selectedGame.owned = true;
            if (status === "authenticated") {
                const response = await postData("/api/usergames", { userEmail, bggId });
                console.log(response);
            }
        } else {
            selectedGame.owned = false;
            if (status === "authenticated") {
                const response = await deleteData("/api/usergames", { userEmail, bggId });
                console.log(response);
            }
        }

        starGame(currentGames);
    };

    return (
        <Layout>
            <Head>
                <title>{siteTitle}</title>
            </Head>
            <section className={utilStyles.headingMd}>
                <p>All Games</p>
                <div>
                    length {data?.length}
                </div>
                <Search />
            </section>
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                aria-label="games"
            >
                {!data || data?.map(({ BGGId, Name, Rank, owned }) => (
                    <ListItem disablePadding key={BGGId}>
                        <ListItemButton role={undefined} onClick={handleToggle(BGGId)}>
                            <ListItemText
                                primary={Name}
                                secondary={
                                    <React.Fragment>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Rank:
                                        </Typography>
                                        {Rank}
                                    </React.Fragment>
                                }
                            />

                            <ListItemIcon>
                            {
                                    owned ? <StarIcon sx={{ color: 'secondary.light', p: 0 }} /> : <StarOutlineIcon sx={{ color: 'primary.main', p: 0 }} />
                                }
                            </ListItemIcon>
                        </ListItemButton>
                        <Link href={`/games/${BGGId}`}><ArrowForwardIcon /></Link>
                    </ListItem>
                ))}
            </List>
        </Layout>
    )
}
