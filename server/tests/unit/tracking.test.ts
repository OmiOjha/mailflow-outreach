import { renderTemplate, injectTracking, getTrackingPixelUrl } from '../../src/utils/tracking';

describe('Tracking Utils', () => {
  describe('renderTemplate', () => {
    it('should replace template variables', () => {
      const template = 'Hi {{firstName}}, how is {{company}}?';
      const result = renderTemplate(template, {
        firstName: 'John',
        company: 'Acme',
      });
      expect(result).toBe('Hi John, how is Acme?');
    });

    it('should leave unmatched variables as-is', () => {
      const template = 'Hi {{firstName}}, your {{unknownField}} is great';
      const result = renderTemplate(template, { firstName: 'Sarah' });
      expect(result).toBe('Hi Sarah, your {{unknownField}} is great');
    });

    it('should handle template with no variables', () => {
      const template = 'Just a plain string';
      const result = renderTemplate(template, { firstName: 'John' });
      expect(result).toBe('Just a plain string');
    });

    it('should handle empty variables', () => {
      const template = 'Hi {{firstName}}';
      const result = renderTemplate(template, { firstName: '' });
      expect(result).toBe('Hi ');
    });
  });

  describe('injectTracking', () => {
    it('should inject pixel before </body> tag', () => {
      const html = '<html><body><p>Hello</p></body></html>';
      const result = injectTracking(html, 'test-tracking-id');

      expect(result).toContain('test-tracking-id');
      expect(result).toContain('<img src=');
      expect(result).toContain('width="1"');
      // pixel should be before </body>
      const pixelIndex = result.indexOf('<img src=');
      const bodyIndex = result.indexOf('</body>');
      expect(pixelIndex).toBeLessThan(bodyIndex);
    });

    it('should append pixel at the end if no </body> tag', () => {
      const html = '<p>Just a paragraph</p>';
      const result = injectTracking(html, 'track-123');

      expect(result).toContain('track-123');
      expect(result.endsWith('alt="" />'));
    });
  });

  describe('getTrackingPixelUrl', () => {
    it('should generate correct tracking URL', () => {
      const url = getTrackingPixelUrl('abc-123');
      expect(url).toContain('/api/track/open/abc-123');
    });
  });
});
