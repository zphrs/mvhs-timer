<script lang="ts">
  // define periods as a prop
  export let periods = []
  import { periodToString } from "../PeriodUtils"
  import Paper from "./Paper.svelte"

  function getPeriodColor(period) {
    let darkmode =
      !!window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    let parsedPeriod = Number.parseInt(period)
    if (isNaN(parsedPeriod)) {
      return !darkmode ? "#fafafa" : "#212121"
    }
    // check if prefers color scheme dark
    return (
      "hsl(" +
      (210 + parsedPeriod * 15) +
      "deg, 100%, " +
      (darkmode ? 30 : 85) +
      "%)"
    )
  }

  function getPeriodHue(period) {
    let parsedPeriod = Number.parseInt(period)
    if (isNaN(parsedPeriod)) {
      return 0
    }
    return 210 + parsedPeriod * 15
  }
</script>

<div class="schedule">
  {#each periods as period}
    <Paper
      style="--background-hue: {getPeriodHue(
        period.period
      )}; --background-sat: {getPeriodHue(period.period) === 0 ? '0%' : '100%'}"
    >
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

<style>
  .schedule {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-template-rows: 1fr;
    grid-gap: 1em;
    max-width: 100%;
  }
  :global(.schedule .paper) {
    background-color: hsl(var(--background-hue), var(--background-sat), 85%);
  }

  @media (prefers-color-scheme: dark) {
    :global(.schedule .paper) {
      background-color: hsl(var(--background-hue), var(--background-sat), 30%);
    }
  }
  h3 {
    font-size: 1.1rem;
    margin: 0.25rem;
    text-transform: lowercase;
  }
</style>
