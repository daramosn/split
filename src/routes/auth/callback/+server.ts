import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { setErrorCookie } from '$lib/utils/error-cookie';

export const GET: RequestHandler = async ({ url, locals: { supabase }, cookies }) => {
	const code = url.searchParams.get('code');

	let next = cookies.get('auth_redirect') ?? '/';
	cookies.delete('auth_redirect', { path: '/' });

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			throw redirect(303, next);
		}
	}

	setErrorCookie(cookies, 'Authentication failed. Please try again.');
	throw redirect(303, '/');
};