describe('Job & Lead Pipeline Repository Operations', () => {
  it('deduplicates emails case-insensitively before persistence', () => {
    const rawBatch = [
      { email: 'John.Doe@ACME.com', first_name: 'John', company: 'Acme' },
      { email: 'john.doe@acme.com', first_name: 'John', company: 'Acme Corp' },
      { email: 'sarah@startup.io', first_name: 'Sarah', company: 'Startup' },
    ];

    const uniqueEmails = new Map<string, typeof rawBatch[0]>();
    for (const item of rawBatch) {
      const normalized = item.email.toLowerCase().trim();
      if (!uniqueEmails.has(normalized)) {
        uniqueEmails.set(normalized, { ...item, email: normalized });
      }
    }

    const cleaned = Array.from(uniqueEmails.values());
    expect(cleaned).toHaveLength(2);
    expect(cleaned[0].email).toBe('john.doe@acme.com');
  });

  it('determines the next sequencing step for leads in flight', () => {
    const totalStepsInSequence = 4;
    const getNextStep = (currentStep: number) => {
      if (currentStep >= totalStepsInSequence) return null;
      return currentStep + 1;
    };

    expect(getNextStep(0)).toBe(1);
    expect(getNextStep(1)).toBe(2);
    expect(getNextStep(3)).toBe(4);
    expect(getNextStep(4)).toBeNull(); // Completed sequence
  });
});
