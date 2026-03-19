import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/apiClient.js';

export default function AdminComments() {
  const list = useMemo(() => {
    return api.listComments({}).map(c => {
      const user = api.getUserById(c.user_id);
      const story = c.story_id ? api.getStory(c.story_id) : null;
      return { ...c, user, story };
    });
  }, []);

  const del = (id) => {
    if (confirm('Delete this comment?')) {
      api.deleteComment(id, { requester: { role: 'admin' } });
      window.location.reload();
    }
  };

  return (
    <div className="admin-container animate-fade">
      <div className="admin-header">
        <div>
          <h2>Manage Comments</h2>
          <p className="sub-text">Monitor and moderate community content</p>
        </div>
      </div>

      <div className="table-card">
        <table className="table admin-table" style={{ fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>Author</th>
              <th>Content</th>
              <th>Target</th>
              <th>Time</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan="6" className="empty-state text-center">No comments found</td></tr>
            ) : list.map(c => (
              <tr key={c.id}>
                <td className="text-muted">#{c.id.substring(0, 5)}...</td>
                <td className="fw-500">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                      {c.user?.name ? c.user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    {c.user?.name || 'Anonymous'}
                  </div>
                </td>
                <td>
                  <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.content}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {c.story ? <Link to={`/story/${c.story.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '13px' }}>{c.story.title}</Link> : <span className="text-muted">-</span>}
                    {c.chapter_id ? <Link to={`/story/${c.story.id}/chapter/${c.chapter_id}`} style={{ color: 'white', textDecoration: 'none', fontSize: '12px' }}>Chapter {c.chapter_id}</Link> : null}
                  </div>
                </td>
                <td className="text-muted" style={{ fontSize: '12px' }}>{new Date(c.createdAt).toLocaleString('en-US')}</td>
                <td className="actions text-right">
                  <button className="icon-btn btn-danger-ghost" title="Delete" onClick={() => del(c.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
