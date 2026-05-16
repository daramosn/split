import { createGroup } from '$lib/server/store';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createGroupSchema, parseFormData } from '$lib/server/schemas';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const parsed = parseFormData(createGroupSchema, formData);

		if ('error' in parsed) {
			return { error: parsed.error };
		}

		const group = createGroup(parsed.name.trim(), parsed.description?.trim() ?? '', parsed.currency ?? 'USD', []);
		throw redirect(303, `/group/${group.id}`);
	}
};