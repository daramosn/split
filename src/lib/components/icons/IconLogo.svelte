<script lang="ts">
  interface Props {
    size?: number
    strokeWidth?: number
    class?: string
  }

  let { size = 28, strokeWidth = 2.5, class: className = '' }: Props = $props()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
>
  <circle cx="9" cy="9" r="6" />
  <path d="M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0z" />
  <line x1="9" y1="3" x2="9" y2="6" />
  <line x1="9" y1="12" x2="9" y2="15" />
  <line x1="3" y1="9" x2="6" y2="9" />
  <line x1="12" y1="9" x2="15" y2="9" />
</svg>
