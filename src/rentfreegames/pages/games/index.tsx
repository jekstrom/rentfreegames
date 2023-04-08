import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import utilStyles from '../../styles/utils.module.css'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import { getSortedGamesData } from '../../lib/games'
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

export default function Games({
    allGamesData,
    page
}: {
    allGamesData: {
        BGGId: number
        Name: string
        Rank: number
    }[],
    page: number
}) {
    const [starred, setStarred] = React.useState([-1]);

    const handleToggle = (value: number) => () => {
        const currentIndex = starred.indexOf(value);
        const newStarred = [...starred];

        if (currentIndex === -1) {
            newStarred.push(value);
        } else {
            newStarred.splice(currentIndex, 1);
        }

        setStarred(newStarred);
    };

    return (
        <Layout>
            <Head>
                <title>{siteTitle}</title>
            </Head>
            <section className={utilStyles.headingMd}>
                <p>All Games</p>
                <Search />
            </section>
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                aria-label="games"
            >
                {allGamesData.map(({ BGGId, Name, Rank }, index) => (
                    <ListItem disablePadding key={BGGId}>
                        <ListItemButton role={undefined} onClick={handleToggle(index)}>
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
                                    starred.indexOf(index) !== -1 ? <StarIcon/> : <StarOutlineIcon/>
                                }
                            </ListItemIcon>
                        </ListItemButton>
                        <Link href={`/games/${BGGId}`}><ArrowForwardIcon/></Link>
                    </ListItem>
                ))}
            </List>
        </Layout>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const allGamesData = await getSortedGamesData();
    return {
        props: {
            allGamesData
        }
    }
}