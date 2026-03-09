import { z } from 'zod';

export type BillCategory = 'Housing' | 'Utilities' | 'Transportation' | 'Groceries' | 'Subscription' | 'Other';

export const categories: { name: BillCategory }[] = [
  { name: 'Housing' },
  { name: 'Utilities' },
  { name: 'Transportation' },
  { name: 'Groceries' },
  { name: 'Subscription' },
  { name: 'Other' },
];

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  isPaid: boolean;
  frequency: 'monthly' | 'yearly' | 'one-time';
  lastPaidDate?: string; // ISO string — used to auto-reset recurring bills each period
}

export interface BillInput extends Omit<Bill, 'id' | 'dueDate'> {
  dueDate: Date;
}

export interface UserProfile {
  income: number;
  savingsGoal: number;
  currency: string;
  onboardingComplete: boolean;
  notifications: {
    dueSoon: boolean;
    paidConfirmation: boolean;
    savingsTips: boolean;
  };
  fcmTokens?: string[];
}

const categoryNames = categories.map(c => c.name) as [BillCategory, ...BillCategory[]];

export const ParsedBillSchema = z.object({
  name: z.string().describe('The name of the bill (e.g., Netflix, Rent, Electricity).'),
  amount: z.number().describe('The amount due for the bill.'),
  dueDate: z.string().describe("The due date of the bill. If a year isn't specified, assume the current year."),
  category: z.enum(categoryNames).describe('The category of the bill.'),
  frequency: z.enum(['one-time', 'monthly', 'yearly']).default('monthly').describe("The frequency of the bill."),
});
export type ParsedBill = z.infer<typeof ParsedBillSchema>;

export const BillImportInputSchema = z.object({
  text: z.string().describe('A block of text containing a list of bills.'),
});
export type BillImportInput = z.infer<typeof BillImportInputSchema>;

export const BillImportOutputSchema = z.object({
  bills: z.array(ParsedBillSchema).describe('An array of bill objects parsed from the input text.'),
});
export type BillImportOutput = z.infer<typeof BillImportOutputSchema>;
