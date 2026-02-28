const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export interface PluginManifest {
	channelTypes?: string[];
	commands?: string[];
	triggers?: string[];
	hooks?: string[];
	frontendBundle?: string;
}

export interface Plugin {
	id: string;
	slug: string;
	name: string;
	description: string;
	author: string;
	version: string;
	homepageUrl?: string;
	sourceUrl?: string;
	iconUrl?: string;
	requestedPermissions: number;
	manifest: PluginManifest;
	builtIn: boolean;
	source: string;
	isVerified: boolean;
	downloads: number;
	createdAt: string;
	updatedAt: string;
}

export interface UploadedBuildResult {
	slug: string;
	name: string;
	description: string;
	author: string;
	version: string;
	homepageUrl?: string;
	sourceUrl?: string;
	iconUrl?: string;
	requestedPermissions?: number;
	manifest: PluginManifest;
	buildBaseUrl: string;
	frontendBundleUrl: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		},
		...options
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || `Request failed: ${res.status}`);
	}

	if (res.status === 204) return undefined as T;

	const body = await res.json();
	return body.data;
}

export async function listPlugins(): Promise<Plugin[]> {
	return request<Plugin[]>('/plugins');
}

export async function searchPlugins(query: string): Promise<Plugin[]> {
	return request<Plugin[]>(`/plugins/search?q=${encodeURIComponent(query)}`);
}

export async function getPlugin(id: string): Promise<Plugin> {
	return request<Plugin>(`/plugins/${id}`);
}

export async function submitPlugin(plugin: Omit<Plugin, 'id' | 'builtIn' | 'source' | 'isVerified' | 'downloads' | 'createdAt' | 'updatedAt'>): Promise<Plugin> {
	return request<Plugin>('/plugins', {
		method: 'POST',
		body: JSON.stringify(plugin)
	});
}

export async function updatePlugin(id: string, plugin: Partial<Plugin>): Promise<Plugin> {
	return request<Plugin>(`/plugins/${id}`, {
		method: 'PUT',
		body: JSON.stringify(plugin)
	});
}

export async function deletePlugin(id: string): Promise<void> {
	return request<void>(`/plugins/${id}`, { method: 'DELETE' });
}

export async function uploadBuildPackage(file: File): Promise<UploadedBuildResult> {
	const form = new FormData();
	form.append('package', file);

	const res = await fetch(`${API_BASE}/builds/upload`, {
		method: 'POST',
		body: form
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || `Upload failed: ${res.status}`);
	}

	const body = await res.json();
	return body.data as UploadedBuildResult;
}
