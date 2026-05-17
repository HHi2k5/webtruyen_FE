import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as api from '../services/apiClient.js';
import StoryCard from '../components/StoryCard.jsx';
import Paginator from '../components/Paginator.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getHistory } from '../utils/history.js';

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [hotStories, setHotStories] = useState({ items: [] });
  const [latestStories, setLatestStories] = useState({ items: [] });
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.listCategories(),
      api.listStories({ sortBy: 'views', order: 'desc', page: 1, pageSize: 6 }),
      api.listStories({ sortBy: 'updatedAt', order: 'desc', page: 1, pageSize: 6 })
    ]).then(([cats, hot, lat]) => {
      if (active) {
        setCategories(cats);
        setHotStories(hot);
        setLatestStories(lat);
        setHistory(getHistory().slice(0, 5));
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (user) {
      api.getUserBookmarks(user.id, { pageSize: 3 }).then(res => {
        if (active) setBookmarks(res.items);
      });
    }
    return () => { active = false; };
  }, [user]);

  return (
    <div className="home-page">
      <div className="container">
        <div className="home-content">
          <div className="main-section">
            {/* Hot Manga Section */}
            <section className="section">
              <div className="section-header">
                <h2>{t('hotManga')}</h2>
                <Link to="/search?sortBy=views&order=desc" className="view-all">{t('viewAll')}</Link>
              </div>
              <div className="story-grid">
                {hotStories.items.map(s => <StoryCard key={s.id} s={s} />)}
              </div>
            </section>

            {/* Latest Releases Section */}
            <section className="section">
              <div className="section-header">
                <h2>{t('latestReleases')}</h2>
                <Link to="/search?sortBy=updatedAt&order=desc" className="view-all">{t('viewAll')}</Link>
              </div>
              <div className="story-grid">
                {latestStories.items.map(s => <StoryCard key={s.id} s={s} />)}
              </div>
            </section>

            {/* Home page now relies solely on Popular and Latest. Search handles querying. */}
          </div>

          <aside className="sidebar">
            {/* History Section */}
            <div className="sidebar-section">
              <h3>{t('readingHistory')}</h3>
              {history.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '13px', fontStyle: 'italic' }}>{t('noHistory')}</p>
              ) : (
                <ul className="bookmark-list">
                  {history.map(item => (
                    <li key={item.storyId}>
                      <Link to={`/story/${item.storyId}/chapter/${item.chapterNumber}`}>
                        <div className="bookmark-item">
                          <div className="bookmark-title">{item.title}</div>
                          <div className="bookmark-chapter">{t('continueAt')} {item.chapterNumber}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bookmarks */}
            {user && (
              <div className="sidebar-section">
                <h3>{t('bookmarks')}</h3>
                {bookmarks.length === 0 ? (
                  <p>{t('noBookmarks')}</p>
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
                <Link to="/profile" className="view-all">{t('viewAll')}</Link>
              </div>
            )}

            {/* Categories */}
            <div className="sidebar-section">
              <h3>{t('genre')}</h3>
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
              <h3>{t('browse')}</h3>
              <div className="quick-links">
                <Link to="/search?status=ONGOING">{t('ongoing')}</Link>
                <Link to="/search?status=COMPLETED">{t('completed')}</Link>
                <Link to="/search?sortBy=updatedAt">{t('latest')}</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}