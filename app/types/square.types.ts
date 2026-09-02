export interface SquareCategory {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface SquareProduct {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface SquareTransaction {
    id: string;
    created_at: string;
    [key: string]: unknown;
}

export interface SquareVendor {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface SquareLocation {
    id: string;
    name: string;
    [key: string]: unknown;
}
