import { getPeriodsOnDay } from "mvhs-schedule"

export async function loadNextEvent(time: Date) {
  let out = null
  let day = time
  while (out === null) {
    const periods = await getPeriodsOnDay(day)
    for (const period of periods) {
      if (period.start < time && time < period.end) {
        out = period
        out["inClass"] = true
        break
      }
      if (period.start > time) {
        out = period
        out["inClass"] = false
        break
      }
    }
    day = new Date(day.getTime() + 24 * 60 * 60 * 1000)
  }
  return out
}

export async function loadPrevEvent(time: Date) {
  let out = null
  let day = time
  while (out === null) {
    const periods = (await getPeriodsOnDay(day)).reverse()
    for (const period of periods) {
      if (period.start < time && time < period.end) {
        out = period
        out["inClass"] = true
        break
      }
      if (period.end < time) {
        out = period
        out["inClass"] = false
        break
      }
    }
    day = new Date(day.getTime() - 24 * 60 * 60 * 1000)
  }
  return out
}

export async function getSurroundingEvents(time: Date) {
  const next = await loadNextEvent(time)
  const prev = await loadPrevEvent(time)
  const inClass = next["inClass"]
  let surrounding = {
    next: next,
    prev: prev,
    nextTimestamp: inClass ? next.end : next.start,
    prevTimestamp: inClass ? prev.start : prev.end,
  }
  return surrounding
}

export async function getNextDay(time: Date) {
  const nextPeriod = await loadNextEvent(time)
  return nextPeriod.start
}

export async function getNextPeriods(time: Date) {
  const nextDay = await getNextDay(time)
  const periods = await getPeriodsOnDay(nextDay)
  return periods
}

export function getTimeBetween(start: Date, end: Date) {
  const startTime = start.getTime()
  const endTime = end.getTime()
  const diff = Math.abs(endTime - startTime)
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const minutes = Math.floor(diff / (60 * 1000) - hours * 60)
  const seconds = Math.floor(diff / 1000 - hours * 60 * 60 - minutes * 60)
  return `${hours ? hours + ":" : ""}${
    hours
      ? minutes.toString().padStart(2, "0")
      : minutes.toString().padStart(1, "0")
  }:${seconds.toString().padStart(2, "0")}`
}

export function periodToString(period: string) {
  return (
    (!isNaN(Number.parseInt(period)) ? "period " : "") +
    period.toString().toLowerCase()
  )
}
