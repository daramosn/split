import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { setErrorCookie } from '$lib/utils/error-cookie'

export const POST: RequestHandler = async ({ request, cookies }) => {
  const formData = await request.formData()
  const inviteCode = formData.get('inviteCode')?.toString() ?? ''

  if (!inviteCode) {
    setErrorCookie(cookies, 'Invite code is required')
    throw redirect(303, '/')
  }

  throw redirect(303, `/group/${inviteCode.trim()}`)
}
