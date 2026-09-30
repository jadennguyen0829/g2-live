'use client'

import { useEffect, useState } from 'react'

function describe(msLeft: number) {
  if (msLeft <= 0) return 'Live now or finished'
  const totalMinutes = Math.floor(msLeft / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `Starts in ${days}d ${hours}h`
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`
  return `Starts in ${minutes}m`
}

export function Countdown({ timestamp }: { timestamp: number }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-xs text-primary" aria-live="polite">
      {now === null ? '\u00a0' : describe(timestamp * 1000 - now)}
    </span>
  )
}
