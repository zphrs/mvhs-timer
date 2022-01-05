<script>
export let style = "";
</script>

<div class="paper" {style}>
  <slot></slot>
</div>

<style>
.paper {
  padding: 1em;
  background: white;
  border-radius: 0.5em;
  display: inline-block;
  box-shadow: 0 0 4px black;
}
@media (prefers-color-scheme: dark) {
  .paper {
    background: #121212;
    color: white;
    box-shadow: none;
  }
}
</style>