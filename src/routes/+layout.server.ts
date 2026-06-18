import type { LayoutServerLoad } from './$types'
import { getAndClearErrorCookie } from '$lib/utils/error-cookie'

export const load: LayoutServerLoad = async ({ locals: { getSession }, cookies }) => {
  const session = await getSession()
  const error = getAndClearErrorCookie(cookies)
  return { session, error }
}
