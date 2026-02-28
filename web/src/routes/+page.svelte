<script lang="ts">
	import { listPlugins, searchPlugins, type Plugin } from '$lib/api';
	import { Search, Puzzle, Download, Check, AlertTriangle, ExternalLink } from 'lucide-svelte';

	let plugins = $state<Plugin[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let error = $state('');

	// Permission labels for display
	const permLabels: Record<number, { label: string; risky: boolean }> = {
		[1 << 0]: { label: 'Read Messages', risky: false },
		[1 << 1]: { label: 'Send Messages', risky: false },
		[1 << 2]: { label: 'Manage Messages', risky: true },
		[1 << 3]: { label: 'Read Members', risky: false },
		[1 << 4]: { label: 'Manage Members', risky: true },
		[1 << 5]: { label: 'Read Channels', risky: false },
		[1 << 6]: { label: 'Manage Channels', risky: true },
		[1 << 7]: { label: 'Custom Channel Types', risky: false },
		[1 << 8]: { label: 'Commands', risky: false },
		[1 << 9]: { label: 'Server Info', risky: false },
		[1 << 10]: { label: 'Webhooks', risky: true },
		[1 << 11]: { label: 'React to Messages', risky: false }
	};

	$effect(() => {
		loadPlugins();
	});

	async function loadPlugins() {
		loading = true;
		error = '';
		try {
			if (searchQuery.trim()) {
				plugins = await searchPlugins(searchQuery.trim());
			} else {
				plugins = await listPlugins();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load plugins';
			plugins = [];
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		loadPlugins();
	}

	function getPermissions(bitmask: number) {
		return Object.entries(permLabels)
			.filter(([bit]) => (bitmask & Number(bit)) !== 0)
			.map(([bit, info]) => info);
	}

	function formatDownloads(n: number) {
		if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
		if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
		return n.toString();
	}
</script>

<svelte:head>
	<title>Zentra Plugin Marketplace</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-6 py-8">
	<!-- Hero -->
	<div class="text-center mb-10">
		<h1 class="text-4xl font-semibold tracking-tight mb-2">Plugin Marketplace</h1>
		<p class="text-[var(--text-muted)] text-lg">Install and publish plugins built for Zentra communities</p>
	</div>

	<!-- Search -->
	<div class="max-w-xl mx-auto mb-8">
		<div class="flex gap-2 surface-panel p-2 rounded-xl">
			<div class="flex-1 relative">
				<Search size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
				<input
					type="text"
					bind:value={searchQuery}
					onkeydown={(e) => { if (e.key === 'Enter') handleSearch(); }}
					placeholder="Search plugins..."
					class="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
				/>
			</div>
			<button
				onclick={handleSearch}
				class="px-4 py-2.5 bg-[var(--accent)] text-[#03231b] rounded-lg hover:bg-[var(--accent-hover)] transition-colors font-medium text-sm"
			>
				Search
			</button>
		</div>
	</div>

	<!-- Results -->
	{#if loading}
		<div class="text-center py-12">
			<div class="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
			<p class="text-[var(--text-muted)]">Loading plugins...</p>
		</div>
	{:else if error}
		<div class="text-center py-12">
			<AlertTriangle size={32} class="mx-auto mb-3 text-[var(--danger)]" />
			<p class="text-[var(--danger)]">{error}</p>
		</div>
	{:else if plugins.length === 0}
		<div class="text-center py-12">
			<Puzzle size={40} class="mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
			{#if searchQuery}
				<p class="text-[var(--text-muted)]">No plugins found for "{searchQuery}"</p>
			{:else}
				<p class="text-[var(--text-muted)]">No plugins available yet</p>
				<p class="text-sm text-[var(--text-muted)] mt-1">Be the first to <a href="/submit">submit a plugin</a></p>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each plugins as plugin (plugin.id)}
				{@const perms = getPermissions(plugin.requestedPermissions)}
				{@const riskyCount = perms.filter(p => p.risky).length}
				<div class="surface-panel rounded-xl p-5 hover:border-[var(--border-light)] transition-colors flex flex-col">
					<!-- Header -->
					<div class="flex items-start gap-3 mb-3">
						<div class="w-12 h-12 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center shrink-0">
							{#if plugin.iconUrl}
								<img src={plugin.iconUrl} alt="" class="w-12 h-12 rounded-lg object-cover" />
							{:else}
								<Puzzle size={24} class="text-[var(--text-muted)]" />
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-1.5">
								<h3 class="font-semibold text-[var(--text)] truncate">{plugin.name}</h3>
								{#if plugin.isVerified}
									<Check size={15} class="text-[var(--success)] shrink-0" />
								{/if}
							</div>
							<p class="text-xs text-[var(--text-muted)]">by {plugin.author} - v{plugin.version}</p>
						</div>
					</div>

					<!-- Description -->
					<p class="text-sm text-[var(--text-muted)] mb-3 line-clamp-2 flex-1">{plugin.description}</p>

					<!-- Manifest features -->
					{#if plugin.manifest}
						<div class="flex flex-wrap gap-1.5 mb-3">
							{#if plugin.manifest.channelTypes?.length}
								<span class="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
									{plugin.manifest.channelTypes.length} channel types
								</span>
							{/if}
							{#if plugin.manifest.commands?.length}
								<span class="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
									{plugin.manifest.commands.length} commands
								</span>
							{/if}
							{#if plugin.manifest.hooks?.length}
								<span class="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-muted)] text-[var(--accent)]">
									{plugin.manifest.hooks.length} hooks
								</span>
							{/if}
						</div>
					{/if}

					<!-- Risky permission warning -->
					{#if riskyCount > 0}
						<div class="flex items-center gap-1.5 mb-3 text-[11px] text-[var(--warning)]">
							<AlertTriangle size={12} />
							<span>{riskyCount} elevated permission{riskyCount > 1 ? 's' : ''}</span>
						</div>
					{/if}

					<!-- Footer -->
					<div class="flex items-center justify-between pt-3 border-t border-[var(--border)]">
						<div class="flex items-center gap-1 text-xs text-[var(--text-muted)]">
							<Download size={12} />
							<span>{formatDownloads(plugin.downloads)}</span>
						</div>
						<div class="flex items-center gap-2">
							{#if plugin.homepageUrl}
								<a href={plugin.homepageUrl} target="_blank" rel="noopener noreferrer" class="text-xs text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1 no-underline">
									<ExternalLink size={12} />
								</a>
							{/if}
							<span class="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-muted)]">
								{plugin.source}
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
