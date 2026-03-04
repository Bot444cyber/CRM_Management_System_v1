"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.paginatedResponse = paginatedResponse;
/**
 * Parses ?page and ?limit query params, returns validated values + offset.
 * page is 1-based. Defaults: page=1, limit=10. Max limit: 100.
 */
function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}
/**
 * Builds the standard paginated response envelope.
 */
function paginatedResponse(data, total, page, limit) {
    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
