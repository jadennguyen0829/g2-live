import type { TeamData } from '@/lib/liquipedia'
import { formatMatchDate, formatMatchTime } from '@/lib/format'
import { Countdown } from '@/components/countdown'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

const resultLabel = { win: 'W', loss: 'L', draw: 'D', unknown: '–' } as const

export function MatchesSection({ data }: { data: TeamData }) {
  const { upcoming, recentMatches, recentRange, recentRecord } = data

  return (
    <section aria-labelledby="matches" className="mx-auto max-w-5xl px-4 py-14">
      <SectionHeading
        id="matches"
        eyebrow="Matches"
        title="Upcoming & recent matches"
        description={recentRange && recentRecord ? `${recentRange}: ${recentRecord}.` : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-muted-foreground">Next up</h3>
          {upcoming.length === 0 ? (
            <p className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
              No upcoming matches are listed on Liquipedia right now.
            </p>
          ) : (
            upcoming.map((m) => (
              <article
                key={`${m.timestamp}-${m.opponent}`}
                className="flex flex-col gap-4 rounded-lg border border-primary/40 bg-card p-5"
              >
                <Countdown timestamp={m.timestamp} />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-bold text-primary">G2</span>
                  <span className="font-mono text-xs text-muted-foreground">vs</span>
                  <span className="text-right text-lg font-semibold">{m.opponent}</span>
                </div>
                <div className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>{m.tournament}</span>
                  <time dateTime={new Date(m.timestamp * 1000).toISOString()} className="font-mono">
                    {formatMatchTime(m.timestamp)}
                  </time>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3 lg:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">Last {recentMatches.length} matches</h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <caption className="sr-only">Recent G2 Esports matches</caption>
              <thead className="bg-card text-left text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Result</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Opponent</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Score</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium md:table-cell">Tournament</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentMatches.map((m) => (
                  <tr key={`${m.timestamp}-${m.opponent}`}>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex size-6 items-center justify-center rounded font-mono text-xs font-bold',
                          m.result === 'win' && 'bg-foreground text-background',
                          m.result === 'loss' && 'bg-primary text-primary-foreground',
                          (m.result === 'draw' || m.result === 'unknown') && 'bg-muted text-muted-foreground',
                        )}
                      >
                        {resultLabel[m.result]}
                        <span className="sr-only">{m.result}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{m.opponent}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono">{m.score}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{m.tournament}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {Number.isFinite(m.timestamp) ? formatMatchDate(m.timestamp) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
