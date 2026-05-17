import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../services/apiClient.js';
import Pagination from '../components/Pagination.jsx';
import CommentSection from '../components/CommentSection.jsx';

export default function StoryDetail() {
  const { storyId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState('desc');

  const [story, setStory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [chapterRes, setChapterRes] = useState({ items: [], total: 0 });

  useEffect(() => {
    api.listCategories().then(setCategories);
  }, []);

  useEffect(() => {
    api.getStory(storyId).then(setStory);
  }, [storyId]);

  useEffect(() => {
    api.listChapters(storyId, { page: 1, pageSize: 200, order }).then(setChapterRes);
  }, [storyId, order]);

  const [selectedCats, setSelectedCats] = useState([]);
  useEffect(() => {
    if (story && story.categories) setSelectedCats(story.categories.map(c=>c.id));
  }, [story]);

  const saveCats = async () => {
    if (user?.role !== 'admin') return;
    try {
      await api.setStoryCategories(storyId, selectedCats);
      const updatedStory = await api.getStory(storyId);
      setStory(updatedStory);
      alert('Categories saved successfully');
    } catch (e) {
      alert('Failed to save categories: ' + e.message);
    }
  };

  if (!story) return <div style={{padding: '100px', textAlign: 'center', color: 'white'}}>Loading...</div>;

  return (
    <div className="story-detail-page animate-fade">
      {/* Immersive Header Backdrop */}
      <div 
        className="story-backdrop"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '400px',
          backgroundImage: `url(${story.coverUrl})`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px) opacity(0.3)',
          zIndex: -1, pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
        }}
      />
      
      <div className="container">
        <div className="story-detail-header" style={{ display: 'flex', gap: '32px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <img 
            className="cover-lg" 
            src={story.coverUrl} 
            alt={story.title}
            style={{ width: '260px', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', objectFit: 'cover', aspectRatio: '3/4' }}
          />
          <div className="info" style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0', lineHeight: 1.2 }}>{story.title}</h1>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--muted)', marginBottom: '20px', fontSize: '15px' }}>
              <span><strong style={{color:'white'}}>Author:</strong> {story.author}</span>
              <span><strong style={{color:'white'}}>Status:</strong> {story.status === 'ONGOING' || story.status === 'ongoing' ? 'Ongoing' : 'Completed'}</span>
              <span><strong style={{color:'white'}}>Views:</strong> {story.views?.toLocaleString() || 0}</span>
            </div>
            
            <div className="tags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {story.categories.map(c=><Link to={`/search?categoryId=${c.id}`} key={c.id} className="tag badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontSize: '13px', padding: '6px 14px' }}>{c.name}</Link>)}
            </div>

            <div className="action-buttons" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              {chapterRes.items.length > 0 && (
                <Link to={`/story/${storyId}/chapter/${chapterRes.items[chapterRes.items.length-1].chapter_number}`} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '16px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Read First Chapter
                </Link>
              )}
            </div>

            <div style={{ background: 'var(--card-solid)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', lineHeight: '1.7', color: 'var(--text)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: 'white' }}>Synopsis</h3>
              <p style={{ margin: 0 }}>{story.description}</p>
              {user?.role === 'admin' && (
                <button className="btn btn-ghost" style={{ marginTop: '12px' }} onClick={async ()=>{
                  const d = prompt('New Synopsis?', story.description);
                  if (d == null) return;
                  const updated = await api.updateStory(storyId, { description: d });
                  setStory(updated);
                }}>✎ Edit Synopsis</button>
              )}
            </div>
            
            {user?.role === 'admin' && (
              <div className="admin-box" style={{ marginTop: '24px', background: 'rgba(255, 77, 109, 0.05)', border: '1px solid rgba(255, 77, 109, 0.2)' }}>
                <h4 style={{ color: 'var(--primary)', margin: '0 0 12px 0' }}>Admin Tools: Assign Categories</h4>
                <div className="checkboxes" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  {categories.map(c=>(
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(c.id)}
                        onChange={e=>{
                          setSelectedCats(prev => e.target.checked ? [...prev, c.id] : prev.filter(x=>x!==c.id));
                        }}
                        style={{ width: 'auto' }}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={saveCats}>Save Categories</button>
                  <button className="btn btn-ghost" onClick={()=>nav('/admin/chapters?storyId='+storyId)}>Manage Chapters</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="story-content-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '40px' }}>
          
          <div className="chapters-section">
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h2>Chapters ({chapterRes.total})</h2>
              <select value={order} onChange={e=>setOrder(e.target.value)} style={{ width: 'auto', padding: '6px 12px', borderRadius: '8px', background: 'var(--card-solid)' }}>
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
            <div className="chap-list" style={{ background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              {chapterRes.items.map(ch=>(
                <Link 
                  to={`/story/${storyId}/chapter/${ch.chapter_number}`}
                  key={ch.id} 
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', padding: '16px 20px', 
                    borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)',
                    transition: 'var(--transition)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: '500' }}>{ch.title || 'Chapter ' + ch.chapter_number}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{new Date(ch.createdAt).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="comments-section">
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h2>Comments</h2>
            </div>
            <div className="comments-container" style={{ background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <CommentSection storyId={storyId} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}