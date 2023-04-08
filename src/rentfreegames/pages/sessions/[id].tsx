import Layout from '../../components/layout'
import { getAllSessionIds, getSessionData } from '../../lib/sessions'
import Head from 'next/head'
import Date from '../../components/date'
import utilStyles from '../../styles/utils.module.css'
import { GetStaticProps, GetStaticPaths } from 'next'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import React from 'react'

export default function Post({
    sessionData
}: {
    sessionData: {
        title: string,
        games: [any]
    }
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
                <title>{sessionData.title}</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{sessionData.title}</h1>
            </article>
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                aria-label="games"
            >
                {sessionData.games.map(({ BGGId, Name, Rank }, index) => (
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

export const getStaticPaths: GetStaticPaths = async () => {
    const paths = getAllSessionIds()
    return {
        paths,
        fallback: false
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const sessionData = await getSessionData(params?.id as string)
    return {
        props: {
            sessionData
        }
    }
}