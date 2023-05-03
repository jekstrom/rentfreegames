import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GroupIcon from '@mui/icons-material/Group';
import MenuIcon from '@mui/icons-material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import { MeepleIcon } from './customIcons'
import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Divider, Grid, Link, Paper, Tooltip } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import * as React from 'react';
import useSWR from 'swr';
import { Session } from '../interfaces';
import { theme } from '../styles/theme';
import utilStyles from '../styles/utils.module.css';
import { useGuestUserContext, useSetGuestUserContext } from './GuestUserContext';

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function stringAvatar(name: string) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: name.indexOf(' ') > 0 ? `${name.split(' ')[0][0]}${name.split(' ')[1][0]}` : `${name[0]}`,
    };
}

export default function PrimarySearchAppBar() {
    const router = useRouter();
    const { data: userSession, status } = useSession();
    const userEmail = userSession?.user.email;

    const guestUser = useGuestUserContext();
    const setUser = useSetGuestUserContext();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
        React.useState<null | HTMLElement>(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const [drawerState, setDrawerState] = React.useState(false);

    const { data, error, isLoading } = useSWR<Session[]>(`/api/sessions${guestUser?.id ? `?guestId=${guestUser.id}` : ""}`, fetcher);

    if (error) {
        console.log("Failed to load");
    }
    if (isLoading) {
        console.log("Loading...");
    }
    if (!data) {
        return null;
    }

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const handleSessionList = (event: React.MouseEvent<HTMLElement>) => {
        setDrawerState(!drawerState);
    };

    const handleSessionsClose = () => {
        setDrawerState(false);
    };

    const handleProfile = () => {
        router.push(`/user`)
    }

    const handleGames = () => {
        router.push(`/games?myGames=true`)
    }

    const handleSignOut = () => {
        if (guestUser?.name !== "") {
            setUser({ name: '', games: [], isGuest: true });
        }
        signOut()
        router.push(`/`)
    }

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
            sx={{
                "& .MuiPaper-root": {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
        >
            <Box sx={{
            padding: 1,
            bgcolor: theme.palette.primary.dark,
            color: theme.palette.primary.contrastText
        }}>
            <MenuItem onClick={handleProfile} sx={{ padding: 1 }}>Profile</MenuItem>
            {
                userSession?.user || guestUser
                    ? <MenuItem onClick={handleSignOut} sx={{ padding: 1 }}>Sign out</MenuItem>
                    : <></>
            }

            </Box>
        </Menu>
    );

    const renderSession = (session: Session) => {
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
                                    <Tooltip title={new Date(session.created).toLocaleString()} placement="top">
                                        <AccessTimeIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} />
                                    </Tooltip>
                                    &nbsp;Started {new Date(session.created).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={4}>
                                <Typography variant="body2" component="p">
                                    <GroupIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} />&nbsp; {session.users.length} players
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={4}>
                                <Typography variant="body2" component="p">
                                    <MeepleIcon sx={{ color: theme.palette.primary.main, fontSize: 16 }} />&nbsp; {session.users.map(u => u.games.length).reduce((count, sum) => sum += count)} games
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={4}>
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
                        </Grid>
                    </Paper>
                </Grid>
            </Box>
        )
    }

    const DrawerHeader = styled('div')(({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    }));

    const drawer = (
        <Box sx={{ height: "100%", padding: 1, bgcolor: theme.palette.primary.dark, color: theme.palette.primary.contrastText }}>
            <DrawerHeader>
                <Grid container sx={{ display: "flex" }}>
                    <Grid item xs={8}>
                        <Link href="/">
                            <Image
                                priority
                                src="/images/profile.png"
                                className={utilStyles.borderCircle}
                                height={45}
                                width={45}
                                alt="rentfreegames"
                            />
                        </Link>
                    </Grid>
                    <Grid item xs={4} sx={{ display: "flex", justifyContent: "right" }}>
                        <IconButton onClick={handleSessionsClose}>
                            <ChevronLeftIcon sx={{ color: theme.palette.primary.contrastText }} />
                        </IconButton>
                    </Grid>
                </Grid>
            </DrawerHeader>
            <h3>Your Sessions</h3>
            <Divider/>
            {
                (userSession?.user || guestUser) && data && data?.length > 0
                    ? data.map((session) => renderSession(session))
                    : <></>
            }
            </Box>
    )

    const renderSessionsList = (
        <Box sx={{ width: { xs: 240, sm: 350 }, flexShrink: { sm: 0 } }}>
        <Drawer
            anchor="left"
            variant="temporary"
            open={drawerState}
            onClose={handleSessionsClose}
            ModalProps={{
                keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
        >
            {drawer}
        </Drawer>
        <Drawer
            anchor="left"
            open={drawerState}
            onClose={handleSessionsClose}
            sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 350 },
            }}
        >
            {drawer}
        </Drawer>
        </Box>
    );



    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
            sx={{
                "& .MuiPaper-root": {
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText
                  }
                }}
        >
            {
                status === "authenticated" || guestUser?.id
                    ? <MenuItem onClick={handleGames}>
                        <IconButton onClick={handleGames} size="large" color="inherit">
                            <Badge sx={{ color: theme.palette.primary.main }}>
                                <MeepleIcon/>
                            </Badge>
                        </IconButton>
                        <p>My Games</p>
                    </MenuItem>
                    : <></>
            }

            {
                status === "authenticated" || guestUser?.id
                    ? <MenuItem onClick={handleProfile}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="primary-search-account-menu"
                            aria-haspopup="true"
                            color="inherit"
                        >
                            {
                                userSession?.user?.image && userSession?.user?.image.length > 0
                                    ? <Avatar src={userSession?.user?.image} />
                                    : <Avatar {...stringAvatar(userSession?.user?.name ?? guestUser?.name ?? "User")} />
                            }
                        </IconButton>
                        <p>Profile</p>
                    </MenuItem>
                    : <></>
            }
        </Menu>
    );

    return (
        <Box sx={{ flexGrow: 1, width: "100%" }}>
            <AppBar position="static" sx={{ bgcolor: theme.palette.primary.dark }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleSessionList}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: "right" }}>
                        {
                            status === "authenticated" || guestUser?.id
                                ? <MenuItem onClick={handleGames}>
                                    <IconButton size="large" aria-label="my-games" color="inherit">
                                        <Badge sx={{ color: theme.palette.primary.main }}>
                                            <MeepleIcon/>
                                        </Badge>
                                    </IconButton>
                                    <p>My Games</p>
                                </MenuItem>
                                : <></>
                        }

                    </Box>
                    {
                        status === "authenticated" || guestUser?.id
                            ? <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                                <Grid container>
                                    <Grid item xs={12} sm={12} container direction="row" sx={{ justifyContent: "right" }}>
                                        <Typography>
                                            {
                                                userSession?.user?.name ?? guestUser?.name ?? "User"
                                            }
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={12} container direction="row" sx={{ justifyContent: "right" }}>
                                        <Typography variant='subtitle2' sx={{ color: theme.palette.primary.light }}>
                                            {
                                                !userSession?.user?.name ? "Guest" : ""
                                            }
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <IconButton
                                    size="large"
                                    edge="end"
                                    aria-label="account of current user"
                                    aria-controls={menuId}
                                    aria-haspopup="true"
                                    onClick={handleProfileMenuOpen}
                                    color="inherit"
                                >
                                    {
                                        userSession?.user?.image && userSession?.user?.image.length > 0
                                            ? <Avatar src={userSession?.user?.image} />
                                            : <Avatar {...stringAvatar(userSession?.user?.name ?? guestUser?.name ?? "User")} />
                                    }
                                </IconButton>
                            </Box>
                            : <></>
                    }

                    {
                        status === "authenticated" || guestUser?.id
                            ? <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                                <IconButton
                                    size="large"
                                    aria-label="show more"
                                    aria-controls={mobileMenuId}
                                    aria-haspopup="true"
                                    onClick={handleMobileMenuOpen}
                                    color="inherit"
                                >
                                    <MoreIcon />
                                </IconButton>
                            </Box>
                            : <></>
                    }

                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}
            {renderSessionsList}
        </Box>
    );
}
