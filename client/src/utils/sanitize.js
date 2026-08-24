import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'a'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

// Ensure hyperlinks always include target="_blank" and rel="noopener noreferrer"
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
    
    // Additional security layer: prevent javascript:, data:, and vbscript: URIs
    const href = node.getAttribute('href');
    if (href && /^(?:javascript|data|vbscript):/i.test(href.trim())) {
      node.removeAttribute('href');
    }
  }
});

export const sanitizePostContent = (dirtyContent) => {
  if (!dirtyContent) return '';
  return DOMPurify.sanitize(dirtyContent, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'img', 'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  });
};
