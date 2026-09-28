import env from '../config/env';

// 1x1 transparent gif pixel for tracking opens
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * Generates a tracking pixel <img> tag to embed in email HTML.
 */
export function getTrackingPixelUrl(trackingId: string): string {
  return `${env.tracking.baseUrl}/api/track/open/${trackingId}`;
}

/**
 * Wraps a URL in a tracking redirect.
 * When the recipient clicks the link, it hits our server first (recording the click),
 * then redirects to the original URL.
 */
export function getTrackingLinkUrl(linkTrackingId: string): string {
  return `${env.tracking.baseUrl}/api/track/click/${linkTrackingId}`;
}

/**
 * Returns the raw 1x1 transparent GIF buffer.
 */
export function getPixelBuffer(): Buffer {
  return TRACKING_PIXEL;
}

/**
 * Replaces template variables like {{firstName}}, {{company}} etc. with actual lead data.
 */
export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return key in variables ? variables[key] : match;
  });
}

/**
 * Injects tracking pixel and rewrites links in the email body.
 */
export function injectTracking(html: string, trackingId: string): string {
  const pixelTag = `<img src="${getTrackingPixelUrl(trackingId)}" width="1" height="1" style="display:none" alt="" />`;

  // append pixel at the end of body
  let result = html;
  if (result.includes('</body>')) {
    result = result.replace('</body>', `${pixelTag}</body>`);
  } else {
    result += pixelTag;
  }

  return result;
}
