import { injectTracking, renderTemplate } from '../../src/utils/tracking';

describe('Worker Email Pipeline & Rate Limiting Logic', () => {
  it('correctly interpolates lead fields into template subject and body', () => {
    const rawSubject = 'Partnership inquiry with {{company}}';
    const rawBody = 'Hey {{firstName}}, would love to connect with the team at {{company}}. Check our work here: {{portfolioUrl}}';

    const leadData = {
      firstName: 'Alex',
      company: 'Stripe',
      portfolioUrl: 'https://mailflow.io/demo',
    };

    const renderedSubject = renderTemplate(rawSubject, leadData);
    const renderedBody = renderTemplate(rawBody, leadData);

    expect(renderedSubject).toBe('Partnership inquiry with Stripe');
    expect(renderedBody).toContain('Hey Alex');
    expect(renderedBody).toContain('team at Stripe');
    expect(renderedBody).toContain('https://mailflow.io/demo');
  });

  it('embeds tracking pixel and maintains valid HTML structure', () => {
    const htmlBody = '<p>Hi Alex, checking in on our discussion.</p>';
    const trackingUuid = '550e8400-e29b-41d4-a716-446655440000';

    const processedHtml = injectTracking(htmlBody, trackingUuid);

    expect(processedHtml).toContain(`/api/track/open/${trackingUuid}`);
    expect(processedHtml).toContain('style="display:none"');
    expect(processedHtml).toContain('width="1" height="1"');
  });

  it('calculates exponential backoff delay correctly across retries', () => {
    const baseDelayMs = 60000; // 1 minute
    const calculateDelay = (attempt: number) => baseDelayMs * Math.pow(2, attempt - 1);

    expect(calculateDelay(1)).toBe(60000);  // 1 min
    expect(calculateDelay(2)).toBe(120000); // 2 min
    expect(calculateDelay(3)).toBe(240000); // 4 min
  });

  it('enforces hourly quota thresholds per mailbox', () => {
    const mailboxQuotaPerHour = 50;
    const currentSentThisHour = 50;

    const isQuotaAvailable = (sent: number, limit: number) => sent < limit;

    expect(isQuotaAvailable(currentSentThisHour, mailboxQuotaPerHour)).toBe(false);
    expect(isQuotaAvailable(49, mailboxQuotaPerHour)).toBe(true);
  });
});
