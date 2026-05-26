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
	<rect x="2" y="5" width="20" height="14" rx="2" />
	<line x1="2" y1="10" x2="22" y2="10" />
	<line x1="6" y1="14" x2="6" y2="14" />
	<line x1="10" y1="14" x2="10" y2="14" />
	<line x1="14" y1="14" x2="14" y2="14" />
	<line x1="18" y1="14" x2="18" y2="14" />
</svg>