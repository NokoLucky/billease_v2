'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { BillImportConfirmation } from '@/components/bill-import-confirmation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { importBillsFromText } from '@/lib/api-client'; // Updated import
import type { ParsedBill } from '@/lib/types';

export default function ImportPage() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedBills, setParsedBills] = useState<ParsedBill[] | null>(null);

  const handleProcessText = async () => {
    if (!text.trim()) {
      setError('Please paste some text to process.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setParsedBills(null);

    try {
      const result = await importBillsFromText({ text });
      if (result.bills.length === 0) {
        setError("We couldn't find any bills in the text you provided. Try formatting it as a simple list.");
      } else {
        setParsedBills(result.bills);
      }
    } catch (e) {
      console.error('Import error:', e);
      setError(e instanceof Error ? e.message : 'An unexpected error occurred while parsing your notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setParsedBills(null);
    setError(null);
  }

  if (parsedBills) {
    return <BillImportConfirmation bills={parsedBills} onCancel={handleReset} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Import from Notes" />
      <main className="flex-1 py-8 px-4 md:px-8 flex items-start justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Paste Your Bills</CardTitle>
            <CardDescription>
              Copy the bill details from your notes app and paste them below. The AI will attempt to extract them automatically. For best results, use one line per bill.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g.&#10;Netflix R199 due on the 5th&#10;Rent R12000 due date is the 1st of the month&#10;Car Payment R3500 20/07/2024"
              className="min-h-48"
              disabled={isLoading}
            />
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <Button onClick={handleProcessText} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process Notes
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}