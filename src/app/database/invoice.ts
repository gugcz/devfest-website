export interface Invoice {
    countTickets: number;
    email: string;
    companyName: string;
    street: string;
    city: string;
    zip: string;
    registrationNumberIC: string;
    registrationNumberDIC?: string;
    country: string;
}
