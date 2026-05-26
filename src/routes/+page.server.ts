import { getGroupsByOwner } from '$lib/server/store'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({
  locals: { getUser, supabase },
}) => {
  const user = await getUser()

  if (!user) {
    return { groups: [], user: null }
  }

  const groups = await getGroupsByOwner(supabase, user.id)
  return { groups, user }
}
