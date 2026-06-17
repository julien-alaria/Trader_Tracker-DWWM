export function buildWatchlistData(rawWatchlist, allAssets) {
    if (!rawWatchlist || !allAssets) return [];

    return rawWatchlist.map(w => {
        const asset = allAssets.find(a => a.ticker === w.ticker);
        return {
            ...w,
            ...asset,
            isFollowed: true
        };
    });
}