<script lang="ts">
	import { HeroSection, ActionsBar, AuthPrompt, GroupsSection, JoinSection, EmptyStateSection } from '$lib/components/sections';

	let { data } = $props();
</script>

<div class="container">
	{#if !data.session?.user}
		<HeroSection />
	{/if}

	{#if data.session?.user}
		<ActionsBar />
	{:else}
		<AuthPrompt />
	{/if}

	{#if data.groups && data.groups.length > 0}
		<GroupsSection groups={data.groups} />
	{/if}

	<JoinSection />

	{#if (!data.groups || data.groups.length === 0) && !data.session?.user}
		<EmptyStateSection />
	{/if}
</div>