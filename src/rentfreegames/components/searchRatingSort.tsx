import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { FormControl, FormLabel, RadioGroup, Radio } from '@mui/material';

export default function SearchSortRating({
    label,
    ratingSort,
    setRating
}: {
    label: string
    ratingSort: string,
    setRating: (event: any) => void
}) {
    return (
        <Box sx={{ padding: 1 }}>
            <FormControl>
                <FormLabel id="sort-rating-radios">{label}</FormLabel>
                    <RadioGroup
                        aria-labelledby="sort-rating-radios"
                        name="sort-rating-radios"
                        key="sort-rating-radios"
                        value={ratingSort}
                        onChange={setRating}
                    >
                        <FormControlLabel value="none" control={<Radio />} label="none" />
                        <FormControlLabel value="user" control={<Radio />} label="Your ratings" />
                        <FormControlLabel value="avg" control={<Radio />} label="Average ratings" />
                    </RadioGroup>
                </FormControl>
        </Box>
    )
}
