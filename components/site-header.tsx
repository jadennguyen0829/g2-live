import { ExternalLink } from 'lucide-react'
import { SOURCE_URL } from '@/lib/liquipedia'

const links = [
  { href: '#matches', label: 'Matches' },
  { href: '#roster', label: 'Roster' },
  { href: '#achievements', label: 'Achievements' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <a href="#top" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground"
          >
            G2
          </span>
          <span className="text-sm">R6 Live Stats</span>
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href={SOURCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Liquipedia
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </header>
  )
}
