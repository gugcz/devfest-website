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
  facturoidContactFound?: boolean;
  facturoidContactId?: number;
  facturoidInvoiceFound?: boolean;
  faktruoidInvoiceId?: number;
  fakturoidInvoicePaid?: boolean;
  fakturoidInvoicePaidAmmount?: boolean;
  fakturoidInvoiceVariable?: string;
  sendGridDiscountSended?: boolean;
  sendGridEmailSended?: boolean;
  titoDiscountCode?: string;
  titoDiscountCodeGenerated?: boolean;
  titoDiscountLink?: string;
}
