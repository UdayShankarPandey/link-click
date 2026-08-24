import { sanitizePostContent } from './sanitize.js';

// Note: This test file is provided for when a frontend test runner (like Vitest or Jest) is configured.
// It verifies that the shared sanitization utility correctly neutralizes XSS payloads while preserving safe HTML.

describe('XSS Sanitization', () => {
  it('neutralizes basic script tags', () => {
    const malicious = '<script>alert(1)</script>';
    expect(sanitizePostContent(malicious)).toBe('');
  });

  it('neutralizes image onerror handlers', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    // img tags are forbidden entirely by the config, so the whole tag is stripped.
    expect(sanitizePostContent(malicious)).toBe('');
  });

  it('neutralizes svg onload handlers', () => {
    const malicious = '<svg onload=alert(1)>';
    expect(sanitizePostContent(malicious)).toBe('');
  });

  it('neutralizes javascript: URIs in links', () => {
    const malicious = '<a href="javascript:alert(1)">Click</a>';
    // The tag is allowed, but the href should be stripped by the afterSanitizeAttributes hook
    const sanitized = sanitizePostContent(malicious);
    expect(sanitized).toBe('<a>Click</a>');
  });

  it('preserves legitimate rich text formatting', () => {
    const legitimate = '<b>Bold</b> and <i>Italic</i> with a <a href="https://example.com">Link</a>';
    const sanitized = sanitizePostContent(legitimate);
    // DOMPurify might inject target and rel based on our hooks
    expect(sanitized).toContain('<b>Bold</b>');
    expect(sanitized).toContain('<i>Italic</i>');
    expect(sanitized).toContain('href="https://example.com"');
    expect(sanitized).toContain('target="_blank"');
    expect(sanitized).toContain('rel="noopener noreferrer"');
  });
});
