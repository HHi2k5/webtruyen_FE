import React, { useMemo, useState } from 'react';
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
    return <div>Error: {e.message}</div>;
  }

  const idx = all.findIndex(x => x.id === ch.id);
  const prev = all[idx-1], next = all[idx+1];

  // bookmark
  const [bookmarked, setBookmarked] = useState(user ? api.isBookmarked(user.id, ch.id) : false);
  const toggleBookmark = () => {
    if (!user) return alert('Đăng nhập để đánh dấu');
    api.toggleChapterBookmark(user.id, ch.id);
    setBookmarked(!bookmarked);
  };

  // comments
  const [content, setContent] = useState('');
  const comments = useMemo(()=>api.listComments({ story_id: storyId, chapter_id: ch.id }), [storyId, ch.id]);

  const addComment = () => {
    if (!user) return alert('Đăng nhập để bình luận');
    if (!content.trim()) return;
    api.createComment({ user_id: user.id, story_id: storyId, chapter_id: ch.id, content: content.trim() });
    setContent('');
  };
  const removeComment = (id) => {
    try {
      api.deleteComment(id, { requester: user ?? { role: 'guest' } });
    } catch (e) { alert(e.message); }
    setContent(c => c); // trigger rerender
  };

  return (
    <section className="reader">
      <div className="reader-bar">
        <Link to={`/story/${storyId}`}>← {story.title}</Link>
        <div className="pn">
          <button disabled={!prev} onClick={()=>prev && nav(`/story/${storyId}/chapter/${prev.chapter_number}`)}>← Trước</button>
          <button disabled={!next} onClick={()=>next && nav(`/story/${storyId}/chapter/${next.chapter_number}`)}>Sau →</button>
        </div>
        <button className={bookmarked ? 'secondary' : ''} onClick={toggleBookmark}>
          {bookmarked ? 'Đã đánh dấu' : 'Đánh dấu chương'}
        </button>
      </div>

      <h2>{ch.title || ('Chương ' + ch.chapter_number)}</h2>
      <div className="pages">
        {ch.pages.map((src,i)=><img key={i} src={src} alt="" />)}
      </div>

      <div className="comments">
        <h3>Bình luận</h3>
        <div className="comment-box">
          <textarea placeholder="Viết bình luận..." value={content} onChange={e=>setContent(e.target.value)} />
          <button onClick={addComment}>Gửi</button>
        </div>

        <ul className="comment-list">
          {comments.map(cm=>(
            <li key={cm.id}>
              <div className="c-header">
                <b>{api.getUserById(cm.user_id)?.name || 'Ẩn danh'}</b>
                <small>{new Date(cm.createdAt).toLocaleString('vi-VN')}</small>
                {user && (user.role==='admin' || user.id===cm.user_id) && (
                  <button className="link danger" onClick={()=>removeComment(cm.id)}>Xoá</button>
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