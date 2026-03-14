import React from 'react';

export default function Paginator({ total, page, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const go = (p) => onChange(Math.min(totalPages, Math.max(1, p)));

  return (
    <div className="pagination">
      <button disabled={page<=1} onClick={()=>go(page-1)}>«</button>
      <span>{page}/{totalPages}</span>
      <button disabled={page>=totalPages} onClick={()=>go(page+1)}>»</button>
    </div>
  );
}