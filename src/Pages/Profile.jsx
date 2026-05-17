import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../services/apiClient.js';
import Paginator from '../components/Paginator.jsx';

export default function Profile() {
  const { user, logout, updateUserInfo } = useAuth();
  const [bookmarkRes, setBookmarkRes] = useState({ items: [], total: 0, page: 1, pageSize: 10 });
  const [bookmarkPage, setBookmarkPage] = useState(1);
  const [loading, setLoading] = useState({});
  const [editingField, setEditingField] = useState(null); // 'name', 'email', 'password'
  const [editValue, setEditValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      api.getUserBookmarks(user.id, { page: bookmarkPage, pageSize: 10 }).then(setBookmarkRes);
    }
  }, [user, bookmarkPage]);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const startEdit = (field, currentVal = '') => {
    setEditingField(field);
    setEditValue(currentVal);
    setConfirmValue('');
    setOldPassword('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
    setConfirmValue('');
    setOldPassword('');
  };

  const handleUpdate = async (field) => {
    if (!editValue || editValue.trim() === '') return;
    
    // Validation
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editValue)) {
      return showMsg('Invalid email address!', 'error');
    }
    if (field === 'password') {
      if (!oldPassword) return showMsg('Current password is required!', 'error');
      if (editValue !== confirmValue) {
        return showMsg('New passwords do not match!', 'error');
      }
      if (editValue.length < 6) {
        return showMsg('Password must be at least 6 characters!', 'error');
      }
    }

    setLoading({ ...loading, [field]: true });
    try {
      const updates = { [field]: editValue };
      if (field === 'password') updates.oldPassword = oldPassword;
      
      await updateUserInfo(updates);
      showMsg(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
      cancelEdit();
    } catch (err) {
      console.error('Update failed:', err);
      const errorData = err.response?.data;
      const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.message || err.message);
      showMsg(errorMsg, 'error');
    } finally {
      setLoading({ ...loading, [field]: false });
    }
  };

  if (!user) return <div className="container" style={{padding: '100px 0', textAlign: 'center'}}><h2>Please log in</h2></div>;

  return (
    <div className="admin-container animate-fade">
      {message.text && (
        <div className={`message-toast ${message.type}`} style={{
          position: 'fixed', top: '100px', right: '20px', zIndex: 1000,
          padding: '12px 24px', borderRadius: '8px', color: 'white',
          background: message.type === 'error' ? '#e11d48' : '#22c55e',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {message.text}
        </div>
      )}

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
            {/* Display Name Section */}
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="text-muted" style={{ fontSize: '13px' }}>Display Name</span>
                  {editingField === 'name' ? (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                      <input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)} 
                        placeholder="Enter new name"
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleUpdate('name')} disabled={loading.name}>
                          {loading.name ? 'Saving...' : 'Save'}
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'white', fontWeight: '500', marginTop: '4px' }}>{user.name}</div>
                  )}
                </div>
                {editingField !== 'name' && (
                  <button className="btn btn-ghost" style={{ color: 'var(--primary)', fontSize: '12px' }} onClick={() => startEdit('name', user.name)}>Edit</button>
                )}
              </div>
            </div>
            
            {/* Email Section */}
            <div style={{ paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="text-muted" style={{ fontSize: '13px' }}>Email Address</span>
                  {editingField === 'email' ? (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                      <input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)} 
                        placeholder="new@example.com"
                        type="email"
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleUpdate('email')} disabled={loading.email}>
                          {loading.email ? 'Saving...' : 'Save'}
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'white', fontWeight: '500', marginTop: '4px' }}>{user.email}</div>
                  )}
                </div>
                {editingField !== 'email' && (
                  <button className="btn btn-ghost" style={{ color: 'var(--primary)', fontSize: '12px' }} onClick={() => startEdit('email', user.email)}>Edit</button>
                )}
              </div>
            </div>
            
            {/* Password Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <span className="text-muted" style={{ fontSize: '13px' }}>Password</span>
                  {editingField === 'password' ? (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexDirection: 'column', maxWidth: '300px' }}>
                      <input 
                        value={oldPassword} 
                        onChange={e => setOldPassword(e.target.value)} 
                        placeholder="Current Password"
                        type="password"
                        autoFocus
                      />
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }}></div>
                      <input 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)} 
                        placeholder="New Password"
                        type="password"
                      />
                      <input 
                        value={confirmValue} 
                        onChange={e => setConfirmValue(e.target.value)} 
                        placeholder="Confirm New Password"
                        type="password"
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleUpdate('password')} disabled={loading.password}>
                          {loading.password ? 'Saving...' : 'Update Password'}
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--muted)', marginTop: '4px' }}>••••••••</div>
                  )}
                </div>
                {editingField !== 'password' && (
                  <button className="btn btn-ghost" style={{ color: 'var(--primary)', fontSize: '12px' }} onClick={() => startEdit('password')}>Update</button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-box" style={{ background: 'var(--card-solid)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'white', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Reading Bookmarks</h3>
          {bookmarkRes.items.length === 0 ? (
            <div className="empty-state text-center">No bookmarks yet.</div>
          ) : (
            <>
              <ul className="bookmark-list" style={{ margin: 0 }}>
                {bookmarkRes.items.map(chapter => (
                  <li key={chapter.id}>
                    <Link to={`/story/${chapter.story?.id}/chapter/${chapter.chapter_number}`} className="bookmark-item" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', textDecoration: 'none' }}>
                      <div>
                        <div className="bookmark-title" style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>{chapter.story?.title || 'Unknown Story'}</div>
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
              <div style={{ marginTop: '20px' }}>
                <Paginator 
                  total={bookmarkRes.total} 
                  page={bookmarkPage} 
                  pageSize={10} 
                  onChange={setBookmarkPage} 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}