export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: {
        id: number;
        name: string;
        displayName: string;
    };
    isActive: boolean;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    tokenType: 'Bearer';
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    roleId?: number;
}

export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
    roleId: number;
    iat?: number;
    exp?: number;
}
