<script lang="ts">
	interface Props {
		size?: number;
		strokeWidth?: number;
		class?: string;
	}
	let { size = 24, strokeWidth = 2.5, class: className = '', ...rest }: Props = $props();
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
	<polyline points="20 6 9 17 4 12" />
</svg>