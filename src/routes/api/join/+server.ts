import { getGroup } from '$lib/server/store';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const groupId = formData.get('groupId')?.toString() ?? '';

	const group = getGroup(groupId.trim());
	if (!group) {
		throw redirect(303, '/?error=Group+not+found');
	}

	throw redirect(303, `/group/${groupId}`);
};