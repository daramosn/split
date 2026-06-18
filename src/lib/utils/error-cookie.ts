import type { Cookies } from '@sveltejs/kit'

const ERROR_COOKIE = 'app_error'

export function setErrorCookie(cookies: Cookies, message: string) {
	cookies.set(ERROR_COOKIE, message, {
		path: '/',
		maxAge: 10, // 10 seconds
		httpOnly: false, // Client needs to read it
		sameSite: 'lax'
	})
}

export function getAndClearErrorCookie(cookies: Cookies): string | null {
	const error = cookies.get(ERROR_COOKIE)
	if (error) {
		cookies.delete(ERROR_COOKIE, { path: '/' })
		return error
	}
	return null
}
