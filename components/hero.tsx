import type { TeamData } from '@/lib/liquipedia'
import { formatMatchTime } from '@/lib/format'

function parseRecord(record: string) {
  const m = record.match(/(\d+)W : (\d+)L \(([\d.]+)%\) in matches/)
  return m ? { wins: m[1], losses: m[2], pct: `${Math.round(Number(m[3]))}%` } : null
}

export function Hero({ data }: { data: TeamData }) {
  const record = parseRecord(data.recentRecord)
  const [orgCreated, r6Created] = data.info.created.split(' ')

  const stats = [
    { label: 'Total winnings', value: data.info.winnings, note: 'Approx., all-time' },
    {
      label: 'Recent match record',
      value: record ? `${record.wins}W – ${record.losses}L` : '—',
      note: record ? `${record.pct} match win rate, last ${Number(record.wins) + Number(record.losses)}` : undefined,
    },
    { label: 'Coach', value: data.info.coach.replace(/.*"(.+)".*/, '$1'), note: data.info.coach },
    { label: 'Captain', value: data.info.captain.replace(/.*"(.+)".*/, '$1'), note: data.info.captain },
  ]

  return (
    <section aria-labelledby="hero-title" className="border-b border-border">
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Live from Liquipedia · updated {formatMatchTime(Math.floor(data.fetchedAt / 1000))}
        </div>

        <h1 id="hero-title" className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
          <span className="text-primary">G2 Esports</span> Rainbow Six Siege
        </h1>
        <p className="mt-3 font-mono text-sm font-medium text-primary">Now on GitHub</p>
        <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground md:text-lg">
          This is a website that tracks the Rainbow Six Siege team G2 — the current roster, upcoming
          matches, recent results and trophies, pulled in real time.
        </p>

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted-foreground">
          <div className="flex gap-1.5">
            <dt>Region:</dt>
            <dd className="text-foreground">{data.info.region}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Location:</dt>
            <dd className="text-foreground">{data.info.location.split(' ')[0]}</dd>
          </div>
          {orgCreated ? (
            <div className="flex gap-1.5">
              <dt>Org created:</dt>
              <dd className="text-foreground">{orgCreated}</dd>
            </div>
          ) : null}
          {r6Created ? (
            <div className="flex gap-1.5">
              <dt>R6 roster since:</dt>
              <dd className="text-foreground">{r6Created}</dd>
            </div>
          ) : null}
        </dl>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 bg-card p-4 md:p-5">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="text-xl font-semibold tracking-tight md:text-2xl">{s.value}</dd>
              {s.note ? <dd className="text-xs text-muted-foreground">{s.note}</dd> : null}
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
