import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import * as api from '../services/apiClient.js';
import Pagination from '../components/Pagination.jsx';

export default function AdminStories() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [list, setList] = useState({ items: [], total: 0, page: 1, pageSize: 10 });
  const [dummy, setDummy] = useState(0);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ title:'', author:'', status:'ONGOING', coverUrl:'', description:'', selectedCategories: [] });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    // Reset to page 1 when search query changes
    setPage(1);
  }, [q]);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    api.listStories({ q, page, pageSize: 12 }).then(res => setList(res)).catch(console.error);
  }, [q, page, dummy]);

  const extractImageUrl = (url) => {
    if (url.includes('google.com/imgres')) {
      try {
        const urlObj = new URL(url);
        const imgUrl = urlObj.searchParams.get('imgurl');
        if (imgUrl) return decodeURIComponent(imgUrl);
      } catch (e) {
        console.error('Failed to parse Google URL', e);
      }
    }
    return url;
  };

  const create = async () => {
    try {
      if (!form.title) return alert('Missing title');
      const s = await api.createStory(form);
      await api.setStoryCategories(s.id, form.selectedCategories);
      alert('Created: ' + s.title);
      setForm({ title:'', author:'', status:'ongoing', coverUrl:'', description:'', selectedCategories: [] });
      setDummy(d => d + 1);
    } catch(e){ alert(e.message); }
  };

  const beginEdit = async (story) => {
    try {
      const fullStory = await api.getStory(story.id);
      setEditing(fullStory);
      setForm({
        title: fullStory.title,
        author: fullStory.author,
        status: fullStory.status,
        coverUrl: fullStory.coverUrl || '',
        description: fullStory.description || '',
        selectedCategories: fullStory.categories.map(c => c.id)
      });
    } catch(e) { alert(e.message); }
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ title:'', author:'', status:'ONGOING', coverUrl:'', description:'', selectedCategories: [] });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await api.updateStory(editing.id, form);
      await api.setStoryCategories(editing.id, form.selectedCategories);
      alert('Updated successfully');
      setEditing(null);
      setForm({ title:'', author:'', status:'ONGOING', coverUrl:'', description:'', selectedCategories: [] });
      setDummy(d => d + 1);
    } catch(e) { alert(e.message); }
  };

  const del = async (id) => { 
    if (confirm('Delete story and all its chapters?')) {
      await api.deleteStory(id);
      setDummy(d => d + 1);
    }
  };

  return (
    <div className="admin-container animate-fade">
      <div className="admin-header">
        <div>
          <h2>{t('manageStories')}</h2>
          <p className="sub-text">{t('adminSubText')}</p>
        </div>
      </div>

      <div className="admin-form-card" style={{ maxWidth: '800px', margin: '0 auto 32px auto' }}>
        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
          {editing ? t('editStory') + ': ' + editing.title : t('createNewStory')}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>{t('title')}</label>
            <input placeholder={t('title') + '...'} value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>{t('author')}</label>
            <input placeholder={t('author') + '...'} value={form.author} onChange={e=>setForm({...form, author: e.target.value})} />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
          <div className="form-group">
            <label>{t('status')}</label>
            <select value={form.status || 'ONGOING'} onChange={e=>setForm({...form, status: e.target.value})}>
              <option value="ONGOING">{t('ongoing')}</option>
              <option value="COMPLETED">{t('completed')}</option>
            </select>
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>{t('coverImageUrl')}</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input 
                  placeholder="https://..." 
                  value={form.coverUrl} 
                  onChange={e => {
                    const rawUrl = e.target.value;
                    const cleanUrl = extractImageUrl(rawUrl);
                    setForm({...form, coverUrl: cleanUrl});
                  }} 
                />
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  {t('tipGoogleImages')}
                </p>
              </div>
              {form.coverUrl && (
                <div style={{ width: '60px', height: '80px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)' }}>
                  <img 
                    src={form.coverUrl} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>{t('synopsis')}</label>
          <textarea placeholder={t('synopsis') + '...'} value={form.description} onChange={e=>setForm({...form, description: e.target.value})} style={{ minHeight: '80px' }} />
        </div>
        
        <div className="form-group">
          <label>{t('categories')}</label>
          <div className="checkboxes" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {categories.map(c=>(
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={form.selectedCategories.includes(c.id)}
                  onChange={e=>{
                    const checked = e.target.checked;
                    setForm(prev => ({
                      ...prev, 
                      selectedCategories: checked 
                        ? [...prev.selectedCategories, c.id] 
                        : prev.selectedCategories.filter(x=>x!==c.id)
                    }));
                  }}
                  style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {editing ? (
            <>
              <button onClick={saveEdit} className="btn btn-primary">{t('saveUpdates')}</button>
              <button onClick={cancelEdit} className="btn btn-ghost">{t('cancel')}</button>
            </>
          ) : (
            <button onClick={create} className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {t('createStory')}
            </button>
          )}
        </div>
      </div>

      <div className="admin-toolbar" style={{ background: 'var(--card-solid)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div className="search-box" style={{ width: '100%', maxWidth: '400px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder={t('searchStoriesByName')} value={q} onChange={e=>setQ(e.target.value)} />
        </div>
      </div>

      <div className="table-card">
        <table className="table admin-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th>{t('story')}</th>
              <th>{t('author')}</th>
              <th>{t('status')}</th>
              <th className="text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {list.items.length === 0 ? (
              <tr><td colSpan="4" className="empty-state text-center">{t('noStoriesFound')}</td></tr>
            ) : list.items.map(s=>(
              <tr key={s.id}>
                <td className="fw-500">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {s.coverUrl && <img src={s.coverUrl} style={{ width: '32px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} alt="" />}
                    <Link to={`/story/${s.id}`} style={{ color: 'white', textDecoration: 'none' }}>
                      {s.title} <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: '400', marginLeft: '4px' }}>({s.views?.toLocaleString() || 0} {t('views_label')})</span>
                    </Link>
                  </div>
                </td>
                <td className="text-muted">{s.author}</td>
                <td>
                  <span className={`badge badge-${s.status === 'ONGOING' || s.status === 'ongoing' ? 'user' : 'admin'}`}>{s.status === 'ONGOING' || s.status === 'ongoing' ? t('ongoing') : t('completed')}</span>
                </td>
                <td className="actions text-right">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '4px' }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={()=>beginEdit(s)}>{t('edit')}</button>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={()=>navigate(`/admin/chapters?storyId=${s.id}`)}>{t('chapters')}</button>
                    <button className="btn btn-danger-ghost" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={()=>del(s.id)}>{t('delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={setPage} />
    </div>
  );
}