<script lang="ts">
	interface Props {
		size?: number;
		strokeWidth?: number;
		class?: string;
	}
	let { size = 24, strokeWidth = 2, class: className = '', ...rest }: Props = $props();
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
	{...rest}
>
	<circle cx="9" cy="9" r="6" />
	<path d="M15 9a6 6 0 1 1-12 0 6 6 0 0 1 12 0z" />
</svg>