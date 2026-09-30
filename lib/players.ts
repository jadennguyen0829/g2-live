import 'server-only'
import * as cheerio from 'cheerio'
import { REVALIDATE_SECONDS } from '@/lib/liquipedia'

const USER_AGENT = 'G2-R6-Live-Tracker/1.0 (fan site by Jaden Nguyen)'
const LP_API = 'https://liquipedia.net/rainbowsix/api.php'
const LP_COMMONS_API = 'https://liquipedia.net/commons/api.php'

export type PlayerStat = { label: string; value: string }
export type OperatorUsage = { name: string; rounds: string }

export type PlayerProfile = {
  id: string
  name: string
  country: string
  birthDate: string
  roles: string[]
  signatureOperators: string[]
  imageUrl: string | null
  liquipediaUrl: string
  twitter: string | null
  twitch: string | null
  siegeGGUrl: string | null
  stats: PlayerStat[]
  attackOperators: OperatorUsage[]
  defenseOperators: OperatorUsage[]
}

const ROLE_LABELS: Record<string, string> = {
  entry: 'Entry fragger',
  flex: 'Flex',
  support: 'Support',
  igl: 'In-game leader',
  captain: 'Captain',
  hardbreach: 'Hard breacher',
  anchor: 'Anchor',
  roamer: 'Roamer',
  coach: 'Coach',
}

const lpFetch = (url: string) =>
  fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Encoding': 'gzip' },
    next: { revalidate: REVALIDATE_SECONDS },
  })

function readInfobox(wikitext: string) {
  const start = wikitext.indexOf('{{Infobox player')
  const body = start >= 0 ? wikitext.slice(start) : ''
  const fields = new Map<string, string>()
  for (const match of body.matchAll(/^\|\s*([a-z0-9_]+)\s*=(.*)$/gm)) {
    fields.set(match[1], match[2].trim())
  }
  return fields
}

function pickSeries(fields: Map<string, string>, base: string) {
  const values: string[] = []
  for (let i = 1; i <= 8; i++) {
    const v = fields.get(i === 1 ? base : `${base}${i}`)
    if (v) values.push(v)
  }
  return values
}

async function fetchImageUrls(files: string[]) {
  const urls = new Map<string, string>()
  if (files.length === 0) return urls
  const params = new URLSearchParams({
    action: 'query',
    titles: files.map((f) => `File:${f}`).join('|'),
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '480',
    format: 'json',
    formatversion: '2',
  })
  const res = await lpFetch(`${LP_COMMONS_API}?${params}`)
  if (!res.ok) return urls
  const json = (await res.json()) as {
    query?: { pages?: { title: string; imageinfo?: { thumburl?: string; url?: string }[] }[] }
  }
  for (const page of json.query?.pages ?? []) {
    const info = page.imageinfo?.[0]
    const url = info?.thumburl ?? info?.url
    if (url) urls.set(page.title.replace(/^File:/, ''), url)
  }
  return urls
}

async function fetchSiegeGG(siegeggId: string) {
  const empty = { url: null, stats: [], attack: [], defense: [] }
  try {
    const res = await fetch(`https://siege.gg/players/${encodeURIComponent(siegeggId)}`, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) return empty
    const $ = cheerio.load(await res.text())

    const stats: PlayerStat[] = []
    $('.stat').each((_, el) => {
      const value = $(el).find('.stat__number').first().text().trim()
      const label = $(el).find('.stat__label').first().text().trim()
      if (value && label && value !== label) stats.push({ label, value })
    })

    const operatorsFor = (side: string) => {
      const heading = $('h3').filter((_, h) => $(h).text().trim() === side).first()
      const table = heading.nextAll('table').first().length
        ? heading.nextAll('table').first()
        : heading.parent().find('table').first()
      return table
        .find('tbody tr')
        .map((_, row) => ({
          name: $(row).find('img').attr('alt')?.trim() ?? '',
          rounds: $(row).find('td').last().text().trim(),
        }))
        .get()
        .filter((o) => o.name)
        .slice(0, 3)
    }

    return {
      url: res.url || `https://siege.gg/players/${siegeggId}`,
      stats,
      attack: operatorsFor('Attack'),
      defense: operatorsFor('Defense'),
    }
  } catch {
    return empty
  }
}

export async function getPlayerProfiles(ids: string[]): Promise<Record<string, PlayerProfile>> {
  const profiles: Record<string, PlayerProfile> = {}
  if (ids.length === 0) return profiles

  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: ids.join('|'),
      prop: 'revisions',
      rvprop: 'content',
      rvslots: 'main',
      redirects: '1',
      format: 'json',
      formatversion: '2',
    })
    const res = await lpFetch(`${LP_API}?${params}`)
    if (!res.ok) return profiles
    const json = (await res.json()) as {
      query?: {
        pages?: { title: string; revisions?: { slots: { main: { content: string } } }[] }[]
      }
    }

    const entries = (json.query?.pages ?? []).map((page) => ({
      title: page.title,
      fields: readInfobox(page.revisions?.[0]?.slots.main.content ?? ''),
    }))

    const images = await fetchImageUrls(
      entries.map((e) => e.fields.get('image')).filter((f): f is string => Boolean(f)),
    )

    const siege = await Promise.all(
      entries.map((e) => {
        const sid = e.fields.get('siegegg')
        return sid ? fetchSiegeGG(sid) : Promise.resolve(null)
      }),
    )

    entries.forEach(({ title, fields }, i) => {
      const id = fields.get('id') || title
      const image = fields.get('image')
      const sgg = siege[i]
      const roles = (fields.get('roles') ?? '')
        .split(',')
        .map((r) => r.trim().toLowerCase())
        .filter(Boolean)
        .map((r) => ROLE_LABELS[r] ?? r.charAt(0).toUpperCase() + r.slice(1))

      const profile: PlayerProfile = {
        id,
        name: fields.get('name') ?? '',
        country: fields.get('country') ?? '',
        birthDate: fields.get('birth_date') ?? '',
        roles,
        signatureOperators: pickSeries(fields, 'operator'),
        imageUrl: image ? (images.get(image) ?? null) : null,
        liquipediaUrl: `https://liquipedia.net/rainbowsix/${encodeURIComponent(title.replace(/ /g, '_'))}`,
        twitter: fields.get('twitter') || null,
        twitch: fields.get('twitch') || null,
        siegeGGUrl: sgg?.url ?? null,
        stats: sgg?.stats ?? [],
        attackOperators: sgg?.attack ?? [],
        defenseOperators: sgg?.defense ?? [],
      }
      const key = ids.find((x) => x.toLowerCase() === id.toLowerCase() || x === title) ?? id
      profiles[key] = profile
    })
  } catch {
    return profiles
  }

  return profiles
}
