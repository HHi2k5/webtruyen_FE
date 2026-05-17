import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/apiClient.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import Pagination from './Pagination.jsx';

/**
 * Recursive Comment Item component
 */
const CommentItem = ({ 
  comment, 
  allComments, 
  onReply, 
  onDelete, 
  user, 
  replyingTo, 
  setReplyingTo, 
  replyContent, 
  setReplyContent 
}) => {
  const replies = useMemo(() => allComments.filter(c => c.parent_id === comment.id), [allComments, comment.id]);
  const isReplying = replyingTo === comment.id;

  return (
    <li className="comment-item" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="avatar" style={{ 
          width: '32px', 
          height: '32px', 
          flexShrink: 0, 
          fontSize: '13px'
        }}>
          {(comment.user?.name || 'A').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className="c-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <b style={{ color: 'white', fontSize: '14px' }}>{comment.user?.name || 'Anonymous'}</b>
            <small style={{ color: 'var(--muted)', fontSize: '11px' }}>{new Date(comment.createdAt).toLocaleString()}</small>
          </div>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: 'var(--text)', marginBottom: '8px' }}>{comment.content}</p>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-ghost" 
              style={{ padding: 0, fontSize: '12px', color: 'var(--muted)', minHeight: 'auto', background: 'transparent', cursor: 'pointer' }} 
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
            >
              {isReplying ? 'Cancel Reply' : 'Reply'}
            </button>
            {user && (user.role === 'admin' || user.id === comment.user_id) && (
              <button 
                className="btn-danger-ghost" 
                style={{ padding: 0, fontSize: '12px', minHeight: 'auto', background: 'transparent', cursor: 'pointer' }} 
                onClick={() => onDelete(comment.id)}
              >
                Delete
              </button>
            )}
          </div>
          
          {isReplying && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                style={{ minHeight: '60px', resize: 'vertical', fontSize: '13px', padding: '8px 12px' }}
                autoFocus
              />
              <button 
                className="btn btn-primary" 
                onClick={() => onReply(comment.id)} 
                style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '12px' }}
              >
                Reply
              </button>
            </div>
          )}
          
          {replies.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
              {replies.map(reply => (
                <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  allComments={allComments} 
                  onReply={onReply} 
                  onDelete={onDelete} 
                  user={user}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
};

export default function CommentSection({ storyId, chapterId }) {
  const { user } = useAuth();
  const [commentPage, setCommentPage] = useState(1);
  const [commentsData, setCommentsData] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.listComments({ 
        story_id: storyId, 
        chapter_id: chapterId, 
        page: commentPage, 
        pageSize: 50 // Fetch more to ensure we get replies
      });
      setCommentsData(res);
    } catch (e) {
      console.error('Failed to fetch comments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [storyId, chapterId, commentPage]);

  const topLevelComments = useMemo(() => 
    commentsData.items.filter(c => !c.parent_id), 
    [commentsData.items]
  );

  const addComment = async () => {
    if (!user) return alert('Please login to comment');
    if (!newCommentContent.trim()) return;
    
    try {
      await api.createComment({ 
        user_id: user.id, 
        story_id: storyId, 
        chapter_id: chapterId, 
        content: newCommentContent.trim() 
      });
      setNewCommentContent('');
      fetchComments();
    } catch (e) {
      alert('Failed to post comment');
    }
  };

  const addReply = async (parentId) => {
    if (!user) return alert('Please login to reply');
    if (!replyContent.trim()) return;

    try {
      await api.createComment({ 
        user_id: user.id, 
        story_id: storyId, 
        chapter_id: chapterId, 
        parent_id: parentId, 
        content: replyContent.trim() 
      });
      setReplyContent('');
      setReplyingTo(null);
      fetchComments();
    } catch (e) {
      alert('Failed to post reply');
    }
  };

  const removeComment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(id);
      fetchComments();
    } catch (e) {
      alert('Failed to delete comment: ' + e.message);
    }
  };

  return (
    <div className="comments-section-component">
      <div className="comment-box" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <textarea
          placeholder="What are your thoughts?"
          value={newCommentContent}
          onChange={e => setNewCommentContent(e.target.value)}
          style={{ minHeight: '100px', borderRadius: '12px', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', resize: 'vertical' }}
        />
        <button 
          className="btn btn-primary" 
          onClick={addComment} 
          style={{ alignSelf: 'flex-end', padding: '10px 20px' }}
          disabled={loading || !newCommentContent.trim()}
        >
          Post Comment
        </button>
      </div>

      <ul className="comment-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {topLevelComments.length === 0 && !loading && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', fontStyle: 'italic', padding: '40px 0' }}>
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
        
        {topLevelComments.map(comment => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            allComments={commentsData.items} 
            onReply={addReply} 
            onDelete={removeComment} 
            user={user}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
          />
        ))}
      </ul>

      {commentsData.total > commentsData.pageSize && (
        <div style={{ marginTop: '40px' }}>
          <Pagination 
            page={commentsData.page} 
            pageSize={commentsData.pageSize} 
            total={commentsData.total} 
            onPageChange={setCommentPage} 
          />
        </div>
      )}
    </div>
  );
}
