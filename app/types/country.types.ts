export interface Country {
    id: number;
    name: string;
    code: string;
    states?: State[];
}

export interface State {
    id: number;
    countryId: number;
    name: string;
    code: string;
}
