import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../services/apiClient.js';

export default function StoryDetail() {
  const { storyId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState('asc');

  const [story, setStory] = useState(() => api.getStory(storyId));
  const categories = api.listCategories();
  const chapterRes = useMemo(()=>api.listChapters(storyId, { page:1, pageSize: 20, order }), [storyId, order]);

  // if storyId changes we need to reload
  useEffect(() => {
    setStory(api.getStory(storyId));
  }, [storyId]);

  // story comments (not tied to a chapter)
  const [commentContent, setCommentContent] = useState('');
  const storyComments = useMemo(() => api.listComments({ story_id: storyId }), [storyId]);

  const addStoryComment = () => {
    if (!user) return alert('Đăng nhập để bình luận');
    if (!commentContent.trim()) return;
    api.createComment({ user_id: user.id, story_id: storyId, chapter_id: null, content: commentContent.trim() });
    setCommentContent('');
  };
  const removeStoryComment = (id) => {
    try {
      api.deleteComment(id, { requester: user ?? { role: 'guest' } });
    } catch (e) { alert(e.message); }
    setCommentContent(c => c); // force re-render
  };

  // Admin: gán thể loại
  const [selectedCats, setSelectedCats] = useState(story.categories.map(c=>c.id));
  const saveCats = () => {
    if (user?.role !== 'admin') return;
    api.setStoryCategories(storyId, selectedCats);
    alert('Đã lưu thể loại');
  };

  return (
    <section>
      <div className="story-detail">
        <img className="cover-lg" src={story.coverUrl} alt={story.title}/>
        <div className="info">
          <h2>{story.title}</h2>
          <div>Tác giả: {story.author}</div>
          <div>Trạng thái: {story.status}</div>
          <p>{story.description}</p>
          {user?.role === 'admin' && (
            <button className="small" onClick={()=>{
              const d = prompt('Mô tả mới?', story.description);
              if (d == null) return;
              const updated = api.updateStory(storyId, { description: d });
              setStory(updated);
            }}>Sửa mô tả</button>
          )}

          <div className="tags">
            {story.categories.map(c=><span key={c.id} className="tag">{c.name}</span>)}
          </div>

          {user?.role === 'admin' && (
            <div className="admin-box">
              <h4>Gán thể loại</h4>
              <div className="checkboxes">
                {categories.map(c=>(
                  <label key={c.id}>
                    <input
                      type="checkbox"
                      checked={selectedCats.includes(c.id)}
                      onChange={e=>{
                        setSelectedCats(prev => e.target.checked ? [...prev, c.id] : prev.filter(x=>x!==c.id));
                      }}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
              <button onClick={saveCats}>Lưu</button>
              <button onClick={()=>nav('/admin/chapters?storyId='+storyId)}>Quản lý chương</button>
            </div>
          )}
        </div>
      </div>

      <div className="chap-head">
        <h3>Danh sách chương</h3>
        <select value={order} onChange={e=>setOrder(e.target.value)}>
          <option value="asc">Từ cũ → mới</option>
          <option value="desc">Từ mới → cũ</option>
        </select>
      </div>

      <ul className="chap-list">
        {chapterRes.items.map(ch=>(
          <li key={ch.id}>
            <Link to={`/story/${storyId}/chapter/${ch.chapter_number}`}>{ch.title || 'Chương ' + ch.chapter_number}</Link>
          </li>
        ))}
      </ul>

      {/* comments moved to bottom */}
      <div className="comments">
        <h3>Bình luận truyện</h3>
        <div className="comment-box">
          <textarea
            placeholder="Viết bình luận..."
            value={commentContent}
            onChange={e=>setCommentContent(e.target.value)}
          />
          <button onClick={addStoryComment}>Gửi</button>
        </div>
        <ul className="comment-list">
          {storyComments.map(cm=>(
            <li key={cm.id}>
              <div className="c-header">
                <b>{api.getUserById(cm.user_id)?.name || 'Ẩn danh'}</b>
                <small>{new Date(cm.createdAt).toLocaleString('vi-VN')}</small>
                {user && (user.role==='admin' || user.id===cm.user_id) && (
                  <button className="link danger" onClick={()=>removeStoryComment(cm.id)}>Xoá</button>
                )}
              </div>
              <p>{cm.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}