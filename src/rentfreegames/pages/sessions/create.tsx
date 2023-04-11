import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import utilStyles from '../../styles/utils.module.css'
import { useState } from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import Grid from '@mui/material/Grid';

export default function CreateSession() {
    const [title, setTitle] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Title: ${title}`);
        // handle form submission logic here
    };

    return (
        <Layout>
            <Head>
                <title>{siteTitle}</title>
            </Head>
            <form onSubmit={handleSubmit}>
                <h2>Create a Session</h2>
                <Grid container direction="column" spacing={2}>
                    <Grid item>
                        <TextField
                            label="Title"
                            variant="outlined"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            endIcon={<PlaylistAddIcon />}
                        >
                            Create
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Layout>
    );
}
