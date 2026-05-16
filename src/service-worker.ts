/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const CACHE_NAME = `tricount-cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS);
		})
	);
});

self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys
					.filter((key) => key !== CACHE_NAME)
					.map((key) => caches.delete(key))
			);
		})
	);
});

self.addEventListener('fetch', (event: FetchEvent) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	if (url.origin !== location.origin) return;

	const assetMatch = ASSETS.includes(url.pathname);

	if (assetMatch) {
		event.respondWith(
			caches.match(event.request).then((cached) => {
				return cached ?? fetch(event.request);
			})
		);
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cached) => {
			return cached ?? fetch(event.request);
		})
	);
});

declare const self: ServiceWorkerGlobalScope;