import { parse } from 'csv-parse';
import { Readable } from 'stream';

interface CsvLead {
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  [key: string]: string | undefined;
}

// common header aliases people use in their CSV files
const FIELD_MAP: Record<string, string> = {
  'email': 'email',
  'email address': 'email',
  'e-mail': 'email',
  'first name': 'first_name',
  'firstname': 'first_name',
  'first': 'first_name',
  'last name': 'last_name',
  'lastname': 'last_name',
  'last': 'last_name',
  'company': 'company',
  'company name': 'company',
  'organization': 'company',
  'org': 'company',
};

function normalizeHeader(header: string): string {
  const lower = header.trim().toLowerCase();
  return FIELD_MAP[lower] || lower;
}

export async function parseCsv(buffer: Buffer): Promise<CsvLead[]> {
  return new Promise((resolve, reject) => {
    const leads: CsvLead[] = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(
        parse({
          columns: (headers: string[]) => headers.map(normalizeHeader),
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
        })
      )
      .on('data', (row: Record<string, string>) => {
        if (!row.email || !row.email.includes('@')) return; // skip invalid rows

        const { email, first_name, last_name, company, ...rest } = row;
        leads.push({
          email: email.toLowerCase().trim(),
          first_name: first_name || undefined,
          last_name: last_name || undefined,
          company: company || undefined,
          ...rest,
        });
      })
      .on('end', () => resolve(leads))
      .on('error', reject);
  });
}
