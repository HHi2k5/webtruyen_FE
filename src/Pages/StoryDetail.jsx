import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../services/apiClient.js';

export default function StoryDetail() {
  const { storyId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState('desc');

  const [story, setStory] = useState(() => api.getStory(storyId));
  const categories = api.listCategories();
  const chapterRes = useMemo(()=>api.listChapters(storyId, { page:1, pageSize: 200, order }), [storyId, order]);

  useEffect(() => {
    setStory(api.getStory(storyId));
  }, [storyId]);

  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  
  const storyComments = useMemo(() => api.listComments({ story_id: storyId }), [storyId]);
  const topLevelComments = useMemo(() => storyComments.filter(c => !c.parent_id), [storyComments]);
  const getReplies = (parentId) => storyComments.filter(c => c.parent_id === parentId);

  const addStoryComment = () => {
    if (!user) return alert('Please login to comment');
    if (!commentContent.trim()) return;
    api.createComment({ user_id: user.id, story_id: storyId, chapter_id: null, content: commentContent.trim() });
    setCommentContent('');
  };

  const addReply = (parentId) => {
    if (!user) return alert('Please login to reply');
    if (!replyContent.trim()) return;
    api.createComment({ user_id: user.id, story_id: storyId, chapter_id: null, parent_id: parentId, content: replyContent.trim() });
    setReplyContent('');
    setReplyingTo(null);
  };

  const removeStoryComment = (id) => {
    try {
      api.deleteComment(id, { requester: user ?? { role: 'guest' } });
    } catch (e) { alert(e.message); }
    setCommentContent(c => c); 
  };

  const [selectedCats, setSelectedCats] = useState(story.categories.map(c=>c.id));
  const saveCats = () => {
    if (user?.role !== 'admin') return;
    api.setStoryCategories(storyId, selectedCats);
    alert('Categories saved successfully');
  };

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
              <span><strong style={{color:'white'}}>Status:</strong> {story.status === 'ongoing' ? 'Ongoing' : 'Completed'}</span>
            </div>
            
            <div className="tags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {story.categories.map(c=><Link to={`/?categoryId=${c.id}`} key={c.id} className="tag badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', fontSize: '13px', padding: '6px 14px' }}>{c.name}</Link>)}
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
                <button className="btn btn-ghost" style={{ marginTop: '12px' }} onClick={()=>{
                  const d = prompt('New Synopsis?', story.description);
                  if (d == null) return;
                  const updated = api.updateStory(storyId, { description: d });
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
            <div className="comments-container" style={{ background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div className="comment-box" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <textarea
                  placeholder="What are your thoughts?"
                  value={commentContent}
                  onChange={e=>setCommentContent(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
                <button className="btn btn-primary" onClick={addStoryComment} style={{ alignSelf: 'flex-end' }}>Post Comment</button>
              </div>
              
              <ul className="comment-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {topLevelComments.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', fontStyle: 'italic' }}>No comments yet. Be the first!</p>}
                
                {topLevelComments.map(cm => (
                  <li key={cm.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="avatar" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                        {(api.getUserById(cm.user_id)?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="c-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <b style={{ color: 'white', fontSize: '15px' }}>{api.getUserById(cm.user_id)?.name || 'Anonymous'}</b>
                          <small style={{ color: 'var(--muted)', fontSize: '12px' }}>{new Date(cm.createdAt).toLocaleString('en-US')}</small>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: 'var(--text)', marginBottom: '8px' }}>{cm.content}</p>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button className="btn-ghost" style={{ padding: 0, fontSize: '13px', color: 'var(--muted)', minHeight: 'auto', background: 'transparent' }} onClick={() => setReplyingTo(replyingTo === cm.id ? null : cm.id)}>
                            {replyingTo === cm.id ? 'Cancel Reply' : 'Reply'}
                          </button>
                          {user && (user.role==='admin' || user.id===cm.user_id) && (
                            <button className="btn-danger-ghost" style={{ padding: 0, fontSize: '13px', minHeight: 'auto', background: 'transparent' }} onClick={()=>removeStoryComment(cm.id)}>Delete</button>
                          )}
                        </div>
                        
                        {/* Reply Form */}
                        {replyingTo === cm.id && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                            <textarea
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={e=>setReplyContent(e.target.value)}
                              style={{ minHeight: '60px', resize: 'vertical', fontSize: '13px', padding: '8px 12px' }}
                              autoFocus
                            />
                            <button className="btn btn-primary" onClick={() => addReply(cm.id)} style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '13px' }}>Reply</button>
                          </div>
                        )}
                        
                        {/* Nested Replies */}
                        {getReplies(cm.id).length > 0 && (
                          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                            {getReplies(cm.id).map(reply => (
                              <div key={reply.id} style={{ display: 'flex', gap: '10px' }}>
                                <div className="avatar" style={{ width: '32px', height: '32px', flexShrink: 0, fontSize: '14px' }}>
                                  {(api.getUserById(reply.user_id)?.name || 'A').charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div className="c-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <b style={{ color: 'white', fontSize: '14px' }}>{api.getUserById(reply.user_id)?.name || 'Anonymous'}</b>
                                    <small style={{ color: 'var(--muted)', fontSize: '11px' }}>{new Date(reply.createdAt).toLocaleString('en-US')}</small>
                                    {user && (user.role==='admin' || user.id===reply.user_id) && (
                                      <button className="btn-danger-ghost" style={{ padding: 0, fontSize: '12px', minHeight: 'auto', background: 'transparent', marginLeft: 'auto' }} onClick={()=>removeStoryComment(reply.id)}>Delete</button>
                                    )}
                                  </div>
                                  <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.5, color: 'var(--text)' }}>{reply.content}</p>
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
      </div>
    </div>
  );
}