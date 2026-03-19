import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../services/apiClient.js';

export default function ChapterRead() {
  const { storyId, chapterNumber } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  let story, ch, all;
  try {
    story = api.getStory(storyId);
    ch = api.getChapterByNumber(storyId, chapterNumber);
    all = api.listChapters(storyId, { order: 'asc' }).items;
  } catch (e) {
    return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}><h2>Error: {e.message}</h2><Link to="/" className="btn btn-primary">Go Home</Link></div>;
  }

  const idx = all.findIndex(x => x.id === ch.id);
  const prev = all[idx-1], next = all[idx+1];

  const [bookmarked, setBookmarked] = useState(false);
  
  useEffect(() => {
    if (user) setBookmarked(api.isBookmarked(user.id, ch.id));
  }, [user, ch.id]);

  const toggleBookmark = () => {
    if (!user) return alert('Please login to bookmark');
    api.toggleChapterBookmark(user.id, ch.id);
    setBookmarked(!bookmarked);
  };

  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const chapterComments = useMemo(()=>api.listComments({ story_id: storyId, chapter_id: ch.id }), [storyId, ch.id]);
  const topLevelComments = useMemo(() => chapterComments.filter(c => !c.parent_id), [chapterComments]);
  const getReplies = (parentId) => chapterComments.filter(c => c.parent_id === parentId);

  const addComment = () => {
    if (!user) return alert('Please login to comment');
    if (!content.trim()) return;
    api.createComment({ user_id: user.id, story_id: storyId, chapter_id: ch.id, content: content.trim() });
    setContent('');
  };

  const addReply = (parentId) => {
    if (!user) return alert('Please login to reply');
    if (!replyContent.trim()) return;
    api.createComment({ user_id: user.id, story_id: storyId, chapter_id: ch.id, parent_id: parentId, content: replyContent.trim() });
    setReplyContent('');
    setReplyingTo(null);
  };

  const removeComment = (id) => {
    try {
      api.deleteComment(id, { requester: user ?? { role: 'guest' } });
    } catch (e) { alert(e.message); }
    setContent(c => c);
  };

  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterNumber]);

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
          <h3 style={{ margin: '0 0 20px 0', color: 'white' }}>Comments ({chapterComments.length})</h3>
          <div className="comment-box" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            <textarea placeholder="Join the discussion for this chapter..." value={content} onChange={e=>setContent(e.target.value)} style={{ minHeight: '100px' }} />
            <button className="btn btn-primary" onClick={addComment} style={{ alignSelf: 'flex-end' }}>Post Comment</button>
          </div>

          <ul className="comment-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {topLevelComments.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', fontStyle: 'italic' }}>No comments yet. Be the first!</p>}
            
            {topLevelComments.map(cm => (
              <li key={cm.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="avatar" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                    {(api.getUserById(cm.user_id)?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="c-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <b style={{ color: 'white', fontSize: '15px' }}>{api.getUserById(cm.user_id)?.name || 'Anonymous'}</b>
                      <small style={{ color: 'var(--muted)', fontSize: '13px' }}>{new Date(cm.createdAt).toLocaleString('en-US')}</small>
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: 'var(--text)', marginBottom: '8px' }}>{cm.content}</p>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn-ghost" style={{ padding: 0, fontSize: '14px', color: 'var(--muted)', minHeight: 'auto', background: 'transparent' }} onClick={() => setReplyingTo(replyingTo === cm.id ? null : cm.id)}>
                        {replyingTo === cm.id ? 'Cancel Reply' : 'Reply'}
                      </button>
                      {user && (user.role==='admin' || user.id===cm.user_id) && (
                        <button className="btn-danger-ghost" style={{ padding: 0, fontSize: '14px', minHeight: 'auto', background: 'transparent' }} onClick={()=>removeComment(cm.id)}>Delete</button>
                      )}
                    </div>
                    
                    {/* Reply Form */}
                    {replyingTo === cm.id && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        <textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={e=>setReplyContent(e.target.value)}
                          style={{ minHeight: '80px', resize: 'vertical', fontSize: '14px', padding: '12px' }}
                          autoFocus
                        />
                        <button className="btn btn-primary" onClick={() => addReply(cm.id)} style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '14px' }}>Reply</button>
                      </div>
                    )}
                    
                    {/* Nested Replies */}
                    {getReplies(cm.id).length > 0 && (
                      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '20px' }}>
                        {getReplies(cm.id).map(reply => (
                          <div key={reply.id} style={{ display: 'flex', gap: '12px' }}>
                            <div className="avatar" style={{ width: '36px', height: '36px', flexShrink: 0, fontSize: '15px' }}>
                              {(api.getUserById(reply.user_id)?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div className="c-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <b style={{ color: 'white', fontSize: '14px' }}>{api.getUserById(reply.user_id)?.name || 'Anonymous'}</b>
                                <small style={{ color: 'var(--muted)', fontSize: '12px' }}>{new Date(reply.createdAt).toLocaleString('en-US')}</small>
                                {user && (user.role==='admin' || user.id===reply.user_id) && (
                                  <button className="btn-danger-ghost" style={{ padding: 0, fontSize: '12px', minHeight: 'auto', background: 'transparent', marginLeft: 'auto' }} onClick={()=>removeComment(reply.id)}>Delete</button>
                                )}
                              </div>
                              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--text)' }}>{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}