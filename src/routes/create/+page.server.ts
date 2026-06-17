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

		if (!parsed.success) {
			return {
				error: parsed.error,
				values: {
					name: (formData.get('name')?.toString() ?? ''),
					description: (formData.get('description')?.toString() ?? ''),
					currency: (formData.get('currency')?.toString() ?? 'USD')
				}
			};
		}

		const { data: group, error } = await supabase
			.from('groups')
			.insert({
				name: parsed.data.name.trim(),
				description: parsed.data.description?.trim() ?? '',
				currency: parsed.data.currency ?? 'USD',
				owner_id: user.id
			})
			.select()
			.single();

		if (error || !group) {
			return {
				error: 'Failed to create group. Please try again.',
				values: {
					name: parsed.data.name,
					description: parsed.data.description ?? '',
					currency: parsed.data.currency ?? 'USD'
				}
			};
		}

		throw redirect(303, `/group/${group.invite_code}`);
	}
};