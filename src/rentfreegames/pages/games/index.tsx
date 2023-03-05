import Head from 'next/head'
import Layout, { siteTitle } from '../../components/layout'
import utilStyles from '../../styles/utils.module.css'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import { getSortedGamesData } from '../../lib/games'

export default function Games({
    allGamesData,
    page
}: {
    allGamesData: {
        BGGId: number
        Name: string
        Rank: number
    }[],
    page: number
}) {
    return (
        <Layout>
            <Head>
                <title>{siteTitle}</title>
            </Head>
            <section className={utilStyles.headingMd}>
                <p>games</p>
                <p>
                    things
                </p>
            </section>
            <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
                <h2 className={utilStyles.headingLg}>Games</h2>
                <ul className={utilStyles.list}>
                    {allGamesData.map(({ BGGId, Name, Rank }) => (
                        <li className={utilStyles.listItem} key={BGGId}>
                            <Link href={`/games/${BGGId}`}>{Name}</Link>
                            <br />
                            <small className={utilStyles.lightText}>
                                {Rank}
                            </small>
                        </li>
                    ))}
                </ul>
            </section>
        </Layout>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    const allGamesData = await getSortedGamesData();
    return {
        props: {
            allGamesData
        }
    }
}