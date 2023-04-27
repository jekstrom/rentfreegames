import * as React from 'react';
import { useSession } from 'next-auth/react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

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
    const userEmail = session?.user.email;
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState("");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (e) => {
        setOpen(false);
        e.preventDefault();
        if (status === "authenticated") {
            const response = await postData("/api/sessions", { title });
            console.log(response);
        }
    };

    return (
        <div>
            <Button variant="outlined" onClick={handleClickOpen}>
                Start new game session
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Start Session</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Name your session, then share the invite link with your friends
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Name"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                            variant="standard"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" color="primary">Create</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </div>
    );
}