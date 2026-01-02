import { API_BASE_URL } from './config';
import { getAccessToken, setAccessToken, clearAccessToken } from './token';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions {
    method?: HttpMethod;
    body?: any;
    auth?: boolean; // auth chahiye toh true
}

async function refreshAccessToken(): Promise<string | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data?.accessToken) {
            setAccessToken(data.accessToken);
            return data.accessToken;
        }

        return null;
    } catch {
        return null;
    }
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { method = 'GET', body, auth = false } = options;

    async function doRequest(withNewToken = false): Promise<Response> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        let token = getAccessToken();
        if (withNewToken) {
            token = getAccessToken();
        }

        if (auth && token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            credentials: 'include', // refresh ke liye cookies
            body: body ? JSON.stringify(body) : undefined
        });
    }

    // 1st try
    let res = await doRequest(false);

    // 401 and auth needed → try refresh once
    if (auth && res.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
            clearAccessToken();
            throw new Error('Session expired. Please log in again.');
        }
        res = await doRequest(true);
    }

    if (!res.ok) {
        const errorText = await res.text();
        let message = 'Request failed';

        try {
            const data = JSON.parse(errorText);
            message = data.message || message;
        } catch {
            // ignore
        }

        throw new Error(message);
    }

    return res.json() as Promise<T>;
}
