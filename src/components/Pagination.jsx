import React from 'react';

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (totalPages <= 1) return null;

  const pages = [];
  let startPage = Math.max(1, page - 2);
  let endPage = Math.min(totalPages, page + 2);

  if (endPage - startPage < 4) {
    if (startPage === 1) endPage = Math.min(totalPages, 5);
    else if (endPage === totalPages) startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
      <button 
        className="btn btn-ghost" 
        style={{ padding: '6px 12px' }}
        disabled={page === 1} 
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </button>
      
      {startPage > 1 && (
        <>
          <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => onPageChange(1)}>1</button>
          {startPage > 2 && <span style={{ color: 'var(--muted)' }}>...</span>}
        </>
      )}

      {pages.map(p => (
        <button 
          key={p} 
          className={`btn ${page === p ? 'btn-primary' : 'btn-ghost'}`} 
          style={{ padding: '6px 12px', minWidth: '36px' }}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span style={{ color: 'var(--muted)' }}>...</span>}
          <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button 
        className="btn btn-ghost" 
        style={{ padding: '6px 12px' }}
        disabled={page === totalPages} 
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
