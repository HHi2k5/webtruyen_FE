import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as api from '../services/apiClient.js';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      nav(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
    }
  };

  const isActive = (key, value) => {
    const params = new URLSearchParams(location.search);
    return location.pathname === '/search' && params.get(key) === value;
  };

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="container row align-center justify-between">
            <Link to="/" className="logo">Net<span>Style</span></Link>

            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search mangas, authors..."
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
              </div>
              
              {suggestions.length > 0 && (
                <ul className="search-suggestions animate-fade">
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
                  <Link to="/profile" className="user-profile-btn" style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    textDecoration: 'none', color: 'white', 
                    padding: '4px 16px 4px 4px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '32px', border: '1px solid var(--border)', 
                    transition: 'all 0.2s ease' 
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }} 
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div className="avatar" style={{width: 32, height: 32, fontSize: 14}}>{user.name.charAt(0).toUpperCase()}</div>
                    <span style={{ fontWeight: 500, fontSize: '14px' }}>Hi, {user.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={()=>{logout(); nav('/');}} className="btn btn-ghost" style={{ padding: '8px 16px' }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost">Login</Link>
                  <Link to="/register" className="btn btn-primary">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <nav className="main-nav">
          <div className="container">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>HOME</Link>
            <Link to="/search?sortBy=updatedAt" className={`nav-link ${isActive('sortBy', 'updatedAt') ? 'active' : ''}`}>LATEST</Link>
            <Link to="/search?status=ongoing" className={`nav-link ${isActive('status', 'ongoing') ? 'active' : ''}`}>ONGOING</Link>
            <Link to="/search?status=completed" className={`nav-link ${isActive('status', 'completed') ? 'active' : ''}`}>COMPLETED</Link>
            {user?.role === 'admin' && (
              <div className="admin-menu" onMouseLeave={() => setShowAdminMenu(false)} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setShowAdminMenu(v => !v)}
                >
                  MANAGE 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {showAdminMenu && (
                  <div className="admin-dropdown animate-fade" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 1000,
                    minWidth: '160px'
                  }}>
                    <Link to="/admin/stories" className="nav-link" style={{ display: 'block' }}>Stories</Link>
                    <Link to="/admin/chapters" className="nav-link" style={{ display: 'block' }}>Chapters</Link>
                    <Link to="/admin/categories" className="nav-link" style={{ display: 'block' }}>Categories</Link>
                    <Link to="/admin/users" className="nav-link" style={{ display: 'block' }}>Users</Link>
                    <Link to="/admin/comments" className="nav-link" style={{ display: 'block' }}>Comments</Link>
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
              <Link to="/" className="logo" style={{fontSize: 28, marginBottom: 16, display: 'inline-block'}}>Net<span>Style</span></Link>
              <p>Your premium destination to read manga online for free. We provide high-quality chapters with a stunning reading experience.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link to="/search?sortBy=updatedAt">Latest Releases</Link>
              <Link to="/search?status=ongoing">Ongoing Series</Link>
              <Link to="/search?status=completed">Completed Series</Link>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <a href="#">Discord Community</a>
              <a href="#">Twitter / X</a>
              <a href="#">Contact Support</a>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 NetStyle — Designed for Anime & Manga Enthusiasts
          </div>
        </div>
      </footer>
    </>
  );
}