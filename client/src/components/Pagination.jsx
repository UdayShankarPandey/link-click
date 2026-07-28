import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Pages to show on each side of current

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages.at(-1) !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers().map((pageNum, idx) =>
        pageNum === '...' ? (
          <span key={`dots-${idx}`} className="px-2 text-text-tertiary text-sm">
            …
          </span>
        ) : (
          <button
            type="button"
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              pageNum === page
                ? 'bg-amber text-text-inverse'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-border'
            }`}
            aria-current={pageNum === page ? 'page' : undefined}
          >
            {pageNum}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
