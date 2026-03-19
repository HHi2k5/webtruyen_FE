import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/apiClient.js';

export default function AdminStories() {
  const navigate = useNavigate();
  const categories = useMemo(()=>api.listCategories(), []);
  const [form, setForm] = useState({ title:'', author:'', status:'ongoing', coverUrl:'', description:'', selectedCategories: [] });
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');
  const list = useMemo(()=>api.listStories({ q, page:1, pageSize:999 }).items, [q]);

  const create = () => {
    try {
      if (!form.title) return alert('Missing title');
      const s = api.createStory(form);
      api.setStoryCategories(s.id, form.selectedCategories);
      alert('Created: ' + s.title);
      setForm({ title:'', author:'', status:'ongoing', coverUrl:'', description:'', selectedCategories: [] });
    } catch(e){ alert(e.message); }
  };

  const beginEdit = (story) => {
    const fullStory = api.getStory(story.id);
    setEditing(fullStory);
    setForm({
      title: fullStory.title,
      author: fullStory.author,
      status: fullStory.status,
      coverUrl: fullStory.coverUrl || '',
      description: fullStory.description || '',
      selectedCategories: fullStory.categories.map(c => c.id)
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ title:'', author:'', status:'ongoing', coverUrl:'', description:'', selectedCategories: [] });
  };

  const saveEdit = () => {
    if (!editing) return;
    try {
      api.updateStory(editing.id, form);
      api.setStoryCategories(editing.id, form.selectedCategories);
      alert('Updated successfully');
      setEditing(null);
      setForm({ title:'', author:'', status:'ongoing', coverUrl:'', description:'', selectedCategories: [] });
    } catch(e) { alert(e.message); }
  };

  const del = (id) => { if (confirm('Delete story and all its chapters?')) api.deleteStory(id); };

  return (
    <div className="admin-container animate-fade">
      <div className="admin-header">
        <div>
          <h2>Manage Stories</h2>
          <p className="sub-text">Manage story repository, add new, and edit details</p>
        </div>
      </div>

      <div className="admin-form-card" style={{ maxWidth: '800px', margin: '0 auto 32px auto' }}>
        <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
          {editing ? 'Edit Story: ' + editing.title : 'Create New Story'}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Title</label>
            <input placeholder="Enter title..." value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Author</label>
            <input placeholder="Enter author name..." value={form.author} onChange={e=>setForm({...form, author: e.target.value})} />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Cover Image URL</label>
            <input placeholder="https://..." value={form.coverUrl} onChange={e=>setForm({...form, coverUrl: e.target.value})} />
          </div>
        </div>

        <div className="form-group">
          <label>Synopsis</label>
          <textarea placeholder="Write a brief summary..." value={form.description} onChange={e=>setForm({...form, description: e.target.value})} style={{ minHeight: '80px' }} />
        </div>
        
        <div className="form-group">
          <label>Categories</label>
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
              <button onClick={saveEdit} className="btn btn-primary">Save Updates</button>
              <button onClick={cancelEdit} className="btn btn-ghost">Cancel</button>
            </>
          ) : (
            <button onClick={create} className="btn btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Story
            </button>
          )}
        </div>
      </div>

      <div className="admin-toolbar" style={{ background: 'var(--card-solid)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div className="search-box" style={{ width: '100%', maxWidth: '400px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search stories by name..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>
      </div>

      <div className="table-card">
        <table className="table admin-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Story</th>
              <th>Author</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan="4" className="empty-state text-center">No stories found</td></tr>
            ) : list.map(s=>(
              <tr key={s.id}>
                <td className="fw-500">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {s.coverUrl && <img src={s.coverUrl} style={{ width: '32px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} alt="" />}
                    <Link to={`/story/${s.id}`} style={{ color: 'white', textDecoration: 'none' }}>{s.title}</Link>
                  </div>
                </td>
                <td className="text-muted">{s.author}</td>
                <td>
                  <span className={`badge badge-${s.status === 'ongoing' ? 'user' : 'admin'}`}>{s.status}</span>
                </td>
                <td className="actions text-right">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '4px' }}>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={()=>beginEdit(s)}>Edit</button>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.1)' }} onClick={()=>navigate(`/admin/chapters?storyId=${s.id}`)}>Chapters</button>
                    <button className="btn btn-danger-ghost" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={()=>del(s.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}