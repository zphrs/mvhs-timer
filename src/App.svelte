<script>
  import { getPeriodsOnDay, getScheduleFromDay } from "mvhs-schedule"
  import Paper from "./lib/Paper.svelte"
  import Progress from "./lib/Progress.svelte"
  import { onDestroy } from "svelte"
  import Schedule from "./lib/Schedule.svelte"

  import {
    getSurroundingEvents,
    getTimeBetween,
    getNextDay,
    periodToString,
    getNextPeriods,
  } from "./PeriodUtils"

  let time = new Date(new Date().getTime())
  let date = new Date(0)

  /**
   * @param {Date} time
   */
  async function checkForNextDay(time) {
    let newDate = await getNextDay(time)
    if (newDate.getTime() !== date.getTime()) {
      console.log("New date: " + newDate)
      date = newDate
    }
  }

  $: checkForNextDay(time)

  let surrounding = getSurroundingEvents(time)

  let interval = window.setInterval(async () => {
    time = new Date()
    surrounding = getSurroundingEvents(time)
    // set title of document to diff between surrounding.nextTimestamp and time
    document.title = getTimeBetween((await surrounding).nextTimestamp, time)
  }, 1000)
  onDestroy(() => {
    window.clearInterval(interval)
  })
</script>

<main>
  {#await surrounding}
    <Paper>
      <h1>Loading Classes</h1>
    </Paper>
  {:then surrounding}
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
  {/await}
  {#await getNextPeriods(date)}
    <Paper>
      <h1>Loading periods...</h1>
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
      <Schedule {periods} />
    </Paper>
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

  h2 {
    margin: 0.25rem;
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
</style>
