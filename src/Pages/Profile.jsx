import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../services/apiClient.js';

export default function Profile() {
  const { user, logout, updateUserInfo } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (user) {
      const bm = api.getUserBookmarks(user.id);
      setBookmarks(bm);
    }
  }, [user]);

  if (!user) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}><h2>Please log in</h2></div>;

  return (
    <div className="admin-container animate-fade">
      <div className="admin-header">
        <div>
          <h2>Profile Dashboard</h2>
          <p className="sub-text">Manage your profile and bookmarks</p>
        </div>
        <button onClick={logout} className="btn btn-danger-ghost" style={{ border: '1px solid rgba(225, 29, 72, 0.3)' }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="admin-box" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--card-solid)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="avatar" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: 'white' }}>{user.name}</h3>
              <span className={`badge badge-${user.role === 'admin' ? 'admin' : 'user'}`}>{user.role === 'admin' ? 'Administrator' : 'User'}</span>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span className="text-muted">Display Name</span><br/>{user.name}</div>
              <button className="btn btn-ghost" onClick={() => {
                const newName = prompt('New Name?', user.name);
                if (newName && newName !== user.name) updateUserInfo({ name: newName });
              }}>Change</button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span className="text-muted">Email</span><br/>{user.email}</div>
              <button className="btn btn-ghost" onClick={() => {
                const newEmail = prompt('New Email?', user.email);
                if (newEmail && newEmail !== user.email) {
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                    return alert('Invalid email address!');
                  }
                  try {
                    updateUserInfo({ email: newEmail });
                    alert('Email updated successfully!');
                  } catch (err) {
                    alert(err.message);
                  }
                }
              }}>Change</button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span className="text-muted">Password</span><br/>••••••••</div>
              <button className="btn btn-ghost" onClick={() => {
                const newPass = prompt('New Password?');
                if (newPass) { updateUserInfo({ password: newPass }); alert('Password updated successfully!'); }
              }}>Change</button>
            </div>
          </div>
        </div>

        <div className="admin-box" style={{ background: 'var(--card-solid)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'white', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Reading Bookmarks</h3>
          {bookmarks.length === 0 ? (
            <div className="empty-state text-center">No bookmarks yet.</div>
          ) : (
            <ul className="bookmark-list" style={{ margin: 0 }}>
              {bookmarks.map(chapter => (
                <li key={chapter.id}>
                  <Link to={`/story/${chapter.story.id}/chapter/${chapter.chapter_number}`} className="bookmark-item" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', textDecoration: 'none' }}>
                    <div>
                      <div className="bookmark-title" style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>{chapter.story.title}</div>
                      <div className="text-muted" style={{ fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Reading: Chapter {chapter.chapter_number} {chapter.title ? `- ${chapter.title}` : ''}</span>
                        {chapter.latestChapterNumber && chapter.latestChapterNumber > chapter.chapter_number && (
                          <span className="badge" style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(255, 77, 109, 0.15)', color: 'var(--primary)', border: '1px solid rgba(255, 77, 109, 0.3)' }}>
                            New: Chapter {chapter.latestChapterNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}