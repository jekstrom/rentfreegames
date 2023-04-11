import { Grid, ListItemButton } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import * as React from 'react';
import { User } from '../interfaces';
import utilStyles from '../styles/utils.module.css';

function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name: string) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
}

export default function PlayerList({
    players,
    userEmail,
}: {
    players: User[],
    userEmail: string
}) {
    return (
        <div>
            <article>
                <h2 className={utilStyles.headingMd}>Players</h2>
            </article>
            <List
                sx={{ width: '100%', bgcolor: 'background.paper' }}
                aria-label="players"
            >
                {players?.map(({ email, name }) => (
                    <ListItem disablePadding key={email}>
                        <ListItemButton role={undefined}>
                            <ListItemText
                                sx={
                                    email === userEmail
                                        ? { bgcolor: 'primary.main', color: 'primary.contrastText', p: 2 }
                                        : { bgcolor: 'secondary.main', color: 'primary.contrastText', p: 2 }
                                }
                                primary={
                                    <React.Fragment>
                                        <Grid container spacing={2}>
                                            <Grid item>
                                                <Avatar {...stringAvatar(name)} />
                                            </Grid>
                                            <Grid item>
                                                {name}
                                            </Grid>
                                        </Grid>
                                    </React.Fragment>
                                }
                                secondary="Host" // todo: determine host
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}
