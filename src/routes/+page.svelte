<script lang="ts">
	import { HeroSection, ActionsBar, AuthPrompt, GroupsSection, JoinSection, EmptyStateSection } from '$lib/components/sections';

	let { data } = $props();
</script>

<svelte:head>
	<title>SplitUp - Split expenses easily with friends</title>
	<meta name="description" content="Split expenses easily with friends, roommates, or travel buddies. No math, no arguments. Track who paid what and settle up quickly." />
</svelte:head>

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
		<GroupsSection groups={data.groups} userId={data.user?.id} />
	{/if}

	<JoinSection />

	{#if (!data.groups || data.groups.length === 0) && !data.session?.user}
		<EmptyStateSection />
	{/if}
</div>