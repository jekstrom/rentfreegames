import Layout from '../../components/layout'
import { getAllGameIds, getGameData } from '../../lib/games'
import Head from 'next/head'
import Date from '../../components/date'
import utilStyles from '../../styles/utils.module.css'
import { GetStaticProps, GetStaticPaths } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export default function Post({
  gameData
}: {
  gameData: {
    BGGId: number
    Name: string
    Description: string
    YearPublished: number
    GameWeight: number
    AvgRating: number
    BayesAvgRating: number
    StdDev: number
    MinPlayers: number
    MaxPlayers: number
    ComAgeRec: number
    BestPlayers: number
    GoodPlayers: number
    MfgPlaytime: number
    ComMinPlaytime: number
    ComMaxPlaytime: number
    MfgAgeRec: number
    Family: string
    ImagePath: string
    Rank: number
    // rank: number
    // names: string
    // game_id: string
    // mechanic: string
  }
}) {
  return (
    <Layout>
      <Head>
        <title>{`${gameData.Name} | RFG`}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{gameData.Name}</h1>
        <Image
          alt={`${gameData.Name} art`}
          src={gameData.ImagePath}
          width={400}
          height={400}
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
        />
        <div className={utilStyles.lightText}>
          BGG Rank: {gameData['Rank:boardgame']}
        </div>
        <div className={utilStyles.lightText}>
          Best Players: {gameData.BestPlayers}
        </div>
        <div className={utilStyles.lightText}>
          Players: {gameData.MinPlayers} - {gameData.MaxPlayers}
        </div>
        <div className={utilStyles.lightText}>
          Play time: {gameData.MfgPlaytime} minutes
        </div>
        <div className={utilStyles.lightText}>
          Community Suggested Play Time: {gameData.ComMinPlaytime} - {gameData.ComMaxPlaytime} minutes
        </div>
          <div dangerouslySetInnerHTML={{ __html: gameData.Description }} />
        <p>
          <Link href={`https://boardgamegeek.com/boardgame/${gameData.BGGId}`}>Board Game Geek</Link>
        </p>
        {(
        <div className={utilStyles.backToHome}>
          <Link href="/games">← Back to games</Link>
        </div>
      )}
      </article>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllGameIds()
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const gameData = await getGameData(params?.BGGId as string)
  console.log("Game data: ", gameData);
  return {
    props: {
      gameData
    }
  }
}