const fs = require('fs');
const path = require('path');

const projectStructure = {
  'package.json': `{
  "name": "bill-import-api",
  "version": "1.0.0",
  "description": "Standalone API for parsing bills from text using Groq",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0"
  }
}`,

  'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;`,

  'vercel.json': `{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "methods": ["POST", "OPTIONS"],
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    }
  ]
}`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,

  '.env.local': `GROQ_API_KEY=your_groq_api_key_here`,

  'app/lib/types.ts': `import { z } from 'zod';

export const BillImportInputSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

export const ParsedBillSchema = z.object({
  name: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
  category: z.string(),
  frequency: z.enum(['monthly', 'weekly', 'yearly', 'once']).default('monthly'),
});

export const BillImportOutputSchema = z.object({
  bills: z.array(ParsedBillSchema),
});

export type BillImportInput = z.infer<typeof BillImportInputSchema>;
export type ParsedBill = z.infer<typeof ParsedBillSchema>;
export type BillImportOutput = z.infer<typeof BillImportOutputSchema>;
`,

  'app/utils/groq-client.ts': `import { BillImportOutput } from '../lib/types';

const categories = [
  'Utilities', 
  'Rent/Mortgage', 
  'Insurance', 
  'Subscriptions', 
  'Loans', 
  'Credit Cards', 
  'Medical', 
  'Transportation', 
  'Entertainment', 
  'Other'
];

export async function parseBillsWithGroq(text: string): Promise<BillImportOutput> {
  const currentDate = new Date();
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const lastDayFormatted = lastDayOfMonth.toISOString().split('T')[0];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${process.env.GROQ_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: \`You are an expert at parsing unstructured text and extracting financial bill information. Extract bill information from the provided text and return it as valid JSON.

IMPORTANT INSTRUCTIONS:
- Available categories: \${categories.join(', ')}
- If no due date is mentioned, set it to \${lastDayFormatted} (last day of current month)
- Convert amounts to numbers (remove currency symbols)
- Dates must be in YYYY-MM-DD format
- If frequency isn't specified, assume 'monthly'
- Only extract bills that have both a name and amount
- Return exactly this JSON structure: { "bills": [{ "name": string, "amount": number, "dueDate": string, "category": string, "frequency": string }] }

Example output:
{
  "bills": [
    {
      "name": "Netflix",
      "amount": 199,
      "dueDate": "2024-12-05",
      "category": "Subscriptions",
      "frequency": "monthly"
    }
  ]
}\`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`Groq API error: \${response.status} \${response.statusText} - \${errorText}\`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response content from Groq API');
  }

  try {
    const parsed = JSON.parse(content);
    
    if (!parsed.bills || !Array.isArray(parsed.bills)) {
      throw new Error('Invalid response format: missing bills array');
    }

    return parsed;
  } catch (parseError) {
    console.error('Failed to parse Groq response:', content);
    throw new Error('Invalid JSON response from AI');
  }
}
`,

  'app/api/import-bills/route.ts': `import { NextRequest, NextResponse } from 'next/server';
import { BillImportInputSchema } from '../../lib/types';
import { parseBillsWithGroq } from '../../utils/groq-client';

export async function POST(request: NextRequest) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  });

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers, status: 200 });
  }

  if (request.method !== 'POST') {
    return new NextResponse(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers, status: 405 }
    );
  }

  try {
    const body = await request.json();
    
    const validationResult = BillImportInputSchema.safeParse(body);
    if (!validationResult.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        }),
        { headers, status: 400 }
      );
    }

    const { text } = validationResult.data;
    const result = await parseBillsWithGroq(text);
    
    return new NextResponse(
      JSON.stringify(result),
      { headers, status: 200 }
    );
  } catch (error) {
    console.error('Error parsing bills:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to parse bills',
        details: errorMessage
      }),
      { headers, status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
`
};

function createProject() {
  const apiDir = path.join(process.cwd(), 'bill-import-api');
  
  // Create main directory
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
    console.log('📁 Created bill-import-api directory');
  }

  // Create all files
  Object.entries(projectStructure).forEach(([filePath, content]) => {
    const fullPath = path.join(apiDir, filePath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write file
    fs.writeFileSync(fullPath, content);
    console.log(`📄 Created ${filePath}`);
  });

  console.log('\n✅ Standalone API project created successfully!');
  console.log('\nNext steps:');
  console.log('1. cd bill-import-api');
  console.log('2. Update GROQ_API_KEY in .env.local');
  console.log('3. Run: npm install');
  console.log('4. Deploy to Vercel: vercel --prod');
}

createProject();