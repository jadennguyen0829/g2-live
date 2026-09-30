const dateTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Berlin',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short',
})

const dateOnly = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Berlin',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export const formatMatchTime = (unixSeconds: number) => dateTime.format(unixSeconds * 1000)
export const formatMatchDate = (unixSeconds: number) => dateOnly.format(unixSeconds * 1000)
