import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ReactNode } from 'react';

function getItems(isSearch?: boolean) {
    let items = [];
    if (!isSearch) {
        items.push(<MenuItem key="players" value={"players"}>Players</MenuItem>);    
    }
    items.push(<MenuItem key="any" value={"any"}>Any</MenuItem>);    
    for (let i = 2; i < 10; i++) {
        items.push(<MenuItem key={i.toString()} value={i.toString()}>{i}</MenuItem>);
    }
    items.push(<MenuItem key="10" value={"10"}>10+</MenuItem>);
    return items;
}

export default function SearchFiltersPlayers({
    player,
    setPlayers,
    isSearch
}: {
    player?: string,
    setPlayers: (event: SelectChangeEvent<string>, child: ReactNode) => void,
    isSearch?: boolean
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
                    {
                        getItems(isSearch)
                    }
                </Select>
            </FormControl>
        </Box>
    )
}
