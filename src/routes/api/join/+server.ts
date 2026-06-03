import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData()
  const inviteCode = formData.get('inviteCode')?.toString() ?? ''

  if (!inviteCode) {
    throw redirect(303, '/?error=Invite+code+required')
  }

  throw redirect(303, `/group/${inviteCode.trim()}`)
}
