<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="border-b border-[var(--border)] bg-[var(--bg-secondary)]/90 backdrop-blur">
		<div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<a href="/" class="flex items-center gap-2 no-underline">
				<div class="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"></div>
				<span class="text-xl font-semibold tracking-tight text-[var(--text)]">Zentra Marketplace</span>
			</a>
			<nav class="flex items-center gap-4">
				<a href="/" class="text-sm text-[var(--text-muted)] hover:text-[var(--text)] no-underline">Browse</a>
				<a href="/submit" class="text-sm text-[var(--text-muted)] hover:text-[var(--text)] no-underline">Publish</a>
			</nav>
		</div>
	</header>

	<!-- Content -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-[var(--border)] py-6 bg-[var(--bg-secondary)]/70">
		<div class="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--text-muted)]">
			Zentra Plugin Marketplace
		</div>
	</footer>
</div>
