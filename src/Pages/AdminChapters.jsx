import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import * as api from '../services/apiClient.js';
import Pagination from '../components/Pagination.jsx';

export default function AdminChapters() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dummy, setDummy] = useState(0);

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

  const location = useLocation();
  const navigate = useNavigate();
  const queryId = new URLSearchParams(location.search).get('storyId');
  const [storyId, setStoryId] = useState(queryId || null);

  // Load initial story details if queryId exists
  useEffect(() => {
    if (queryId) {
      setStoryId(queryId);
      api.getStory(queryId).then(s => {
        if (s) {
          setCurrentStory(s);
          setSearchQuery(s.title);
        }
      });
    }
  }, [queryId]);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      setIsLoading(true);
      const res = await api.listStories({ q, pageSize: 10 });
      setSuggestions(res.items || []);
      setShowSuggestions(true);
      setIsLoading(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectStory = (story) => {
    setStoryId(story.id);
    setCurrentStory(story);
    setSearchQuery(story.title);
    setShowSuggestions(false);
    setPage(1);
    navigate(`/admin/chapters?storyId=${story.id}`);
  };
  
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [res, setRes] = useState({ items: [], total:0, page:1, pageSize:20 });

  useEffect(() => {
    if (storyId) {
      api.listChapters(storyId, { order, page, pageSize: 20 }).then(setRes);
    } else {
      setRes({ items: [], total:0, page:1, pageSize:20 });
    }
  }, [storyId, order, page, dummy]);

  const [form, setForm] = useState({ chapter_number:'', title:'', pagesCsv:'' });
  const [editing, setEditing] = useState(null);

  const create = async () => {
    const pages = form.pagesCsv.split(',').map(s=>s.trim()).filter(Boolean);
    try {
      await api.createChapter({ story_id: storyId, chapter_number: Number(form.chapter_number), title: form.title, pages });
      setForm({ chapter_number:'', title:'', pagesCsv:'' });
      alert('Chapter created successfully');
      setDummy(d => d + 1);
    } catch (e) { alert(e.message); }
  };

  const beginEdit = (ch) => {
    setEditing(ch);
    setForm({ chapter_number: ch.chapter_number.toString(), title: ch.title || '', pagesCsv: (ch.pages || []).join(', ') });
  };
  const cancelEdit = () => {
    setEditing(null);
    setForm({ chapter_number:'', title:'', pagesCsv:'' });
  };
  const saveEdit = async () => {
    if (!editing) return;
    const pages = form.pagesCsv.split(',').map(s=>s.trim()).filter(Boolean);
    try {
      await api.updateChapter(editing.id, { story_id: storyId, chapter_number: Number(form.chapter_number), title: form.title, pages });
      alert('Chapter updated successfully');
      setEditing(null);
      setForm({ chapter_number:'', title:'', pagesCsv:'' });
      setDummy(d => d + 1);
    } catch (e) { alert(e.message); }
  };

  const del = async (id) => { 
    if (confirm('Delete chapter?')) {
      await api.deleteChapter(id, storyId);
      setDummy(d => d + 1);
    }
  };


  return (
    <div className="admin-container animate-fade">
      <div className="admin-header">
        <div>
          <h2>{t('manageChapters')}</h2>
          <p className="sub-text">{t('adminSubTextChapters')}</p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ background: 'var(--card-solid)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '16px', width: '100%', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: 2, minWidth: '250px', position: 'relative' }}>
            <label style={{ color: 'white' }}>{t('searchStory')}</label>
            <div className="search-wrapper" style={{ margin: 0, display: 'flex', alignItems: 'center', background: 'var(--card-solid)', borderRadius: '8px', border: '1px solid var(--border)', padding: '0 12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text"
                placeholder={t('typeStoryName')}
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                style={{ background: 'none', border: 'none', color: 'white', padding: '10px', width: '100%', outline: 'none' }}
              />
              {isLoading && <div className="spinner-small"></div>}
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <ul className="search-suggestions animate-fade" style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'var(--card-solid)', border: '1px solid var(--border)',
                borderRadius: '8px', marginTop: '4px', padding: '8px 0',
                listStyle: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                maxHeight: '300px', overflowY: 'auto'
              }}>
                {suggestions.map(s => (
                  <li key={s.id}>
                    <button 
                      onClick={() => selectStory(s)}
                      style={{ 
                        width: '100%', textAlign: 'left', padding: '10px 16px',
                        background: 'none', border: 'none', color: 'white',
                        cursor: 'pointer', transition: 'background 0.2s',
                        display: 'flex', alignItems: 'center', gap: '12px'
                      }}
                      onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.target.style.background = 'none'}
                    >
                      <img src={s.coverUrl} alt="" style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.author || t('unknownAuthor')}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {/* Click outside to close */}
            {showSuggestions && <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowSuggestions(false)}></div>}
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <label style={{ color: 'white' }}>{t('sortBy')}</label>
            <select value={order} onChange={e=>setOrder(e.target.value)}>
              <option value="asc">{t('oldestFirst')}</option>
              <option value="desc">{t('newestFirst')}</option>
            </select>
          </div>
        </div>
      </div>

      {currentStory && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginTop: '32px' }}>
          
          <div className="admin-form-card" style={{ margin: 0, alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              {editing ? t('editChapter') : t('createNewChapter')}
            </h3>
            <div className="form-group">
              <label>{t('chapterNumber')}</label>
              <input type="number" placeholder="e.g. 1" value={form.chapter_number} onChange={e=>setForm({...form, chapter_number:e.target.value})}/>
            </div>
            <div className="form-group">
              <label>{t('chapterTitleOptional')}</label>
              <input placeholder={t('title') + '...'} value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
            </div>
            <div className="form-group">
              <label>{t('imageListUrls')}</label>
              <textarea 
                placeholder="https://img1.jpg, https://img2.jpg" 
                value={form.pagesCsv} 
                onChange={e=>{
                  const val = e.target.value;
                  // If we detect a comma or it's a single long paste, attempt to clean
                  const parts = val.split(',').map(s => extractImageUrl(s.trim()));
                  setForm({...form, pagesCsv: parts.join(', ') });
                }} 
                style={{ minHeight: '120px' }} 
              />
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                {t('tipGoogleImagesShortened')}
              </p>
            </div>

            {/* Chapter Pages Preview */}
            {form.pagesCsv.trim() && (
              <div className="chapter-preview" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px', display: 'block' }}>{t('previewPages')} ({form.pagesCsv.split(',').filter(Boolean).length})</label>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {form.pagesCsv.split(',').map(s=>s.trim()).filter(Boolean).map((src, i)=>(
                    <div key={i} style={{ flexShrink: 0, width: '100px', height: '140px', position: 'relative', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                      <img 
                        src={src} 
                        alt={`Preview ${i+1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => e.target.style.opacity = '0.3'}
                      />
                      <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px' }}>{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {editing ? (
                <>
                  <button onClick={saveEdit} className="btn btn-primary">{t('saveChapter')}</button>
                  <button onClick={cancelEdit} className="btn btn-ghost">{t('cancel')}</button>
                </>
              ) : (
                <button onClick={create} className="btn btn-primary">{t('addChapter')}</button>
              )}
            </div>
          </div>

          <div className="table-card" style={{ alignSelf: 'start' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, color: 'white' }}>{t('chapterList')} - {currentStory.title}</h4>
              <span className="badge badge-user">{res.total} {t('chapters')}</span>
            </div>
            
            <table className="table admin-table" style={{ fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>#</th>
                  <th>{t('title')} / {t('title')}</th>
                  <th className="text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {res.items.length === 0 ? (
                  <tr><td colSpan="3" className="empty-state text-center">{t('noChaptersPosted')}</td></tr>
                ) : res.items.map(ch=>(
                  <tr key={ch.id}>
                    <td className="fw-500 text-muted">{t('chapters')} {ch.chapter_number}</td>
                    <td>
                      <Link to={`/story/${storyId}/chapter/${ch.chapter_number}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>
                        {ch.title || `${t('chapters')} ${ch.chapter_number}`}
                      </Link>
                      <div className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>{ch.pages.length} {t('pages')}</div>
                    </td>
                    <td className="actions text-right" style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={()=>beginEdit(ch)}>{t('edit')}</button>
                      <button className="btn btn-danger-ghost" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={()=>del(ch.id)}>{t('delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Pagination page={res.page} pageSize={res.pageSize} total={res.total} onPageChange={setPage} />

        </div>
      )}
    </div>
  );
}