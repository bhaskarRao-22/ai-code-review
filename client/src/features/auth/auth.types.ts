export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

export interface AuthResponse {
    success: boolean;
    user: User;
    accessToken: string;
}
