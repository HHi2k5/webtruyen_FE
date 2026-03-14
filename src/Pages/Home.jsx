import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as api from '../services/apiClient.js';
import StoryCard from '../components/StoryCard.jsx';
import Paginator from '../components/Paginator.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const categories = api.listCategories();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [author, setAuthor] = useState('');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'updatedAt');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const result = useMemo(() => api.listStories({ q, categoryId, status, author, sortBy, order, page, pageSize }), [q, categoryId, status, author, sortBy, order, page]);

  // Popular manga (top 6 by createdAt desc)
  const popularStories = useMemo(() => api.listStories({ sortBy: 'createdAt', order: 'desc', page: 1, pageSize: 6 }), []);

  // Latest releases (top 6 by updatedAt desc)
  const latestStories = useMemo(() => api.listStories({ sortBy: 'updatedAt', order: 'desc', page: 1, pageSize: 6 }), []);

  // User bookmarks for sidebar
  const [bookmarks, setBookmarks] = useState([]);
  useEffect(() => {
    if (user) {
      const bm = api.getUserBookmarks(user.id);
      setBookmarks(bm.slice(0, 5)); // Show only 5 recent bookmarks
    }
  }, [user]);

  return (
    <div className="home-page">
      <div className="container">
        <div className="home-content">
          <div className="main-section">
            {/* Popular Manga Section */}
            <section className="section">
              <div className="section-header">
                <h2>POPULAR MANGA</h2>
                <Link to="/?sortBy=createdAt&order=desc" className="view-all">View All</Link>
              </div>
              <div className="story-grid">
                {popularStories.items.map(s => <StoryCard key={s.id} s={s} />)}
              </div>
            </section>

            {/* Latest Releases Section */}
            <section className="section">
              <div className="section-header">
                <h2>LATEST RELEASES</h2>
                <Link to="/?sortBy=updatedAt&order=desc" className="view-all">View All</Link>
              </div>
              <div className="story-grid">
                {latestStories.items.map(s => <StoryCard key={s.id} s={s} />)}
              </div>
            </section>

            {/* Search Results or All Stories */}
            {(q || categoryId || status) && (
              <section className="section">
                <div className="section-header">
                  <h2>SEARCH RESULTS</h2>
                </div>
                <div className="filters">
                  <input placeholder="Search mangas" value={q} onChange={e=>{setQ(e.target.value); setPage(1);}} />
                  <select value={categoryId} onChange={e=>{setCategoryId(e.target.value); setPage(1);}}>
                    <option value="">Category</option>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select value={status} onChange={e=>{setStatus(e.target.value); setPage(1);}}>
                    <option value="">Status</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                    <option value="updatedAt">Latest Updated</option>
                    <option value="createdAt">Newly Added</option>
                    <option value="title">Name A→Z</option>
                  </select>
                  <select value={order} onChange={e=>setOrder(e.target.value)}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
                <div className="story-grid">
                  {result.items.map(s => <StoryCard key={s.id} s={s} />)}
                </div>
                <Paginator total={result.total} page={result.page} pageSize={result.pageSize} onChange={setPage} />
              </section>
            )}
          </div>

          <aside className="sidebar">
            {/* History/Bookmarks */}
            {user && (
              <div className="sidebar-section">
                <h3>Bookmarks</h3>
                {bookmarks.length === 0 ? (
                  <p>No bookmarks yet</p>
                ) : (
                  <ul className="bookmark-list">
                    {bookmarks.map(chapter => (
                      <li key={chapter.id}>
                        <Link to={`/story/${chapter.story.id}/chapter/${chapter.chapter_number}`}>
                          <div className="bookmark-item">
                            <div className="bookmark-title">{chapter.story.title}</div>
                            <div className="bookmark-chapter">Ch. {chapter.chapter_number}</div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/profile" className="view-all">View All</Link>
              </div>
            )}

            {/* Categories */}
            <div className="sidebar-section">
              <h3>Genre</h3>
              <div className="category-list">
                {categories.map(cat => (
                  <Link key={cat.id} to={`/?categoryId=${cat.id}`} className="category-link">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="sidebar-section">
              <h3>Browse</h3>
              <div className="quick-links">
                <Link to="/?status=ongoing">Ongoing</Link>
                <Link to="/?status=completed">Completed</Link>
                <Link to="/?sortBy=updatedAt">Latest</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}