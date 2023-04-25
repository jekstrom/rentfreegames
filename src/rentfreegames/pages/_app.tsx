import '../styles/global.css'
import { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { GuestUserProvider } from '../components/GuestUserContext'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <GuestUserProvider>
        <Component {...pageProps} />
      </GuestUserProvider>
    </SessionProvider>
  )
}
