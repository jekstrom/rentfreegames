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
    setCategory: (category: Category) => void
}) {
    const categoryProps = {
        options: categories,
        getOptionLabel: (option: Category) => option.name
    }

    return (
        <Box sx={{ padding: 1 }}>
            <Autocomplete
                {...categoryProps}
                disablePortal
                id="category"
                value={category}
                onChange={(event: any, newValue: Category | null) => {
                    setCategory(newValue);
                }}
                sx={{ width: "100%" }}
                renderInput={(params) => <TextField {...params} label="Category" />}
            />
        </Box>
    )
}
