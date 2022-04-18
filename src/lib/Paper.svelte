<script>
  export let style = ""
</script>

<div class="paper" {style}>
  <slot />
</div>

<style>
  .paper {
    padding: 1em;
    background: #ededed;
    border-radius: 0.5em;
    display: inline-block;
  }
  @media (prefers-color-scheme: dark) {
    .paper {
      background: #121212;
      color: white;
      box-shadow: none;
    }
  }
</style>
