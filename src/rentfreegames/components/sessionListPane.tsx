import { Grid, Paper, Typography, Box, Link } from "@mui/material"
import dayjs from "dayjs"
import { theme } from "../styles/theme"
import { MeepleIcon } from "./customIcons"
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { GuestUser, Session, User } from "../interfaces"

export default function SessionListPane({ session, guestUser, userSession }: { session: Session, guestUser?: GuestUser, userSession?: any }) {
    return (
        <Box key={session.id} sx={{ width: "100%", padding: "5px", color: theme.palette.primary.contrastText }}>
            <Grid key={session.id} item xs={12} sm={12} md={12}>
                <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: "100%", bgcolor: theme.palette.background.paper, color: theme.palette.primary.contrastText }}>
                    <Grid container>
                        <Grid item xs={12} sm={12} md={12}>
                            <Typography variant="h5" component="div">
                                <Link href={`/sessions/${session.id}${guestUser?.id ? `?guestId=${guestUser.id}` : ""}`} sx={{ color: theme.palette.secondary.light }}>{session.title}</Link>
                            </Typography>
                            <Typography variant="caption" component="p" sx={{ color: "primary.light" }}>
                                <Grid container>
                                    <Grid item xs={12} sm={12} md={6}>
                                        <AccessTimeIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} />
                                        &nbsp;
                                        {
                                            session.startDate && dayjs(session.startDate)?.isAfter(new Date()) 
                                            ? "Starting"
                                            : "Started"
                                        }
                                        &nbsp;{new Date(session.startDate?.toString() ?? session.created).toLocaleDateString()}&nbsp;
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={12} md={6}>
                                        <AccessTimeIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} />&nbsp;
                                        {
                                            session.expireDate && dayjs(session.expireDate)?.isAfter(new Date()) 
                                            ? "Ending"
                                            : "Ended"
                                        }
                                        {
                                            session.expireDate && <>
                                            &nbsp;{new Date(session.expireDate?.toString()).toLocaleDateString()}</>
                                        }
                                    </Grid>

                                    <Grid item xs={12} sm={12} md={12}>
                                        {
                                            session.location && <><LocationOnIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} />
                                            &nbsp;{session.location}</>
                                        }
                                    </Grid>
                                </Grid>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6}>
                            <Typography variant="body2" component="p">
                                <GroupIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} />&nbsp; {session.users.length} players
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={12} md={6}>
                            <Typography variant="body2" component="p">
                                <PersonIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} />
                                &nbsp;Hosted by&nbsp;
                                {
                                    session.createdBy.name === userSession?.user?.name
                                        ? "you"
                                        : session.createdBy.name
                                }
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={12} md={12}>
                            <Typography variant="body2" component="p">
                                <MeepleIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} />&nbsp; {session.numGames} games
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Box>
    )
}