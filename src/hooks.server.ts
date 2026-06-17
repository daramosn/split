import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Session, User } from '@supabase/supabase-js';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return event.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	let userPromise: Promise<User | null> | null = null;
	let sessionPromise: Promise<Session | null> | null = null;

	event.locals.getSession = () => {
		if (!sessionPromise) {
			sessionPromise = event.locals.supabase.auth
				.getSession()
				.then(({ data: { session } }) => session);
		}
		return sessionPromise;
	};

	event.locals.getUser = () => {
		if (!userPromise) {
			userPromise = event.locals.supabase.auth
				.getUser()
				.then(({ data: { user } }) => user);
		}
		return userPromise;
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
