import { Grid, Button, Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import * as React from 'react';
import { User, GuestUser } from '../interfaces';
import utilStyles from '../styles/utils.module.css';
import { theme } from '../styles/theme';
import AvatarGroup from '@mui/material/AvatarGroup';

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
        children: name.indexOf(' ') > 0 ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}` : `${name[0]}`,
    };
}

export default function PlayerList({
    players,
    user,
    host
}: {
    players: (User | GuestUser)[],
    user: User | GuestUser,
    host: User | GuestUser
}) {
    const [playerState, setPlayerState] = React.useState(true)

    return (
        <div>
            <article>
                <h2 className={utilStyles.headingMd}>
                    {
                        players?.length === 1 && players[0].id === user.id
                        ? "Invite your friends to join the game!"
                        : `${players?.length} ${players?.length === 1 ? "Player" : "Players"}`
                    }
                </h2>
                {
                    players?.length > 1 
                    ? <Button onClick={() => setPlayerState(!playerState)}><sub>{playerState ? "show" : "hide"}</sub></Button>
                    : <></>
                }
                
            </article>
            {
                players?.length > 1 && playerState
                    ? <Grid container spacing={1}>
                        <Grid item>
                            <AvatarGroup max={5}>
                                {
                                    players.length > 1
                                        ? players?.map(({ image, id, name }) => (
                                            <Tooltip title={name} key={id}>
                                                {
                                                    image && image.length > 0
                                                        ? <Avatar src={image} />
                                                        : <Avatar {...stringAvatar(name ?? id)} />
                                                }
                                            </Tooltip>
                                        ))
                                        : <></>
                                }
                            </AvatarGroup>
                        </Grid>
                    </Grid>
                    : <List
                        sx={{ maxWidth: '20rem', bgcolor: 'background.paper' }}
                        aria-label="players"
                    >
                        {players?.map(({ image, id, name }) => (
                            <ListItem disableGutters key={id} role={undefined} sx={{ padding: '0' }}>
                                <ListItemText
                                    sx={
                                        host.id === id
                                            ? { background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`, color: 'primary.contrastText', p: 2 }
                                            : { bgcolor: 'secondary.light', color: 'secondary.contrastText', p: 2 }
                                    }
                                    primary={
                                        <React.Fragment>
                                            <Grid container spacing={1}>
                                                <Grid item>
                                                    {
                                                        image && image.length > 0
                                                            ? <Avatar src={image} />
                                                            : <Avatar {...stringAvatar(name ?? id)} />
                                                    }
                                                </Grid>
                                                <Grid item style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    {name ?? id}
                                                </Grid>
                                            </Grid>
                                        </React.Fragment>
                                    }
                                    secondary={host.id === id ? 'Host' : ''}
                                />
                            </ListItem>
                        ))}
                    </List>
            }
        </div>
    )
}
