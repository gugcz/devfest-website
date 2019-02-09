export interface Partner {
    name: string;
    order: number;
    top: boolean;
    companies: Company[];
}

interface Company {
    name: string;
    url: string;
    photoPath: string;
}