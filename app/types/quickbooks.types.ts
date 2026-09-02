export interface QuickBooksAuthResponse {
    accessToken: string;
    refreshToken: string;
    realmId: string;
}

export interface QuickBooksCategory {
    Id: string;
    Name: string;
    FullyQualifiedName: string;
    Active: boolean;
    SubCategory: boolean;
    SyncToken: string;
}

export interface QuickBooksProduct {
    Id: string;
    Name: string;
    SKU: string;
    QtyOnHand: number;
    Type: string;
    Active: boolean;
    SyncToken: string;
}

export interface QuickBooksCustomer {
    Id: string;
    DisplayName: string;
    PrimaryEmailAddr: { Address: string };
    GivenName: string;
    FamilyName: string;
    Active: boolean;
    SyncToken: string;
}

export interface QuickBooksTransaction {
    Id: string;
    TxnDate: string;
    TotalAmt: number;
    TxnType: string;
    SyncToken: string;
}

export interface QuickBooksSyncResult {
    created: number;
    updated: number;
    skipped: number;
    errors: number;
    details?: unknown[];
}
