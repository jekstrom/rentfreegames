import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function SearchFiltersPlayersSlider({
    players,
    changePlayerCount
}: {
    players: number[],
    changePlayerCount: any
}) {

    return (
        <Box  sx={{ width: 300 }}>
           <Slider
                value={players}
                onChange={changePlayerCount}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
                disableSwap
            />
        </Box>
    )
}
