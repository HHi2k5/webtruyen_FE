import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import * as api from '../services/apiClient.js';

export default function AdminChapters() {
  const stories = useMemo(()=>api.listStories({ page:1, pageSize:999 }).items, []);
  const location = useLocation();
  const navigate = useNavigate();
  const queryId = new URLSearchParams(location.search).get('storyId');
  const [storyId, setStoryId] = useState(queryId || stories[0]?.id);

  useEffect(()=>{
    if (queryId && !stories.find(s=>s.id===queryId)) {
      setStoryId(stories[0]?.id);
      navigate('/admin/chapters', { replace: true });
    }
  }, [queryId, stories, navigate]);
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const res = useMemo(()=>storyId ? api.listChapters(storyId, { order, page, pageSize: 200 }) : { items: [], total:0, page:1, pageSize:20 }, [storyId, order, page]);

  const [form, setForm] = useState({ chapter_number:'', title:'', pagesCsv:'' });
  const [editing, setEditing] = useState(null);

  const create = () => {
    const pages = form.pagesCsv.split(',').map(s=>s.trim()).filter(Boolean);
    try {
      api.createChapter({ story_id: storyId, chapter_number: Number(form.chapter_number), title: form.title, pages });
      setForm({ chapter_number:'', title:'', pagesCsv:'' });
      alert('Chapter created successfully');
    } catch (e) { alert(e.message); }
  };

  const beginEdit = (ch) => {
    setEditing(ch);
    setForm({ chapter_number: ch.chapter_number.toString(), title: ch.title, pagesCsv: ch.pages.join(', ') });
  };
  const cancelEdit = () => {
    setEditing(null);
    setForm({ chapter_number:'', title:'', pagesCsv:'' });
  };
  const saveEdit = () => {
    if (!editing) return;
    const pages = form.pagesCsv.split(',').map(s=>s.trim()).filter(Boolean);
    api.updateChapter(editing.id, { chapter_number: Number(form.chapter_number), title: form.title, pages });
    alert('Chapter updated successfully');
    setEditing(null);
    setForm({ chapter_number:'', title:'', pagesCsv:'' });
  };

  const del = (id) => { if (confirm('Delete chapter?')) api.deleteChapter(id); };

  const currentStory = stories.find(s => s.id === storyId);

  return (
    <div className="admin-container animate-fade">
      <div className="admin-header">
        <div>
          <h2>Manage Chapters</h2>
          <p className="sub-text">Manage content and ordering of story chapters</p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ background: 'var(--card-solid)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '16px', width: '100%', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: 2, minWidth: '250px' }}>
            <label style={{ color: 'white' }}>Select Story</label>
            <select value={storyId} onChange={e=>{const id=e.target.value; setStoryId(id); setPage(1); navigate(`/admin/chapters?storyId=${id}`);}}>
              {stories.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
            <label style={{ color: 'white' }}>Sort By</label>
            <select value={order} onChange={e=>setOrder(e.target.value)}>
              <option value="asc">Oldest First</option>
              <option value="desc">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {currentStory && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginTop: '32px' }}>
          
          <div className="admin-form-card" style={{ margin: 0, alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              {editing ? 'Edit Chapter' : 'Create New Chapter'}
            </h3>
            <div className="form-group">
              <label>Chapter Number</label>
              <input type="number" placeholder="e.g. 1" value={form.chapter_number} onChange={e=>setForm({...form, chapter_number:e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Chapter Title (optional)</label>
              <input placeholder="Title..." value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Image List (URLs, separated by commas)</label>
              <textarea placeholder="https://img1.jpg, https://img2.jpg" value={form.pagesCsv} onChange={e=>setForm({...form, pagesCsv:e.target.value})} style={{ minHeight: '120px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {editing ? (
                <>
                  <button onClick={saveEdit} className="btn btn-primary">Save Chapter</button>
                  <button onClick={cancelEdit} className="btn btn-ghost">Cancel</button>
                </>
              ) : (
                <button onClick={create} className="btn btn-primary">Add Chapter</button>
              )}
            </div>
          </div>

          <div className="table-card" style={{ alignSelf: 'start' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, color: 'white' }}>Chapter List - {currentStory.title}</h4>
              <span className="badge badge-user">{res.total} Chapters</span>
            </div>
            
            <table className="table admin-table" style={{ fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>#</th>
                  <th>Title / Name</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {res.items.length === 0 ? (
                  <tr><td colSpan="3" className="empty-state text-center">No chapters posted yet</td></tr>
                ) : res.items.map(ch=>(
                  <tr key={ch.id}>
                    <td className="fw-500 text-muted">Ch. {ch.chapter_number}</td>
                    <td>
                      <Link to={`/story/${storyId}/chapter/${ch.chapter_number}`} style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>
                        {ch.title || `Chapter ${ch.chapter_number}`}
                      </Link>
                      <div className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>{ch.pages.length} pages</div>
                    </td>
                    <td className="actions text-right" style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={()=>beginEdit(ch)}>Edit</button>
                      <button className="btn btn-danger-ghost" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={()=>del(ch.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}