import { getAllGroups } from '$lib/server/store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const groups = getAllGroups();
	return { groups };
};