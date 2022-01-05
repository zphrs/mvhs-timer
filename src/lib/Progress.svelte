<script>
  export let min = 0;
  export let value = 0;
  export let max = 1;
  export let color = '#000';
  export let backgroundColor = '#fff';
  export let continuous = false;
  console.log(min)

  let interval = null;

  if (continuous) {
    if (!interval)
      interval = window.setInterval(() => {
        value = value?0:1;
      }, 1000);
  }
  else
  {
    window.clearInterval(interval);
  }

  $: percent = (value - min) / (max - min) * 100;
</script>

<div class="outer" style="background: {backgroundColor}">
  <div class="inner" style="background: {color}; transform: scaleX({percent/100})"></div>
  <slot></slot>
</div>


<style>
  .outer {
    display: inline-block;
    overflow: hidden;
    position: relative;
    border-radius: inherit;
  }

  .inner {
    width: 100%;
    transform-origin: left;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    transition: transform .75s ease-out;
  }
</style>