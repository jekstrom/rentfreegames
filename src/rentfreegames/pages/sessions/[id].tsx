import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Divider, Grid, IconButton, InputBase, Link, Paper, SelectChangeEvent, TextField, Tooltip, Typography } from '@mui/material'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ReactNode } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { useGuestUserContext } from '../../components/GuestUserContext'
import GameSessionResults from '../../components/gameSessionResults'
import Layout from '../../components/layout'
import PlayerList from '../../components/playersList'
import Search from '../../components/search'
import SearchFiltersCategory from '../../components/searchFiltersCategory'
import SearchFiltersMechanic from '../../components/searchFiltersMechanic'
import SearchFiltersOwned from '../../components/searchFiltersOwned'
import SearchFiltersPlayers from '../../components/searchFiltersPlayers'
import SearchSortRating from '../../components/searchRatingSort'
import SessionSwiping from '../../components/sessionSwiping'
import { Category, Mechanic, ResponseError, Session, User, GameRating } from '../../interfaces'
import utilStyles from '../../styles/utils.module.css'
import SessionSwipingResults from '../../components/sessionSwipingResults'
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimeField } from '@mui/x-date-pickers/TimeField';
import dayjs from 'dayjs'
import { DebounceInput } from 'react-debounce-input'
import GoogleIcon from '@mui/icons-material/Google';
import utc from 'dayjs/plugin/utc'
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const patchData = async (url: string, data: any) => {
    const response = await fetch(url, {
        method: 'PATCH',
        mode: 'cors',
        body: JSON.stringify(data)
    });

    const json = await response.json();
    return json
}


export function getSession(id: string, guestId?: string) {
    let url = (id ? `/api/sessions/${id}` : null)
    if (url && guestId) {
        url += `?guestId=${guestId}`
    }
    const { data, error, isLoading, isValidating } = useSWR<
        { gameSession: Session, sessionUser: User, categories: Category[], mechanics: Mechanic[], userGameRatings: GameRating[], avgUserGameRatings: GameRating[] },
        ResponseError
    >(() => url, fetcher)

    return {
        data,
        isLoading,
        error,
        isValidating,
        url
    }
}

