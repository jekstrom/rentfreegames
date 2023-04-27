import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Mechanic } from '../interfaces'

export default function SearchFiltersMechanic({
    mechanics,
    mechanic,
    setMechanic
}: {
    mechanics: Mechanic[],
    mechanic: Mechanic,
    setMechanic: (mechanic: Mechanic) => void
}) {
    const mechanicProps = {
        options: mechanics,
        getOptionLabel: (option: Mechanic) => option.name
    }

    return (
        <Box sx={{ paddingTop: 1, paddingRight: 1 }}>
            <Autocomplete
                {...mechanicProps}
                disablePortal
                id="mechanic"
                value={mechanic}
                onChange={(event: any, newValue: Mechanic | null) => {
                    setMechanic(newValue);
                }}
                sx={{ width: "100%" }}
                renderInput={(params) => <TextField {...params} label="Mechanic" />}
            />
        </Box>
    )
}
