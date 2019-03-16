export interface Partner {
    name: string;
    order: number;
    top: boolean;
    companies: Company[];
}

export interface Company {
    name: string;
    url: string;
    photoPath: string;
}