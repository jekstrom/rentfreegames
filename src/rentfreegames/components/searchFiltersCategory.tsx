import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Category } from '../interfaces'

export default function SearchFiltersCategory({
    categories,
    category,
    setCategory
}: {
    categories: Category[],
    category: Category,
    setCategory:  (event: any, newValue: Category | null) => void
}) {
    const categoryProps = {
        options: categories,
        getOptionLabel: (option: Category) => option.name
    }

    return (
        <Box sx={{ paddingTop: 1, paddingRight: 1 }}>
            <Autocomplete
                {...categoryProps}
                disablePortal
                id="category"
                value={category}
                onChange={setCategory}
                sx={{ width: "100%", bgcolor: "primary.dark", color: "primary.contrastText" }}
                renderInput={(params) => <TextField {...params} label="Category" />}
            />
        </Box>
    )
}
