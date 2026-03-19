import React, { useState } from 'react';
import * as api from '../services/apiClient.js';

export default function Categories() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [dummy, setDummy] = useState(0); // eslint-disable-line no-unused-vars
  const cats = api.listCategories();

  const create = () => {
    if (!name || !slug) return;
    try { api.createCategory({ name, slug }); setName(''); setSlug(''); setDummy(x=>x+1); }
    catch (e) { alert(e.message); }
  };

  const update = (id) => {
    const newName = prompt('New name?');
    if (!newName) return;
    try { api.updateCategory(id, { name: newName }); setDummy(x=>x+1); }
    catch (e) { alert(e.message); }
  };

  const del = (id) => { if (confirm('Delete?')) { api.deleteCategory(id); setDummy(x=>x+1); } };

  return (
    <div className="admin-container animate-fade">
      <div className="admin-header">
        <div>
          <h2>Manage Categories</h2>
          <p className="sub-text">Add, edit, and delete manga genres</p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ background: 'var(--card-solid)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, maxWidth: '300px' }}>
            <input placeholder="Category Name" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div className="search-box" style={{ flex: 1, maxWidth: '300px' }}>
            <input placeholder="Slug (e.g. action)" value={slug} onChange={e=>setSlug(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={create}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New
          </button>
        </div>
      </div>

      <div className="table-card">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Slug</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cats.length === 0 ? (
              <tr><td colSpan="4" className="empty-state text-center">No categories found</td></tr>
            ) : cats.map(c=>(
              <tr key={c.id}>
                <td className="text-muted">#{c.id.substring(0,6)}...</td>
                <td className="fw-500">{c.name}</td>
                <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}>{c.slug}</span></td>
                <td className="actions text-right">
                  <button className="icon-btn btn-ghost" title="Edit" onClick={()=>update(c.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="icon-btn btn-danger-ghost" title="Delete" onClick={()=>del(c.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}