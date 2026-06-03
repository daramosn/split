import { getGroupsByOwner, deleteGroup } from '$lib/server/store'
import type { PageServerLoad, Actions } from './$types'

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

export const actions: Actions = {
  deleteGroup: async ({ request, locals: { supabase, getUser } }) => {
    const user = await getUser()
    if (!user) {
      return { error: 'You must be signed in to delete a group' }
    }

    const formData = await request.formData()
    const groupId = formData.get('groupId')?.toString()
    if (!groupId) return { error: 'Missing group ID' }

    const groups = await getGroupsByOwner(supabase, user.id)
    const group = groups.find((g) => g.id === groupId)
    if (!group) return { error: 'Group not found' }

    if (group.ownerId !== user.id) {
      return { error: 'Only the group owner can delete the group' }
    }

    const success = await deleteGroup(supabase, groupId)
    if (!success) return { error: 'Failed to delete group' }

    return { success: true }
  },
}
