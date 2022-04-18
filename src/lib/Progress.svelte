<script>
  export let min = 0
  export let value = 0
  export let max = 1
  export let continuous = false
  console.log(min)

  let interval = null

  if (continuous) {
    if (!interval)
      interval = window.setInterval(() => {
        value = value ? 0 : 1
      }, 1000)
  } else {
    window.clearInterval(interval)
  }

  $: percent = ((value - min) / (max - min)) * 100
</script>

<div class="outer">
  <div class="inner" style="transform: scaleX({percent / 100})" />
  <div class="slot">
    <slot />
  </div>
</div>

<style>
  .outer {
    display: inline-block;
    overflow: hidden;
    position: relative;
    border-radius: inherit;
    background-color: #ededed;
  }

  .inner {
    width: 100%;
    transform-origin: left;
    height: 100%;
    position: absolute;
    z-index: 1;
    top: 0;
    border-radius: 0.5rem;
    left: 0;
    transition: transform 0.75s ease-out;
    background-color: #b8b8b8;
  }

  @media (prefers-color-scheme: dark) {
    .outer {
      background-color: #121212;
    }
    .inner {
      background-color: #474747;
    }
  }

  .slot {
    position: relative;
    z-index: 10;
  }
</style>
