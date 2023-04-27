import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function SearchFiltersOwned({
    owned,
    setOwned
}: {
    owned: boolean,
    setOwned: (event: any) => void
}) {
    return (
        <Box sx={{ padding: 1 }}>
            <FormControlLabel sx={{ width: "100%" }} control={<Checkbox checked={owned} onChange={setOwned} color="primary" />} label="My games" />
        </Box>
    )
}
