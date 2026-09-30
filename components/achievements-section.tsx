import type { TeamData } from '@/lib/liquipedia'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

export function AchievementsSection({ data }: { data: TeamData }) {
  const { achievements, placements } = data

  return (
    <section aria-labelledby="achievements" className="mx-auto max-w-5xl px-4 py-14">
      <SectionHeading
        id="achievements"
        eyebrow="Achievements"
        title="Trophies & top finishes"
        description="Placement summary by tournament tier, and G2's most notable results."
      />

      {placements.length > 0 ? (
        <div className="mb-8 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">Placement summary by tier</caption>
            <thead className="bg-card text-xs text-muted-foreground">
              <tr>
                {['Tier', '1st', '2nd', '3rd', 'Top 3', 'Total'].map((h, i) => (
                  <th key={h} scope="col" className={cn('px-4 py-2.5 font-medium', i === 0 ? 'text-left' : 'text-right')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {placements.map((p) => (
                <tr key={p.tier} className={cn(p.tier === 'Total' && 'bg-card font-semibold')}>
                  <th scope="row" className="px-4 py-3 text-left font-sans font-medium">{p.tier}</th>
                  <td className="px-4 py-3 text-right text-primary">{p.first}</td>
                  <td className="px-4 py-3 text-right">{p.second}</td>
                  <td className="px-4 py-3 text-right">{p.third}</td>
                  <td className="px-4 py-3 text-right">{p.top3}</td>
                  <td className="px-4 py-3 text-right">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <ol className="grid gap-3 md:grid-cols-2">
        {achievements.map((a) => {
          const isWin = a.place === '1st'
          return (
            <li
              key={`${a.date}-${a.tournament}`}
              className={cn(
                'flex items-start gap-4 rounded-lg border bg-card p-4',
                isWin ? 'border-primary/50' : 'border-border',
              )}
            >
              <span
                className={cn(
                  'flex h-10 min-w-14 items-center justify-center rounded-md px-2 font-mono text-sm font-bold',
                  isWin ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                )}
              >
                {a.place}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-semibold">{a.tournament}</span>
                <span className="text-xs text-muted-foreground">
                  {a.tier} · Final {a.result} vs {a.opponent}
                </span>
                <span className="flex justify-between gap-2 font-mono text-xs text-muted-foreground">
                  <time dateTime={a.date}>{a.date}</time>
                  <span className="text-foreground">{a.prize}</span>
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
