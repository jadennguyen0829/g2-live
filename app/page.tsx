import { getTeamData, SOURCE_URL } from '@/lib/liquipedia'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { MatchesSection } from '@/components/matches-section'
import { RosterSection } from '@/components/roster-section'
import { AchievementsSection } from '@/components/achievements-section'
import { SiteFooter } from '@/components/site-footer'

export const revalidate = 900

export default async function Page() {
  const data = await getTeamData()

  return (
    <>
      <SiteHeader />
      <main id="top">
        {data ? (
          <>
            <Hero data={data} />
            <MatchesSection data={data} />
            <RosterSection data={data} />
            <AchievementsSection data={data} />
          </>
        ) : (
          <section className="mx-auto max-w-5xl px-4 py-24">
            <h1 className="text-3xl font-bold">
              <span className="text-primary">G2 Esports</span> Rainbow Six Siege
            </h1>
            <p className="mt-4 text-muted-foreground">
              Live data from Liquipedia is temporarily unavailable. See the latest on{' '}
              <a href={SOURCE_URL} className="text-foreground underline underline-offset-4">
                Liquipedia
              </a>
              .
            </p>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
