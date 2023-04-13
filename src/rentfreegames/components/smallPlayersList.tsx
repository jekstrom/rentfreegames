import { Grid } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import * as React from 'react';
import { Owner } from '../interfaces';

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
        children: name.indexOf(' ') > 0 ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}` : `${name[0]}${name.split('@')[1][0]}`,
    };
}

export default function SmallPlayerList({
    players,
}: {
    players: Owner[]
}) {
    return (
        <div>
            {players?.map(({ email, name }) => (
                <Grid container spacing={1} paddingBottom={1}>
                    <Grid item>
                        <Avatar {...stringAvatar(name ?? email)} />
                    </Grid>
                    <Grid item style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {name ?? email}
                    </Grid>
                </Grid>
            ))}
        </div>
    )
}
