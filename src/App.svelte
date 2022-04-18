<script>
  import { getPeriodsOnDay, getScheduleFromDay } from "mvhs-schedule"
  import Paper from "./lib/Paper.svelte"
  import Progress from "./lib/Progress.svelte"
  import { onDestroy } from "svelte"

  let time = new Date(new Date().getTime())
  let date

  $: periods = getNextPeriods(time)

  let surrounding = {
    next: null,
    prev: null,
    nextTimestamp: null,
    prevTimestamp: null,
  }

  let interval = window.setInterval(async () => {
    time = new Date()
    surrounding = await getSurroundingEvents()
    // set title of document to diff between surrounding.nextTimestamp and time
    document.title = getTimeBetween(surrounding.nextTimestamp, time)
  }, 1000)
  onDestroy(() => {
    window.clearInterval(interval)
  })

  async function loadNextEvent() {
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

  async function loadPrevEvent() {
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

  async function getSurroundingEvents() {
    const next = await loadNextEvent()
    const prev = await loadPrevEvent()
    const inClass = next["inClass"]
    surrounding = {
      next: next,
      prev: prev,
      nextTimestamp: inClass ? next.end : next.start,
      prevTimestamp: inClass ? prev.start : prev.end,
    }
    return surrounding
  }

  async function getNextDay() {
    const nextPeriod = await loadNextEvent()
    date = new Date(nextPeriod.start)
    return nextPeriod.start
  }

  async function getNextPeriods(date) {
    const nextDay = await getNextDay()
    const periods = await getPeriodsOnDay(nextDay)
    return periods
  }

  function getTimeBetween(start, end) {
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

  function periodToString(period) {
    return (
      (!isNaN(Number.parseInt(period)) ? "period " : "") +
      period.toString().toLowerCase()
    )
  }

  function getPeriodColor(period) {
    let darkmode =
      !!window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    if (isNaN(Number.parseInt(period))) {
      return !darkmode ? "#fafafa" : "#212121"
    }
    // check if prefers color scheme dark
    return (
      "hsl(" + (210 + period * 15) + "deg, 100%, " + (darkmode ? 30 : 85) + "%)"
    )
  }
</script>

<main>
  {#await getSurroundingEvents()}
    <Paper>
      <h1>Loading Classes</h1>
    </Paper>
  {:then}
    <div class="progress">
      <Progress
        min={surrounding.prevTimestamp.getTime()}
        value={time.getTime()}
        max={surrounding.nextTimestamp.getTime()}
      >
        <Paper style="background: transparent;">
          <h2>
            time {(surrounding.next["inClass"] ? "left in " : "until ") +
              periodToString(surrounding.next.period)}:
          </h2>
          <h1>{getTimeBetween(time, surrounding.nextTimestamp)}</h1>
        </Paper>
      </Progress>
    </div>
    {#await periods}
      <Paper>
        <h1>Loading periods for {date.toLocaleDateString()}</h1>
      </Paper>
    {:then periods}
      <Paper style="width: 100%; max-width: 800px; margin: 1em">
        <h1>
          schedule for {date
            .toLocaleString("en-US", {
              weekday: "long",
            })
            .toLowerCase()}:
        </h1>
        <div class="schedule">
          {#each periods as period}
            <Paper style="background-color: {getPeriodColor(period.period)}">
              <h2>{periodToString(period.period)}</h2>
              <h3>
                {period.start.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - {period.end.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </h3>
            </Paper>
          {/each}
        </div>
      </Paper>
    {/await}
  {/await}
</main>

<style>
  main {
    padding: 1em;
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    align-content: flex-start;
    justify-content: space-evenly;
  }
  main > * {
    margin: 1em;
  }
  .progress {
    display: inline-block;
    border-radius: 0.5em;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  ::selection {
    background-color: #000;
    color: #fff;
  }
  @media (prefers-color-scheme: dark) {
    ::selection {
      background-color: #fff;
      color: #000;
    }
  }
  .schedule {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-template-rows: repeat(auto-fit, minmax(100px, 1fr));
    grid-gap: 1em;
    max-width: 100%;
  }
</style>
