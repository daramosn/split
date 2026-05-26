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
	<circle cx="12" cy="12" r="10" />
	<line x1="15" y1="9" x2="9" y2="15" />
	<line x1="9" y1="9" x2="15" y2="15" />
</svg>