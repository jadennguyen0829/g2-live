import 'server-only'
import * as cheerio from 'cheerio'
import type { CheerioAPI } from 'cheerio'

export const SOURCE_URL = 'https://liquipedia.net/rainbowsix/G2_Esports'
const API_URL =
  'https://liquipedia.net/rainbowsix/api.php?action=parse&page=G2_Esports&format=json&prop=text&formatversion=2'

// Liquipedia's API terms limit parse requests to one every 30s, so cache for 15 min.
export const REVALIDATE_SECONDS = 900

export type TeamInfo = {
  location: string
  region: string
  coach: string
  captain: string
  winnings: string
  created: string
}

export type Person = { id: string; name: string; joined: string; role?: string }

export type Match = {
  timestamp: number
  tier: string
  tournament: string
  result: 'win' | 'loss' | 'draw' | 'unknown'
  score: string
  opponent: string
  opponentShort: string
}

export type UpcomingMatch = {
  timestamp: number
  tournament: string
  opponent: string
}

export type Achievement = {
  date: string
  place: string
  tier: string
  tournament: string
  result: string
  opponent: string
  prize: string
}

export type Placement = {
  tier: string
  first: string
  second: string
  third: string
  top3: string
  total: string
}

export type TeamData = {
  info: TeamInfo
  roster: Person[]
  staff: Person[]
  upcoming: UpcomingMatch[]
  recentMatches: Match[]
  recentRange: string
  recentRecord: string
  achievements: Achievement[]
  placements: Placement[]
  fetchedAt: number
}

const clean = (s: string) =>
  s
    .replace(/\[\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

function findTable($: CheerioAPI, headerPattern: RegExp) {
  return $('table')
    .filter((_, t) => headerPattern.test(clean($(t).find('tr').first().text())))
    .first()
}

function parseInfo($: CheerioAPI): TeamInfo {
  const map = new Map<string, string>()
  $('.fo-nttax-infobox .infobox-description').each((_, el) => {
    map.set(clean($(el).text()).replace(/:$/, ''), clean($(el).next().text()))
  })
  return {
    location: map.get('Location') ?? '—',
    region: map.get('Region') ?? '—',
    coach: map.get('Coach') ?? '—',
    captain: map.get('Team Captain') ?? '—',
    winnings: map.get('Approx. Total Winnings') ?? '—',
    created: map.get('Created') ?? '—',
  }
}

function parsePeopleTable($: CheerioAPI, table: ReturnType<typeof findTable>, withRole: boolean) {
  const people: Person[] = []
  table.find('tr').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length < 3) return
    const values = cells.map((__, c) => clean($(c).text())).get()
    const [id, name] = values
    if (!id) return
    if (withRole) {
      people.push({ id, name, role: values[2], joined: values[3] ?? '' })
    } else {
      people.push({ id, name, joined: values[2] })
    }
  })
  return people
}

function parseRosterAndStaff($: CheerioAPI) {
  const activeTables = $('table').filter(
    (_, t) => clean($(t).find('tr').first().text()) === 'IDNameJoin Date',
  )
  const roster = parsePeopleTable($, activeTables.eq(0), false)
  const staff = parsePeopleTable($, activeTables.eq(1), true).filter((p) =>
    /coach|^manager$|analyst/i.test(p.role ?? ''),
  )
  return { roster, staff }
}

function parseUpcoming($: CheerioAPI): UpcomingMatch[] {
  return $('.match-info')
    .map((_, el) => {
      const node = $(el)
      const timestamp = Number(node.find('.timer-object').attr('data-timestamp'))
      const teams = node
        .find('.match-info-opponent-identity')
        .map((__, o) => {
          const link = $(o).find('.name a')
          return link.attr('title') || clean(link.text()) || clean($(o).text())
        })
        .get()
      const opponent = teams.find((t) => !/^G2( Esports)?$/.test(t)) ?? 'TBD'
      return {
        timestamp,
        tournament: clean(node.find('.match-info-tournament-name').text()),
        opponent,
      }
    })
    .get()
    .filter((m) => Number.isFinite(m.timestamp))
}

function parseRecentMatches($: CheerioAPI) {
  const table = findTable($, /^DateTierTournamentScorevs\. Opponent/)
  const matches: Match[] = []
  table.find('tr').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length < 7) return
    const label = cells.eq(4).find('[data-label-type]').attr('data-label-type') ?? ''
    const opponentCell = cells.eq(6)
    matches.push({
      timestamp: Number(cells.eq(0).find('[data-timestamp]').attr('data-timestamp')),
      tier: clean(cells.eq(1).text()),
      tournament: clean(cells.eq(3).text()),
      result: label.includes('win')
        ? 'win'
        : label.includes('loss')
          ? 'loss'
          : label.includes('draw')
            ? 'draw'
            : 'unknown',
      score: clean(cells.eq(5).text()),
      opponent:
        opponentCell.find('.name a').attr('title') ||
        opponentCell.attr('data-sort-value') ||
        clean(opponentCell.text()),
      opponentShort: clean(opponentCell.find('.name').text()) || clean(opponentCell.text()),
    })
  })

  let recentRange = ''
  let recentRecord = ''
  $('*').each((_, el) => {
    if ($(el).children().length > 3) return
    const text = clean($(el).text())
    if (!recentRecord && /^\d+W : \d+L .* in matches/.test(text)) recentRecord = text
    if (!recentRange && /^For matches between .+:$/.test(text)) recentRange = text.replace(/:$/, '')
  })

  return { matches, recentRange, recentRecord }
}

function parseAchievements($: CheerioAPI): Achievement[] {
  const table = findTable($, /^DatePlaceTierTournamentResultPrize$/)
  const list: Achievement[] = []
  table.find('tr').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length < 8) return
    const opp = cells.eq(6)
    list.push({
      date: clean(cells.eq(0).text()),
      place: clean(cells.eq(1).text()),
      tier: clean(cells.eq(2).text()),
      tournament: clean(cells.eq(4).text()),
      result: clean(cells.eq(5).text()),
      opponent: opp.find('.name a').attr('title') || clean(opp.text()),
      prize: clean(cells.eq(7).text()),
    })
  })
  return list
}

function parsePlacements($: CheerioAPI): Placement[] {
  const table = findTable($, /^Tier1st2nd3rdTop3Total$/)
  const list: Placement[] = []
  table.find('tr').each((_, row) => {
    const cells = $(row)
      .find('td, th')
      .map((__, c) => clean($(c).text()))
      .get()
    if (cells.length !== 6 || cells[0] === 'Tier') return
    const [tier, first, second, third, top3, total] = cells
    list.push({ tier, first, second, third, top3, total })
  })
  return list
}

export async function getTeamData(): Promise<TeamData | null> {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'User-Agent': 'G2-R6-Live-Tracker/1.0 (fan site by Jaden Nguyen)',
        'Accept-Encoding': 'gzip',
      },
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { parse?: { text?: string } }
    const html = json.parse?.text
    if (!html) return null

    const $ = cheerio.load(html)
    const { roster, staff } = parseRosterAndStaff($)
    const { matches, recentRange, recentRecord } = parseRecentMatches($)

    return {
      info: parseInfo($),
      roster,
      staff,
      upcoming: parseUpcoming($),
      recentMatches: matches,
      recentRange,
      recentRecord,
      achievements: parseAchievements($),
      placements: parsePlacements($),
      fetchedAt: Date.now(),
    }
  } catch {
    return null
  }
}
