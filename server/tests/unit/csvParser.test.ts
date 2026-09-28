import { parseCsv } from '../../src/utils/csvParser';

describe('CSV Parser', () => {
  it('should parse a valid CSV with standard headers', async () => {
    const csv = Buffer.from(
      'email,first_name,last_name,company\n' +
      'john@example.com,John,Doe,Acme\n' +
      'jane@example.com,Jane,Smith,TechCo'
    );

    const leads = await parseCsv(csv);

    expect(leads).toHaveLength(2);
    expect(leads[0]).toEqual({
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      company: 'Acme',
    });
  });

  it('should handle alternate header names (e.g., "Email Address")', async () => {
    const csv = Buffer.from(
      'Email Address,First Name,Last Name,Organization\n' +
      'bob@test.com,Bob,Wilson,StartupXYZ'
    );

    const leads = await parseCsv(csv);

    expect(leads).toHaveLength(1);
    expect(leads[0].email).toBe('bob@test.com');
    expect(leads[0].first_name).toBe('Bob');
    expect(leads[0].company).toBe('StartupXYZ');
  });

  it('should skip rows without valid email', async () => {
    const csv = Buffer.from(
      'email,first_name\n' +
      'valid@test.com,Alice\n' +
      'not-an-email,Bob\n' +
      ',Charlie'
    );

    const leads = await parseCsv(csv);

    expect(leads).toHaveLength(1);
    expect(leads[0].email).toBe('valid@test.com');
  });

  it('should lowercase and trim emails', async () => {
    const csv = Buffer.from(
      'email,first_name\n' +
      '  John@Example.COM  ,John'
    );

    const leads = await parseCsv(csv);

    expect(leads).toHaveLength(1);
    expect(leads[0].email).toBe('john@example.com');
  });

  it('should handle extra columns as custom fields', async () => {
    const csv = Buffer.from(
      'email,first_name,title,linkedin_url\n' +
      'john@test.com,John,CTO,https://linkedin.com/in/john'
    );

    const leads = await parseCsv(csv);

    expect(leads).toHaveLength(1);
    expect(leads[0].email).toBe('john@test.com');
    expect(leads[0].title).toBe('CTO');
    expect(leads[0].linkedin_url).toBe('https://linkedin.com/in/john');
  });

  it('should handle empty CSV', async () => {
    const csv = Buffer.from('email,first_name\n');
    const leads = await parseCsv(csv);
    expect(leads).toHaveLength(0);
  });
});
