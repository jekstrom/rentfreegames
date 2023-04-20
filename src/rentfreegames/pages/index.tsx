import AddCircleIcon from '@mui/icons-material/AddCircle'
import { Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import { GetStaticProps } from 'next'
import { signIn, signOut, useSession } from "next-auth/react"
import Head from 'next/head'
import { useRouter } from 'next/router'
import UserGameSessions from '../components/gameSessions'
import Layout, { siteTitle } from '../components/layout'
import SessionBox from '../components/sessionBox'
import Signin from '../components/signin'
import utilStyles from '../styles/utils.module.css'
import UserGamesButton from '../components/userGamesButton'

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession()
  const addGames = () => {
    router.push(`/games`)
  }

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <Grid container
          direction="column"
          alignItems="center"
          justifyContent="center"
          columns={{ xs: 12, sm: 12, md: 12 }}
          spacing={10}>
          <Grid item>
            <SessionBox />
          </Grid>
          <Grid item>
            {
              status === "authenticated" 
              ? <Grid container>
                  <Grid item>
                    <Button onClick={addGames}><AddCircleIcon sx={{ marginRight: 1, color: "secondary.light" }} /> Add games</Button>
                  </Grid>
                  <Grid item>
                    <UserGamesButton/>
                  </Grid>
                </Grid>
              : <></> 
            }
          </Grid>
          <Grid item sx={{ width: "75%" }}>
            <UserGameSessions />
          </Grid>
          <Grid item>
            <Signin />
          </Grid>
        </Grid>
      </section>
    </Layout>
  )
}
