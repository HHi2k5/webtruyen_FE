import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import * as api from '../services/apiClient.js';

export default function Categories() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [dummy, setDummy] = useState(0); 
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api.listCategories().then(setCats);
  }, [dummy]);

  const create = async () => {
    if (!name || !slug) return;
    try { 
      await api.createCategory({ name, slug }); 
      setName(''); setSlug(''); setDummy(x=>x+1); 
    }
    catch (e) { 
      const errorMsg = e.response?.data?.message || e.message;
      alert('Failed to create category: ' + errorMsg); 
    }
  };

  const update = async (id) => {
    const newName = prompt('New name?');
    if (!newName) return;
    try { 
      await api.updateCategory(id, { name: newName }); 
      setDummy(x=>x+1); 
    }
    catch (e) { 
      const errorMsg = e.response?.data?.message || e.message;
      alert('Failed to update category: ' + errorMsg); 
    }
  };

  const del = async (id) => { if (confirm('Delete?')) { await api.deleteCategory(id); setDummy(x=>x+1); } };

  return (
    <div className="admin-container animate-fade">
      <div className="admin-header">
        <div>
          <h2>{t('manageCategories')}</h2>
          <p className="sub-text">{t('adminSubTextCategories_desc')}</p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ background: 'var(--card-solid)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
          <div className="search-box" style={{ flex: 1, maxWidth: '300px' }}>
            <input placeholder={t('categoryName')} value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div className="search-box" style={{ flex: 1, maxWidth: '300px' }}>
            <input placeholder={t('slug_label') + ' (e.g. action)'} value={slug} onChange={e=>setSlug(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={create}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t('addNew')}
          </button>
        </div>
      </div>

      <div className="table-card">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>{t('id_label')}</th>
              <th>{t('categoryName')}</th>
              <th>{t('slug_label')}</th>
              <th className="text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {cats.length === 0 ? (
              <tr><td colSpan="4" className="empty-state text-center">{t('noCategoriesFound')}</td></tr>
            ) : cats.map(c=>(
              <tr key={c.id}>
                <td className="text-muted">#{c.id}</td>
                <td className="fw-500">{c.name}</td>
                <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}>{c.slug}</span></td>
                <td className="actions text-right">
                  <button className="icon-btn btn-ghost" title={t('edit')} onClick={()=>update(c.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="icon-btn btn-danger-ghost" title={t('delete')} onClick={()=>del(c.id)}>
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