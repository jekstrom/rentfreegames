import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { DebounceInput } from 'react-debounce-input';


export default function Search({
  queryValue,
  setQueryValue,
}: {
  queryValue: string,
  setQueryValue: (event: any) => void
}) {
  return (
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { marginTop: 1, width: '100%' },
        }}
      >
        <DebounceInput
          element={TextField}
          id="outlined-search"
          label="Search field"
          type="search"
          value={queryValue}
          sx={{ color: 'primary.contrastText', p: 0 }}
          minLength={2}
          maxLength={50}
          debounceTimeout={800}
          onChange={setQueryValue} />
      </Box>
  )
}
