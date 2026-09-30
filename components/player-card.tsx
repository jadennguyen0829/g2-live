'use client'

import { ExternalLink, UserRound } from 'lucide-react'
import type { Person } from '@/lib/liquipedia'
import type { PlayerProfile } from '@/lib/players'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const HEADLINE = ['Rating', 'KOST', 'KPR', 'HS%']

function kdRatio(kd?: string) {
  const match = kd?.match(/^(\d+)-(\d+)/)
  if (!match) return null
  const [kills, deaths] = [Number(match[1]), Number(match[2])]
  return deaths > 0 ? (kills / deaths).toFixed(2) : null
}

function age(birthDate: string) {
  const born = new Date(birthDate)
  if (Number.isNaN(born.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) years--
  return years
}

function formatBirth(birthDate: string) {
  const d = new Date(birthDate)
  return Number.isNaN(d.getTime())
    ? birthDate
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

function Portrait({ profile, id, className }: { profile?: PlayerProfile; id: string; className: string }) {
  return profile?.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profile.imageUrl}
      alt={`${id} photo`}
      className={`${className} object-cover object-top`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className={`${className} flex items-center justify-center bg-muted text-muted-foreground`}>
      <UserRound className="size-10" aria-hidden="true" />
    </div>
  )
}

export function PlayerCard({
  person,
  profile,
  isCaptain,
}: {
  person: Person
  profile?: PlayerProfile
  isCaptain: boolean
}) {
  const kdRaw = profile?.stats.find((s) => s.label === 'K-D')?.value
  const ratio = kdRatio(kdRaw)
  const rating = profile?.stats.find((s) => s.label === 'Rating')?.value
  const headline = HEADLINE.map((l) => profile?.stats.find((s) => s.label === l)).filter(
    (s): s is { label: string; value: string } => Boolean(s),
  )
  const rest = (profile?.stats ?? []).filter((s) => !HEADLINE.includes(s.label) && s.label !== 'K-D')
  const years = profile?.birthDate ? age(profile.birthDate) : null

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="group flex w-full flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        }
      >
        <div className="relative">
          <Portrait profile={profile} id={person.id} className="aspect-[4/5] w-full" />
          {isCaptain ? (
            <span className="absolute left-2 top-2 rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-primary-foreground">
              Captain
            </span>
          ) : null}
        </div>
        <div className="flex flex-col gap-1 p-4">
          <span className="text-lg font-semibold group-hover:text-primary">{person.id}</span>
          <span className="text-sm text-muted-foreground">{person.name}</span>
          <dl className="mt-3 flex gap-4 font-mono text-xs">
            <div>
              <dt className="text-muted-foreground">K/D</dt>
              <dd className="text-sm font-semibold text-foreground">{ratio ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rating</dt>
              <dd className="text-sm font-semibold text-foreground">{rating ?? '—'}</dd>
            </div>
          </dl>
          <span className="mt-3 font-mono text-[11px] uppercase tracking-wider text-primary">View stats</span>
        </div>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <div className="flex flex-col gap-5 sm:flex-row">
          <Portrait profile={profile} id={person.id} className="aspect-[4/5] w-full rounded-md sm:w-44 sm:shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {person.id}
                {isCaptain ? <span className="ml-2 align-middle font-mono text-xs text-primary">Captain</span> : null}
              </DialogTitle>
              <DialogDescription>{profile?.name || person.name}</DialogDescription>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {profile?.country ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Nationality</dt>
                  <dd>{profile.country}</dd>
                </div>
              ) : null}
              {profile?.birthDate ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Born</dt>
                  <dd>
                    {formatBirth(profile.birthDate)}
                    {years !== null ? ` (${years})` : ''}
                  </dd>
                </div>
              ) : null}
              {profile?.roles.length ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Role</dt>
                  <dd>{profile.roles.join(', ')}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-muted-foreground">Joined G2</dt>
                <dd>{person.joined}</dd>
              </div>
            </dl>

            {profile?.signatureOperators.length ? (
              <div>
                <h3 className="mb-1.5 text-xs text-muted-foreground">Signature operators</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {profile.signatureOperators.map((op) => (
                    <li key={op} className="rounded border border-border px-2 py-0.5 text-xs capitalize">
                      {op}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {profile?.stats.length ? (
          <section aria-labelledby={`stats-${person.id}`} className="flex flex-col gap-3">
            <h3 id={`stats-${person.id}`} className="font-mono text-xs uppercase tracking-wider text-primary">
              Competitive stats · SiegeGG
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div className="rounded-md border border-primary/40 bg-primary/10 p-3">
                <div className="text-xl font-bold">{ratio ?? '—'}</div>
                <div className="text-xs text-muted-foreground">K/D ratio</div>
              </div>
              {headline.map((s) => (
                <div key={s.label} className="rounded-md border border-border p-3">
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            {kdRaw ? (
              <p className="font-mono text-xs text-muted-foreground">
                Kills–Deaths: <span className="text-foreground">{kdRaw}</span>
              </p>
            ) : null}
            {rest.length ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-4">
                {rest.map((s) => (
                  <div key={s.label} className="flex justify-between gap-2 border-b border-border py-1">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="font-mono">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {profile.attackOperators.length || profile.defenseOperators.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { side: 'Attack', ops: profile.attackOperators },
                  { side: 'Defense', ops: profile.defenseOperators },
                ].map(({ side, ops }) =>
                  ops.length ? (
                    <div key={side}>
                      <h4 className="mb-1 text-xs text-muted-foreground">Most played · {side}</h4>
                      <ol className="text-sm">
                        {ops.map((o) => (
                          <li key={o.name} className="flex justify-between border-b border-border py-1">
                            <span>{o.name}</span>
                            <span className="font-mono text-muted-foreground">{o.rounds} rounds</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null,
                )}
              </div>
            ) : null}
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">Competitive stats are currently unavailable.</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
          {profile?.liquipediaUrl ? (
            <a href={profile.liquipediaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
              Liquipedia <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
          {profile?.siegeGGUrl ? (
            <a href={profile.siegeGGUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
              SiegeGG <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
          {profile?.twitter ? (
            <a href={`https://x.com/${profile.twitter}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
              X @{profile.twitter} <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
          {profile?.twitch ? (
            <a href={`https://twitch.tv/${profile.twitch}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
              Twitch <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
          <span className="w-full text-xs text-muted-foreground">
            Photo & bio via Liquipedia (CC BY-SA 3.0). K/D ratio computed from SiegeGG kills and deaths.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
