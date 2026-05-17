import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import * as api from '../services/apiClient.js';
import Pagination from '../components/Pagination.jsx';

export default function AdminComments() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [res, setRes] = useState({ items: [], total: 0, page: 1, pageSize: 20 });

  const fetchComments = () => {
    // Only fetch stories related to these comments, or keep simple caching if needed.
    // For simplicity with pagination, we'll fetch listComments, then get minimal stories info.
    api.listComments({ page, pageSize: 20 }).then(async (pageRes) => {
      const items = pageRes.items || [];
      const hydrated = await Promise.all(items.map(async c => {
        let user = c.user;
        if (!user && c.user_id) user = await api.getUserById(c.user_id);
        
        // Fetch story details if needed and not populated.
        let story = c.story;
        if (!story && c.story_id) {
            story = await api.getStory(c.story_id).catch(() => null);
        }
        return { ...c, user, story };
      }));
      setRes({ ...pageRes, items: hydrated });
    });
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  useEffect(() => {
    fetchComments();
  }, []);

  const del = async (id) => {
    if (confirm('Delete this comment?')) {
      await api.deleteComment(id, { requester: { role: 'admin' } });
      fetchComments();
    }
  };

  return (
    <div className="admin-container animate-fade">
      <div className="admin-header">
        <div>
          <h2>{t('manageComments')}</h2>
          <p className="sub-text">{t('adminSubTextComments_desc')}</p>
        </div>
      </div>

      <div className="table-card">
        <table className="table admin-table" style={{ fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ width: '80px' }}>{t('id_label')}</th>
              <th>{t('author')}</th>
              <th>{t('content')}</th>
              <th>{t('target')}</th>
              <th>{t('time')}</th>
              <th className="text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {res.items.length === 0 ? (
              <tr><td colSpan="6" className="empty-state text-center">{t('noCommentsFound')}</td></tr>
            ) : res.items.map(c => (
              <tr key={c.id}>
                <td className="text-muted">#{c.id}</td>
                <td className="fw-500">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                      {c.user?.name ? c.user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    {c.user?.name || t('anonymous')}
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
                    {c.chapter_id ? <Link to={`/story/${c.story.id}/chapter/${c.chapter_id}`} style={{ color: 'white', textDecoration: 'none', fontSize: '12px' }}>{t('chapters')} {c.chapter_id}</Link> : null}
                  </div>
                </td>
                <td className="text-muted" style={{ fontSize: '12px' }}>{new Date(c.createdAt).toLocaleString(lang === 'EN' ? 'en-US' : 'vi-VN')}</td>
                <td className="actions text-right">
                  <button className="icon-btn btn-danger-ghost" title={t('delete')} onClick={() => del(c.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination page={res.page} pageSize={res.pageSize} total={res.total} onPageChange={setPage} />
    </div>
  );
}
