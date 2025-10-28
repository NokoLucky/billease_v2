import { BillImportInput, BillImportOutput } from '@/lib/types';

// Use your deployed Vercel URL
const API_BASE_URL = 'https://bill-import-api.vercel.app';

export async function importBillsFromText(input: BillImportInput): Promise<BillImportOutput> {
  const response = await fetch(`${API_BASE_URL}/api/import-bills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to import bills');
  }

  return response.json();
}