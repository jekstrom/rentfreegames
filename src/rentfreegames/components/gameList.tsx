import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { Link, ListItemButton } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Game } from '../interfaces';
import utilStyles from '../styles/utils.module.css';

export default function GamesList({
    games,
  }: {
    games: Game[]
  }) {
    return (
        <div>
            <article>
                <h2 className={utilStyles.headingXl}>Games</h2>
            </article>
            <List
                sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                aria-label="players"
            >
                {!games || games?.map(({ BGGId, Name, Rank, owned, ownedBy }) => (
                    <ListItem disablePadding key={BGGId}>
                        <ListItemButton role={undefined}>
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
                            <ListItemText primary={ownedBy} />
                        </ListItemButton>
                        <ListItemIcon>
                                {
                                    owned ? <StarIcon sx={{ color: 'secondary.light', p: 0 }} /> : <StarOutlineIcon sx={{ color: 'primary.main', p: 0 }} />
                                }
                        </ListItemIcon>
                        <Link href={`/games/${BGGId}`}><ArrowForwardIcon /></Link>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}


