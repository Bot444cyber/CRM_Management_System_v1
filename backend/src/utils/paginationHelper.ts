/**
 * Parses ?page and ?limit query params, returns validated values + offset.
 * page is 1-based. Defaults: page=1, limit=10. Max limit: 100.
 */
export function parsePagination(query: Record<string, any>): {
    page: number;
    limit: number;
    offset: number;
} {
    const page = Math.max(1, parseInt(query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}

/**
 * Builds the standard paginated response envelope.
 */
export function paginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
) {
    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
