import type { TeamData } from '@/lib/liquipedia'
import { SectionHeading } from '@/components/section-heading'

export function RosterSection({ data }: { data: TeamData }) {
  const captainId = data.info.captain.match(/"(.+)"/)?.[1]

  return (
    <section aria-labelledby="roster" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-5xl px-4 py-14">
        <SectionHeading id="roster" eyebrow="Roster" title="Active players & staff" />

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data.roster.map((p) => (
            <li key={p.id} className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-semibold">{p.id}</span>
                {p.id === captainId ? (
                  <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-primary-foreground">
                    Captain
                  </span>
                ) : null}
              </div>
              <span className="text-sm text-muted-foreground">{p.name}</span>
              <span className="mt-2 font-mono text-xs text-muted-foreground">Joined {p.joined}</span>
            </li>
          ))}
        </ul>

        {data.staff.length > 0 ? (
          <>
            <h3 className="mb-3 mt-8 text-sm font-medium text-muted-foreground">Staff</h3>
            <ul className="grid gap-3 sm:grid-cols-3">
              {data.staff.map((p) => (
                <li key={p.id} className="flex flex-col gap-1 rounded-lg border border-border p-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-primary">{p.role}</span>
                  <span className="font-semibold">{p.id}</span>
                  <span className="text-sm text-muted-foreground">{p.name}</span>
                  <span className="mt-1 font-mono text-xs text-muted-foreground">Joined {p.joined}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  )
}
