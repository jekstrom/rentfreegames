import '../styles/global.css'
import { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { GuestUserProvider } from '../components/GuestUserContext'
import MenuAppBar from '../components/navBar'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <GuestUserProvider>
        <MenuAppBar />
        <Component {...pageProps} />
      </GuestUserProvider>
    </SessionProvider>
  )
}
