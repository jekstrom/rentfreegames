import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import styles from './search.module.css'

export default function Search() {

  const searchRef = useRef(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(false)
  const [results, setResults] = useState([])

  const searchEndpoint = (query) => `/api/games?q=${query}`

  const onChange = useCallback((event) => {
    const query = event.target.value;
    setQuery(query)
    if (query.length) {
      fetch(searchEndpoint(query))
        .then(res => res.json())
        .then(res => {
          setResults(res)
        })
    } else {
      setResults([])
    }
  }, [])

  const onFocus = useCallback(() => {
    setActive(true)
    window.addEventListener('click', onClick)
  }, [])

  const onClick = useCallback((event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setActive(false)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <div
      className={styles.container}
      ref={searchRef}
    >
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          id="outlined-search" 
          label="Search field"
          type="search" 
          value={query} 
          onChange={onChange} 
          onFocus={onFocus} 
          sx={{ color: 'primary.contrastText', p: 0 }}
        />
      </Box>
      {active && results?.length > 0 && (
        <ul className={styles.results}>
          {results.map(({ BGGId, Name }) => (
            <li className={styles.result} key={BGGId}>
              <Link href="/games/[BGGId]" as={`/games/${BGGId}`}>
                {Name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
