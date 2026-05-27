<script lang="ts">
	import { IconPlus } from '$lib/components/icons';
</script>

<div class="actions-bar animate-fade-in-up stagger-2">
	<a href="/create" class="btn btn-primary btn-lg">
		<IconPlus size={20} strokeWidth={2.5} />
		Create Group
	</a>
</div>

<style>
	.actions-bar {
		display: flex;
		gap: 16px;
		margin-bottom: 48px;
	}
</style>