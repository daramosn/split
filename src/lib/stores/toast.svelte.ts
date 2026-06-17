export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
}

const toasts = $state<Toast[]>([]);

const DEFAULT_DURATION = 5000;

export function addToast(message: string, type: ToastType = 'info', duration = DEFAULT_DURATION) {
	const id = crypto.randomUUID();
	toasts.push({ id, message, type });
	if (duration > 0) {
		setTimeout(() => removeToast(id), duration);
	}
	return id;
}

export function removeToast(id: string) {
	const index = toasts.findIndex((t) => t.id === id);
	if (index > -1) toasts.splice(index, 1);
}

export function getToasts(): Toast[] {
	return toasts;
}
