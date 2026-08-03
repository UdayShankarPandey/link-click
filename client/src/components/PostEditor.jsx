import React, { useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Bold, Italic, Link as LinkIcon } from 'lucide-react';

const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'a'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

// Ensure hyperlinks always include target="_blank" and rel="noopener noreferrer"
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const sanitizePostContent = (dirtyContent) => {
  if (!dirtyContent) return '';
  return DOMPurify.sanitize(dirtyContent, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'img', 'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  });
};

const PostEditor = ({ value = '', onChange, placeholder = 'Write your thoughts...', maxLength = 5000 }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const rawHtml = editorRef.current.innerHTML;
    const sanitized = sanitizePostContent(rawHtml);
    const plainText = editorRef.current.innerText || '';

    if (plainText.length > maxLength) {
      // Restore previous state if over limit
      editorRef.current.innerHTML = value;
      return;
    }

    if (onChange) {
      onChange(sanitized);
    }
  };

  // TECHNICAL DEBT NOTE: document.execCommand is deprecated in modern web standards but intentionally preserved for lightweight rich text formatting compatibility without introducing heavy external RTE dependencies.
  const applyFormat = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleAddLink = () => {
    const url = prompt('Enter link URL (http:// or https://):');
    if (url) {
      const formattedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      applyFormat('createLink', formattedUrl);
    }
  };

  const currentLength = editorRef.current?.innerText?.length || 0;

  return (
    <div className="border border-border/80 rounded-2xl bg-canvas overflow-hidden focus-within:border-amber transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-surface/50 border-b border-border/60">
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          title="Bold"
          aria-label="Bold"
          className="p-2 rounded-xl text-text-secondary hover:text-amber hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          title="Italic"
          aria-label="Italic"
          className="p-2 rounded-xl text-text-secondary hover:text-amber hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleAddLink}
          title="Add Link"
          aria-label="Add Link"
          className="p-2 rounded-xl text-text-secondary hover:text-amber hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <div className="ml-auto text-xs text-text-tertiary font-mono px-2">
          {currentLength}/{maxLength}
        </div>
      </div>

      {/* Editable Field */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        aria-multiline="true"
        aria-label="Rich text post content editor"
        data-placeholder={placeholder}
        className="p-4 min-h-35 text-sm text-text-primary focus:outline-none leading-relaxed prose prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-text-tertiary"
      />
    </div>
  );
};

export default PostEditor;
