import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as api from '../services/apiClient.js';
import StoryCard from '../components/StoryCard.jsx';
import Paginator from '../components/Paginator.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const categories = api.listCategories();

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
                <Link to="/search?sortBy=createdAt&order=desc" className="view-all">View All</Link>
              </div>
              <div className="story-grid">
                {popularStories.items.map(s => <StoryCard key={s.id} s={s} />)}
              </div>
            </section>

            {/* Latest Releases Section */}
            <section className="section">
              <div className="section-header">
                <h2>LATEST RELEASES</h2>
                <Link to="/search?sortBy=updatedAt&order=desc" className="view-all">View All</Link>
              </div>
              <div className="story-grid">
                {latestStories.items.map(s => <StoryCard key={s.id} s={s} />)}
              </div>
            </section>

            {/* Home page now relies solely on Popular and Latest. Search handles querying. */}
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
                  <Link key={cat.id} to={`/search?categoryId=${cat.id}`} className="category-link">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="sidebar-section">
              <h3>Browse</h3>
              <div className="quick-links">
                <Link to="/search?status=ongoing">Ongoing</Link>
                <Link to="/search?status=completed">Completed</Link>
                <Link to="/search?sortBy=updatedAt">Latest</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}