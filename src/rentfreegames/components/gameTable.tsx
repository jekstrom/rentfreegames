import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Game } from '../interfaces';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import Image from 'next/image'
import SmallPlayerList from './smallPlayersList';

function Row({
    row,
  }: {
    row: Game
  }) {
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell align="right">
                        <Image
                                    alt={`${row.Name} art`}
                                    src={row.ImagePath}
                                    width={100}
                                    height={100}
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        marginRight: "10px"
                                    }}
                                />
                </TableCell>
                <TableCell component="th" scope="row">
                    {row.Name}
                </TableCell>
                <TableCell align="right">{row.Rank}</TableCell>
                <TableCell align="right">{row.MinPlayers} - {row.MaxPlayers}</TableCell>
                <TableCell align="right">{row.GameWeight}</TableCell>
                <TableCell align="right">{row.MfgPlaytime}</TableCell>
                <TableCell align="right">{row.owned ? <StarIcon sx={{ color: 'secondary.light', p: 0 }} /> : <StarOutlineIcon sx={{ color: 'primary.main', p: 0 }} />}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 3 }}>
                            <Typography gutterBottom component="div">
                                Who has it
                            </Typography>
                            <SmallPlayerList players={row.ownedBy} />
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

export default function GameTable({
    games,
    title
}: {
    games: Game[],
    title: string
}) {
    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={3}><Typography variant="h6">{title}</Typography></TableCell>
                        <TableCell align="right">Rank</TableCell>
                        <TableCell align="right">Players</TableCell>
                        <TableCell align="right">Weight</TableCell>
                        <TableCell align="right">Playtime&nbsp;(mins)</TableCell>
                        <TableCell align="right">Owned</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {games.map((row) => (
                        <Row key={row.Name} row={row} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}


