import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { GetStaticProps } from 'next'
import SessionBox from '../components/sessionBox'
import Signin from '../components/signin'
import Grid from '@mui/material/Grid'

export default function Home() {
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
          spacing={20}>
          <Grid item>
            <SessionBox />
          </Grid>
          <Grid item>
            <Signin />
          </Grid>
        </Grid>
      </section>
    </Layout>
  )
}
