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

  if (!user) return <div>Please log in</div>;

  return (
    <section style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h2>Trang cá nhân</h2>
      <div style={{ marginBottom: '20px' }}>
        <p>
          <strong>Tên:</strong> {user.name}{' '}
          <button onClick={() => {
            const newName = prompt('Tên mới?', user.name);
            if (newName && newName !== user.name) {
              updateUserInfo({ name: newName });
            }
          }}>Đổi tên</button>
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Mật khẩu:</strong> ********{' '}
          <button onClick={() => {
            const newPass = prompt('Mật khẩu mới?');
            if (newPass) {
              updateUserInfo({ password: newPass });
              alert('Mật khẩu đã được cập nhật');
            }
          }}>Đổi mật khẩu</button>
        </p>
        <p><strong>Vai trò:</strong> {user.role}</p>
      </div>

      <h3>Các chương đã đánh dấu</h3>
      {bookmarks.length === 0 ? (
        <p>Chưa có chương nào được đánh dấu.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {bookmarks.map(chapter => (
            <li key={chapter.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
              <Link to={`/story/${chapter.story.id}/chapter/${chapter.chapter_number}`}>
                <strong>{chapter.story.title}</strong> - Chương {chapter.chapter_number}: {chapter.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <button onClick={logout}>Đăng xuất</button>
    </section>
  );
}