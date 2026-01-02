import { apiRequest } from '../../lib/api';
import type { AuthResponse, User } from './auth.types';

export async function registerApi(payload: {
    name: string;
    email: string;
    password: string;
}): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: payload
    });
}

export async function loginApi(payload: {
    email: string;
    password: string;
}): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: payload
    });
}

export async function meApi(): Promise<{ success: boolean; user: User }> {
    return apiRequest<{ success: boolean; user: User }>('/auth/me', {
        method: 'GET',
        auth: true
    });
}

export async function logoutApi(): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/auth/logout', {
        method: 'POST',
        auth: true
    });
}
