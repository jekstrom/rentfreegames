import * as React from 'react';
import { useSession } from 'next-auth/react'
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ForwardIcon from '@mui/icons-material/Forward';
import { Typography } from '@mui/material';
import { useRouter } from 'next/router';

const postData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}

export default function SessionModal() {
    const { data: session, status } = useSession();
    const [title, setTitle] = React.useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const inviteRegex = /invite\/inv--.*/
        if (title && title.startsWith("inv--")){
            router.push(`/sessions/invite/${title}`)
        } else if(title && title.match(inviteRegex)) {
            // Get the invite code from the URL
            const inviteCode = title.split("invite/")[1];
            router.push(`/sessions/invite/${inviteCode}`)
        } else if (title && status === "authenticated") {
            const response = await postData("/api/sessions", { title });
            router.push(`/sessions/${response.id}`)
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Typography align="justify" gutterBottom>
                    Name your new session, or put in the invite code to join an existing session
                </Typography>
                <Paper
                    sx={{ p: '2px 4px', display: 'flex', alignItems: 'center'}}
                >
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Session name or invite code"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        inputProps={{ 'aria-label': 'session name or invite code' }}
                    />
                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    <IconButton type="submit" color="primary" aria-label="go">
                        <ForwardIcon />
                    </IconButton>
                </Paper>
            </form>
        </div>
    );
}