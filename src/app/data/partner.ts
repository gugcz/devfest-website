import Company from './company';

export default interface Partner {
  name: string;
  order: number;
  top: boolean;
  main: boolean;
  companies: Company[];
  self: boolean;
}

