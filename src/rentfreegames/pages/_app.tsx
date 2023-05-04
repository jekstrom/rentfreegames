import '../styles/global.css'
import { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { GuestUserProvider } from '../components/GuestUserContext'
import MenuAppBar from '../components/navBar'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <GuestUserProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MenuAppBar />
          <Component {...pageProps} />
        </LocalizationProvider>
      </GuestUserProvider>
    </SessionProvider>
  )
}
