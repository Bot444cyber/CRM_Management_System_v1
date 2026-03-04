const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

/**
 * A fetch wrapper that automatically:
 * 1. Attaches the Bearer token from localStorage.
 * 2. On a 401 response, silently refreshes the access token using the stored refresh token.
 * 3. Retries the original request with the new token.
 * 4. Redirects to /login if the refresh also fails.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const getToken = () =>
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const buildHeaders = (token: string | null): Record<string, string> => ({
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    // First attempt
    let res = await fetch(input, { ...init, headers: buildHeaders(getToken()) });

    if (res.status !== 401) return res;

    // --- Token expired: try silent refresh ---
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    if (!refreshToken) {
        redirectToLogin();
        return res;
    }

    const refreshRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) {
        redirectToLogin();
        return res;
    }

    const { accessToken } = await refreshRes.json();
    localStorage.setItem("accessToken", accessToken);

    // Retry the original request with the new token
    res = await fetch(input, { ...init, headers: buildHeaders(accessToken) });
    return res;
}

function redirectToLogin() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
    }
}
