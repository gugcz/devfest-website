export interface NewInvoice {
    countTicketsNormal?: number;
    countTicketsVIP?: number;
    email: string;
    companyName: string;
    street: string;
    city: string;
    zip: string;
    registrationNumberIC: string;
    vatNumber?: string;
    country: string;
  }
