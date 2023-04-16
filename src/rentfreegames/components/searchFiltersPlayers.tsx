import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ReactNode } from 'react';

export default function SearchFiltersPlayers({
    player,
    setPlayers
}: {
    player?: number,
    setPlayers: (event: SelectChangeEvent<number>, child: ReactNode) => void
}) {
    return (
        <Box sx={{ padding: 0 }}>
            <FormControl sx={{ width: "100%" }}>
                <InputLabel id="players">Players</InputLabel>
                <Select
                    labelId="players"
                    id="players"
                    value={player}
                    label="Players"
                    onChange={setPlayers}
                >
                    <MenuItem value={undefined}>Any</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                    <MenuItem value={7}>7</MenuItem>
                    <MenuItem value={8}>8</MenuItem>
                    <MenuItem value={9}>9</MenuItem>
                    <MenuItem value={10}>10+</MenuItem>
                </Select>
            </FormControl>
        </Box>
    )
}
