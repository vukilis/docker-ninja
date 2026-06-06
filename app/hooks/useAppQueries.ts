import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAppDetail, getComposeContent, getGlobalStats, incrementCopyCount, toggleAppLike } from '../actions';

export function useAppDetail(slug: string | undefined) {
	return useQuery({
		queryKey: ['app', 'detail', slug],
		queryFn: () => fetchAppDetail(slug as string),
		enabled: !!slug,
	});
}

export function useComposeContent(slug: string | undefined) {
	return useQuery({
		queryKey: ['app', 'compose', slug],
		queryFn: () => getComposeContent(slug as string),
		enabled: !!slug,
	});
}

export function useGlobalStats() {
	return useQuery({
		queryKey: ['global', 'stats'],
		queryFn: getGlobalStats,
	});
}

export function useIncrementCopyCount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: incrementCopyCount,
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['global', 'stats'] });
		},
	});
}

export function useToggleAppLike() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ appSlug, isLiked, deviceUuid }: { appSlug: string; isLiked: boolean; deviceUuid: string }) =>
			toggleAppLike(appSlug, isLiked, deviceUuid),
		onMutate: async ({ appSlug, isLiked }) => {
			await queryClient.cancelQueries({ queryKey: ['app', 'detail', appSlug] });
			const previousDetail = queryClient.getQueryData(['app', 'detail', appSlug]);
			const previousLikes = queryClient.getQueryData(['likes', 'global']);

			queryClient.setQueryData(['likes', 'global'], (old: Record<string, number> = {}) => {
				const current = old[appSlug] ?? 0;
				return { ...old, [appSlug]: isLiked ? Math.max(0, current - 1) : current + 1 };
			});

			return { previousDetail, previousLikes };
		},
		onError: (_err, { appSlug }, context) => {
			if (context?.previousLikes) {
				queryClient.setQueryData(['likes', 'global'], context.previousLikes);
			}
		},
		onSettled: (_data, _err, { appSlug }) => {
			queryClient.invalidateQueries({ queryKey: ['app', 'detail', appSlug] });
			queryClient.invalidateQueries({ queryKey: ['likes', 'global'] });
		},
	});
}
