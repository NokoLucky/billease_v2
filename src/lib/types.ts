
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';
import { categories } from './mock-data';

export type BillCategory = 'Housing' | 'Utilities' | 'Transportation' | 'Groceries' | 'Subscription' | 'Other';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string for client-side use
  category: BillCategory;
  isPaid: boolean;
  frequency: 'monthly' | 'yearly' | 'one-time';
}

// For adding/updating bills, dueDate can be a Date object for Firestore
export interface BillInput extends Omit<Bill, 'id' | 'dueDate'> {
    dueDate: Date;
}


export interface Category {
  name: BillCategory;
  icon: LucideIcon;
}

export interface UserProfile {
    income: number;
    savingsGoal: number;
    currency: string;
    notifications: {
        dueSoon: boolean;
        paidConfirmation: boolean;
        savingsTips: boolean;
    };
    fcmTokens?: string[]; // Array to store device tokens for push notifications
}

// Schemas and types for AI bill import flow
const categoryNames = categories.map(c => c.name) as [BillCategory, ...BillCategory[]];

export const ParsedBillSchema = z.object({
  name: z.string().describe('The name of the bill (e.g., Netflix, Rent, Electricity).'),
  amount: z.number().describe('The amount due for the bill.'),
  dueDate: z.string().describe("The due date of the bill. It should be a valid date string. If a year isn't specified, assume the current year."),
  category: z.enum(categoryNames).describe('The category of the bill.'),
  frequency: z.enum(['one-time', 'monthly', 'yearly']).default('monthly').describe("The frequency of the bill (e.g., one-time, monthly, yearly). If not specified, 'monthly' is a good default."),
});
export type ParsedBill = z.infer<typeof ParsedBillSchema>;

export const BillImportInputSchema = z.object({
  text: z.string().describe('A block of text containing a list of bills, potentially from a user pasting from a notes app.'),
});
export type BillImportInput = z.infer<typeof BillImportInputSchema>;

export const BillImportOutputSchema = z.object({
  bills: z.array(ParsedBillSchema).describe('An array of bill objects parsed from the input text.'),
});
export type BillImportOutput = z.infer<typeof BillImportOutputSchema>;