export default function SessionDetails() {
    const [category, changeCategory] = React.useState(null);
    const [mechanic, changeMechanic] = React.useState(null);
    const [playerCount, setPlayers] = React.useState("players");
    const [queryValue, setQueryValue] = React.useState('')
    const [owned, setOwned] = React.useState(false)
    const [ratingSort, setRating] = React.useState("none")
    const guestUser = useGuestUserContext();
    const [open, setOpen] = React.useState(false);
    const [details, setDetails] = React.useState(true);
    
    const { query } = useRouter()
    const { data, error, isLoading, isValidating } = getSession(query?.id as string, guestUser?.id)
    const { mutate } = useSWRConfig()
    
    if (error) {
        console.log("Failed to load session");
        return <Layout><div>Failed to load</div></Layout>
    }
    if (isLoading) {
        console.log("Loading...");
        return <Layout><div style={{display: "flex", justifyContent: "center" }}><img src="/images/Rentfreeanim.gif" /></div></Layout>
    }
    if (!data) {
        return null;
    }

    const onQueryChange = (event) => {
        setQueryValue(event.target.value);
    };

    const handleChangePlayers = (event: SelectChangeEvent<string>, child: ReactNode) => {
        setPlayers(event.target.value);
    };

    const onChangeCategory = (event: any, newValue: Category | null) => {
        console.log("onChangeCategory", newValue);
        changeCategory(newValue);
    };

    const onOwnedChange = (event) => {
        setOwned(event.target.checked);
    };

    const onRatingSortChange = (event) => {
        setRating(event.target.value);
    };

    const copy = () => {
        setOpen(true);
        navigator.clipboard.writeText(new URL(`sessions/invite/${data?.gameSession?.inviteId}`, window.location.origin).href);
        setTimeout(() => setOpen(false), 1500);
    }

    const updateStartDate = async (date: dayjs.Dayjs) => {
        if (data?.gameSession?.createdBy?.id === data?.sessionUser?.id) {
            let url = `/api/sessions/${data.gameSession.id}`
            if (guestUser?.id) {
                url += `?guestId=${guestUser.id}`;
            }

            await mutate(url, {
                ...data,
            gameSession: {...data.gameSession, startDate: date}
            }, { revalidate: false });

            await patchData(url, { startDate: date });
        }
    }

    const updateStartTime = async (time: dayjs.Dayjs) => {
        if (data?.gameSession?.createdBy?.id === data?.sessionUser?.id) {
            let url = `/api/sessions/${data.gameSession.id}`
            if (guestUser?.id) {
                url += `?guestId=${guestUser.id}`;
            }

            await mutate(url, {
                ...data,
            gameSession: {...data.gameSession, startTime: time}
            }, { revalidate: false });

            await patchData(url, { startTime: time });
        }
    }

    const updateEndDate = async (date: dayjs.Dayjs) => {
        if (data?.gameSession?.createdBy?.id === data?.sessionUser?.id) {
            let url = `/api/sessions/${data.gameSession.id}`
            if (guestUser?.id) {
                url += `?guestId=${guestUser.id}`;
            }

            await mutate(url, {
                ...data,
            gameSession: {...data.gameSession, expireDate: date}
            }, { revalidate: false });

            await patchData(url, { endDate: date });
        }
    }

    const updateLocation = async (location: string) => {
        if (data?.gameSession?.createdBy?.id === data?.sessionUser?.id) {
            let url = `/api/sessions/${data.gameSession.id}`
            if (guestUser?.id) {
                url += `?guestId=${guestUser.id}`;
            }

            await mutate(url, {
                ...data,
            gameSession: {...data.gameSession, location: location}
            }, { revalidate: false });

            await patchData(url, { location });
        }
    }

    const GoogleCalendarLink = () => {
        const root = "https://calendar.google.com/calendar/render?action=TEMPLATE&dates=";
        dayjs.extend(utc)
        const startDateString = dayjs(data?.gameSession?.startDate).toISOString().replaceAll("-", "").replaceAll(":", "").split("T")[0];
        const startTime = dayjs(data?.gameSession?.startTime).utc().format("HHmm");
        const endTime = dayjs(data?.gameSession?.startTime).add(3, 'hour').utc().format("HHmm");
        const expireDateString = dayjs(data?.gameSession?.expireDate).toISOString().replaceAll("-", "").replaceAll(":", "").split("T")[0];
        const location = data?.gameSession?.location;
        const title = data?.gameSession?.title;

        return (<Link target="_blank" 
            href={`${root}${startDateString}T${startTime}00Z%2f${startDateString}T${endTime}00Z&details=RFG Game Session&location=${location}&text=${title}`}> 
            <GoogleIcon /> Google
        </Link>)
    }

    const OutlookCalendarLink = () => {
        const root = "https://outlook.live.com/calendar/0/deeplink/compose?allday=false&"
        dayjs.extend(utc)
        const startDateString = encodeURIComponent(dayjs(data?.gameSession?.startDate).toISOString().split("T")[0]);
        const startTime = encodeURIComponent(dayjs(data?.gameSession?.startTime).utc().format("HH:mm:00Z"));
        const endTime = encodeURIComponent(dayjs(data?.gameSession?.startTime).add(3, 'hour').utc().format("HH:mm:00Z"));
        const location = data?.gameSession?.location;
        const title = data?.gameSession?.title;

        return (
            <Link target="_blank" 
            href={`${root}body=RFG Game Session&enddt=${startDateString}T${endTime}&location=${location}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent&startdt=${startDateString}T${endTime}&subject=${title}`}> 
            <AlternateEmailIcon /> Outlook
        </Link>
        )
    }

    return (
        <Layout>
            <Head>
                <title>{data?.gameSession?.title} - RFG</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>
                    <IconButton onClick={() => setDetails(!details)}> <MenuIcon /> </IconButton>
                    &nbsp;{data.gameSession.title}
                </h1>
            </article>
            {
                details && <Paper sx={{ padding: 2, marginBottom: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={4}>
                            <Typography align="justify" gutterBottom>
                                Date of the event
                            </Typography>
                            <DatePicker disablePast readOnly={data?.gameSession?.createdBy?.id !== data?.sessionUser?.id} maxDate={dayjs(data?.gameSession?.expireDate) ?? null} value={dayjs(data?.gameSession.startDate) ?? null} onChange={async (event) => await updateStartDate(event)}  />
                        </Grid>
                        <Grid item xs={12} sm={12} md={4}>
                            <Typography align="justify" gutterBottom>
                                Starting time
                            </Typography>
                            <TimeField readOnly={data?.gameSession?.createdBy?.id !== data?.sessionUser?.id} value={dayjs(data?.gameSession?.startTime) ?? null} onChange={async (event) => await updateStartTime(event)}/>
                        </Grid>                        
                        <Grid item xs={12} sm={12} md={4}>
                            <Typography align="justify" gutterBottom>
                                Expire date
                            </Typography>
                            <DatePicker disablePast readOnly={data?.gameSession?.createdBy?.id !== data?.sessionUser?.id} minDate={dayjs(data?.gameSession.startDate) ?? null} maxDate={dayjs(new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000))} value={dayjs(data?.gameSession?.expireDate) ?? null} onChange={updateEndDate} />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12}>
                            <Paper
                                elevation={5}
                                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
                            >
                                <DebounceInput
                                    element={InputBase}
                                    id="outlined-location"
                                    type="input"
                                    value={data?.gameSession?.location ?? ""}
                                    sx={{ flex: 1, padding: 1, border: 0 }}
                                    debounceTimeout={800}
                                    readOnly={data?.gameSession?.createdBy?.id !== data?.sessionUser?.id}
                                    onChange={(e) => updateLocation(e.target.value)} />
                                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                                <Tooltip title="Go to Google Maps" arrow>
                                    <IconButton type="button" color="primary" aria-label="location" onClick={() => window.open("https://maps.google.com", "_blank")}>
                                        <LocationOnIcon />
                                    </IconButton>
                                </Tooltip>
                            </Paper>
                        </Grid>
                        <Grid item container spacing={2} xs={12} sm={12} md={12}>
                            <Grid item>
                                <Typography align="justify" gutterBottom>
                                    Add to your calendar
                                </Typography>
                            </Grid>
                            <Grid item>
                                <GoogleCalendarLink />
                            </Grid>
                            <Grid item>
                                <OutlookCalendarLink />
                            </Grid>
                        </Grid>
                    </Grid>
                </Paper>
            }
            {
                data?.gameSession?.createdBy?.id === data?.sessionUser?.id
                    ? <section className={utilStyles.headingMd}>
                        <Typography align="justify" gutterBottom>
                            Share this invite code with your friends to invite them to this session
                        </Typography>
                        <Paper
                            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
                        >
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                value={data?.gameSession.inviteId}
                                readOnly
                                inputProps={{ 'aria-label': 'invite code' }}
                            />
                            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                            <IconButton type="button" color="primary" aria-label="copy" onClick={copy}>
                                <Tooltip title="Copied" arrow open={open} disableFocusListener disableHoverListener disableTouchListener>
                                    <ContentCopyIcon />
                                </Tooltip>
                            </IconButton>
                        </Paper>
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="horizontal" />
                    </section>
                    : <></>
            }
            <section>
                <Grid container columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={12} sm={12} md={12}>
                        <Search queryValue={queryValue} setQueryValue={onQueryChange} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={3}>
                        <SearchFiltersCategory categories={data.categories} category={category} setCategory={onChangeCategory} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={3}>
                        <SearchFiltersMechanic mechanics={data.mechanics} mechanic={mechanic} setMechanic={changeMechanic} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={3} style={{ padding: "10px" }}>
                        <SearchFiltersPlayers player={playerCount} setPlayers={handleChangePlayers} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={3} style={{ padding: "10px" }}>
                        <SearchFiltersOwned owned={owned} setOwned={onOwnedChange} />
                    </Grid>
                    
                </Grid>
                <Grid container columns={{ xs: 12, sm: 12, md: 12 }}>
                    <Grid item xs={12} sm={12} md={12}>
                        <SearchSortRating ratingSort={ratingSort} setRating={onRatingSortChange} label="Sort by" />
                    </Grid>
                </Grid>
            </section>

            <PlayerList players={data?.gameSession?.users} user={data.sessionUser} host={data?.gameSession?.createdBy} />
            
            <SessionSwiping />

            <SessionSwipingResults id={query?.id as string} query={queryValue} playerCount={playerCount} mechanic={mechanic} category={category} owned={owned} ratingSort={ratingSort} title={"Matches"} />
            
            <GameSessionResults id={query?.id as string} query={queryValue} playerCount={playerCount} mechanic={mechanic} category={category} owned={owned} ratingSort={ratingSort} title={"Games"} />
        </Layout>
    )
}
