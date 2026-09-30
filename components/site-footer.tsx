import { SOURCE_URL } from '@/lib/liquipedia'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          Made by <span className="font-medium text-foreground">Jaden Nguyen</span>
        </p>
        <p className="text-pretty">
          Data from{' '}
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            liquipedia.net/rainbowsix/G2_Esports
          </a>{' '}
          (CC-BY-SA 3.0). Fan project, not affiliated with G2 Esports.
        </p>
      </div>
    </footer>
  )
}
