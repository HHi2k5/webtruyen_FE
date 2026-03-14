import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../services/apiClient.js';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      nav(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="container row">
            <Link to="/" className="logo">Net<span>Style</span></Link>

            <form className="search-form" onSubmit={handleSearch} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search mangas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onInput={(e) => {
                  const q = e.target.value;
                  setSearchQuery(q);
                  if (q.trim()) {
                    const results = api.listStories({ q, pageSize: 5 }).items;
                    setSuggestions(results);
                  } else {
                    setSuggestions([]);
                  }
                }}
              />
              <button type="submit">Search</button>
              {suggestions.length > 0 && (
                <ul className="search-suggestions">
                  {suggestions.map(s => (
                    <li key={s.id}>
                      <Link to={`/story/${s.id}`} onClick={() => setSuggestions([])}>{s.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </form>

            <div className="header-actions">
              {user ? (
                <>
                  <span className="user-info">Hello, {user.name}</span>
                  <Link to="/profile" className="btn icon-btn profile-btn" title="Profile">👤</Link>
                  <button onClick={()=>{logout(); nav('/');}} className="btn">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn">Login</Link>
                  <Link to="/register" className="btn primary">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <nav className="main-nav">
          <div className="container">
            <Link to="/" className="nav-link active">HOME</Link>
            <Link to="/?sortBy=updatedAt" className="nav-link">LATEST</Link>
            <Link to="/?status=ongoing" className="nav-link">ONGOING</Link>
            <Link to="/?status=completed" className="nav-link">COMPLETED</Link>
            {user?.role === 'admin' && (
              <div className="admin-menu" onMouseLeave={() => setShowAdminMenu(false)} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  className="nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => setShowAdminMenu(v => !v)}
                >
                  MANAGE ▾
                </button>
                {showAdminMenu && (
                  <div className="admin-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    background: 'white',
                    border: '1px solid #ccc',
                    padding: '4px 0',
                    zIndex: 1000,
                    minWidth: '120px'
                  }}>
                    <Link to="/admin/stories" className="nav-link" style={{ display: 'block', padding: '4px 12px' }}>Stories</Link>
                    <Link to="/admin/users" className="nav-link" style={{ display: 'block', padding: '4px 12px' }}>Users</Link>
                    <Link to="/admin/comments" className="nav-link" style={{ display: 'block', padding: '4px 12px' }}>Comments</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>NetStyle</h4>
              <p>Read manga online for free</p>
            </div>
            <div className="footer-section">
              <h4>Links</h4>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer-section">
              <h4>Social Media</h4>
              <a href="#">Facebook</a>
              <a href="#">Discord</a>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 NetStyle — Frontend Demo (Mock API)
          </div>
        </div>
      </footer>
    </>
  );
}