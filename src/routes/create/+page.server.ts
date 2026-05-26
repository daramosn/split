import { createGroup } from '$lib/server/store';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createGroupSchema, parseFormData } from '$lib/server/schemas';

export const load: PageServerLoad = async ({ locals: { getUser } }) => {
	const user = await getUser();
	if (!user) {
		throw redirect(303, '/?auth_required=create');
	}
	return { user };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, getUser } }) => {
		const user = await getUser();
		if (!user) {
			throw redirect(303, '/?auth_required=create');
		}

		const formData = await request.formData();
		const parsed = parseFormData(createGroupSchema, formData);

		if ('error' in parsed) {
			return { error: parsed.error };
		}

		const { data: group, error } = await supabase
			.from('groups')
			.insert({
				name: parsed.name.trim(),
				description: parsed.description?.trim() ?? '',
				currency: parsed.currency ?? 'USD',
				owner_id: user.id
			})
			.select()
			.single();

		if (error || !group) {
			return { error: 'Failed to create group. Please try again.' };
		}

		throw redirect(303, `/group/${group.invite_code}`);
	}
};