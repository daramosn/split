import { redirect } from '@sveltejs/kit';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { createClient } from './client';
import { createClient as createServerClient } from './server';
import type { Cookies } from '@sveltejs/kit';

export interface AuthUser {
	id: string;
	email: string;
	fullName: string;
	avatarUrl: string | null;
}

export async function getSession(supabase: SupabaseClient): Promise<Session | null> {
	const { data: { session } } = await supabase.auth.getSession();
	return session;
}

export async function getUser(supabase: SupabaseClient): Promise<User | null> {
	const { data: { user } } = await supabase.auth.getUser();
	return user;
}

export async function signInWithGoogle(supabase: SupabaseClient) {
	await supabase.auth.signInWithOAuth({
		provider: 'google',
		options: {
			redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
		}
	});
}

export async function signOut(supabase: SupabaseClient) {
	await supabase.auth.signOut();
}

export function isAuthenticated(session: Session | null): boolean {
	return session !== null && session.user !== null;
}

export function requireAuth(session: Session | null, redirectTo: string = '/'): User {
	if (!session?.user) {
		throw redirect(303, redirectTo);
	}
	return session.user;
}

export async function getAuthenticatedSupabase(cookies: Cookies) {
	const supabase = createServerClient(cookies);
	const session = await getSession(supabase);
	return { supabase, session };
}

export async function getOptionalSupabase(cookies: Cookies) {
	const supabase = createServerClient(cookies);
	const session = await getSession(supabase);
	return { supabase, session, user: session?.user ?? null };
}

export function extractProfile(user: User | null): AuthUser | null {
	if (!user) return null;
	return {
		id: user.id,
		email: user.email ?? '',
		fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? '',
		avatarUrl: user.user_metadata?.avatar_url ?? null
	};
}