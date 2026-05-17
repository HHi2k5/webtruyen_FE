import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../services/apiClient.js';
import Pagination from '../components/Pagination.jsx';
import CommentSection from '../components/CommentSection.jsx';
import { saveToHistory } from '../utils/history.js';

export default function ChapterRead() {
  const { storyId, chapterNumber } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const viewIncrementedRef = useRef({});

  const [data, setData] = useState(null);
  useEffect(() => {
    Promise.all([
      api.getStory(storyId),
      api.getChapterByNumber(storyId, chapterNumber),
      api.listChapters(storyId, { order: 'asc', pageSize: 9999 })
    ]).then(([storyRes, chRes, allRes]) => {
      setData({ story: storyRes, ch: chRes, all: allRes.items });
      
      const key = `${storyId}-${chapterNumber}`;
      if (user && !viewIncrementedRef.current[key]) {
        viewIncrementedRef.current[key] = true;
        api.incrementViews(storyId);
      }
    }).catch(e => setData({ error: e.message || 'Error loading chapter' }));
  }, [storyId, chapterNumber]);

  useEffect(() => {
    if (data?.story && data?.ch) {
      saveToHistory(data.story, data.ch);
    }
  }, [data]);

  const [bookmarked, setBookmarked] = useState(false);
  
  useEffect(() => {
    if (user && data?.ch) {
      api.isBookmarked(user.id, data.ch.id).then(setBookmarked);
    }
  }, [user, data]);

  const toggleBookmark = async () => {
    if (!user) return alert('Please login to bookmark');
    try {
      await api.toggleChapterBookmark(user.id, data.ch.id);
      setBookmarked(!bookmarked);
    } catch (e) {
      alert('Failed to update bookmark');
    }
  };

  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterNumber]);

  if (!data) return <div style={{padding: '100px', textAlign: 'center', color: 'white'}}>Loading...</div>;
  if (data.error) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}><h2>Error: {data.error}</h2><Link to="/" className="btn btn-primary">Go Home</Link></div>;
  
  const { story, ch, all } = data;
  const idx = all.findIndex(x => x.chapter_number == ch.chapter_number);
  const prev = all[idx-1], next = all[idx+1];

  return (
    <div className="reader-page bg-black" style={{ background: '#000', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Sticky Top Reader Bar */}
      <div className="reader-bar-top" style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        background: 'rgba(9, 10, 16, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to={`/story/${storyId}`} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--muted)' }} title="Back to Story">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </Link>
            <div>
              <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{story.title}</div>
              <div style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>{ch.title || ('Chapter ' + ch.chapter_number)}</div>
            </div>
          </div>
          
          <div className="reader-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-ghost" disabled={!prev} onClick={()=>prev && nav(`/story/${storyId}/chapter/${prev.chapter_number}`)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 9 6"/></svg> Prev
            </button>
            
            <select 
              value={ch.chapter_number} 
              onChange={e => nav(`/story/${storyId}/chapter/${e.target.value}`)}
              style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px' }}
            >
              {all.map(c => <option key={c.id} value={c.chapter_number}>Ch. {c.chapter_number}</option>)}
            </select>
            
            <button className="btn btn-ghost" disabled={!next} onClick={()=>next && nav(`/story/${storyId}/chapter/${next.chapter_number}`)}>
              Next <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <button className={`btn ${bookmarked ? 'primary' : 'btn-ghost'}`} onClick={toggleBookmark} style={{ marginLeft: '8px' }} title="Bookmark Chapter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> 
            </button>
          </div>
        </div>
      </div>

      {/* Pages Container */}
      <div className="pages-container" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: '#111' }}>
        {ch.pages.map((src,i)=>(
          <img 
            key={i} 
            src={src} 
            alt={`Page ${i+1}`} 
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
          />
        ))}
      </div>

      {/* Bottom Reader Bar */}
      <div className="reader-bar-bottom" style={{ maxWidth: '900px', margin: '40px auto 0 auto', display: 'flex', justifyContent: 'center', gap: '16px', padding: '0 20px' }}>
        <button className="btn btn-ghost" style={{ flex: 1, padding: '16px', fontSize: '16px', background: 'rgba(255,255,255,0.05)' }} disabled={!prev} onClick={()=>prev && nav(`/story/${storyId}/chapter/${prev.chapter_number}`)}>
          ← Previous Chapter
        </button>
        <button className="btn btn-primary" style={{ flex: 1, padding: '16px', fontSize: '16px' }} disabled={!next} onClick={()=>next && nav(`/story/${storyId}/chapter/${next.chapter_number}`)}>
          Next Chapter →
        </button>
      </div>

      {/* Chapter Comments */}
      <div className="container" style={{ maxWidth: '900px', margin: '60px auto 0 auto' }}>
        <div className="comments-container" style={{ background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'white' }}>Comments</h3>
          <CommentSection storyId={storyId} chapterId={data.ch?.id} />
        </div>
      </div>

    </div>
  );
}