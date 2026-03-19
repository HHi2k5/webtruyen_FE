import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as api from '../services/apiClient.js';
import StoryCard from '../components/StoryCard.jsx';
import Paginator from '../components/Paginator.jsx';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categories = api.listCategories();

  // Read URL params
  const currentQ = searchParams.get('q') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentCategoryId = searchParams.get('categoryId') || '';
  const currentSortBy = searchParams.get('sortBy') || 'updatedAt';
  const currentOrder = searchParams.get('order') || 'desc';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 12;

  // Local state for inputs to allow typing before blur/submit
  const [q, setQ] = useState(currentQ);
  const [status, setStatus] = useState(currentStatus);
  const [categoryId, setCategoryId] = useState(currentCategoryId);
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [order, setOrder] = useState(currentOrder);

  // Sync local state when URL params change
  useEffect(() => {
    setQ(currentQ);
    setStatus(currentStatus);
    setCategoryId(currentCategoryId);
    setSortBy(currentSortBy);
    setOrder(currentOrder);
  }, [currentQ, currentStatus, currentCategoryId, currentSortBy, currentOrder]);

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) newParams.set(k, v); else newParams.delete(k);
    });
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    updateFilters({ q, status, categoryId, sortBy, order });
  };

  const result = useMemo(() => api.listStories({ 
    q: currentQ, 
    categoryId: currentCategoryId, 
    status: currentStatus, 
    sortBy: currentSortBy, 
    order: currentOrder, 
    page: currentPage, 
    pageSize 
  }), [currentQ, currentCategoryId, currentStatus, currentSortBy, currentOrder, currentPage]);

  return (
    <div className="search-page animate-fade" style={{ padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
      <div className="container">
        
        <div className="search-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Advanced Search</h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>Find your next favorite manga using our comprehensive filters.</p>
        </div>

        <div className="search-filters-card" style={{ background: 'var(--card-solid)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '8px', display: 'block' }}>Keywords</label>
              <div style={{ position: 'relative' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  placeholder="Search titles or authors..." 
                  value={q} 
                  onChange={e => setQ(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '8px', display: 'block' }}>Genre</label>
              <select value={categoryId} onChange={e => { setCategoryId(e.target.value); updateFilters({ categoryId: e.target.value }); }}>
                <option value="">All Genres</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '8px', display: 'block' }}>Status</label>
              <select value={status} onChange={e => { setStatus(e.target.value); updateFilters({ status: e.target.value }); }}>
                <option value="">All Statuses</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '8px', display: 'block' }}>Sort By</label>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); updateFilters({ sortBy: e.target.value }); }}>
                <option value="updatedAt">Latest Updated</option>
                <option value="createdAt">Newly Added</option>
                <option value="title">A-Z</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '44px', padding: '0 24px' }}>Search</button>
          </form>
        </div>

        <div className="search-results">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', color: 'white', margin: 0 }}>Search Results</h2>
            <span className="badge badge-user">{result.total} {result.total === 1 ? 'manga' : 'mangas'} found</span>
          </div>

          {result.items.length === 0 ? (
            <div className="empty-state text-center" style={{ padding: '60px 0' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" style={{ marginBottom: '16px' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <h3 style={{ color: 'white', marginBottom: '8px' }}>No matches found</h3>
              <p style={{ color: 'var(--muted)' }}>Try adjusting your filters or search keywords.</p>
              <Link to="/search" className="btn btn-ghost" style={{ marginTop: '16px' }}>Clear all filters</Link>
            </div>
          ) : (
            <div className="story-grid">
              {result.items.map(s => <StoryCard key={s.id} s={s} />)}
            </div>
          )}

          {result.total > pageSize && (
            <div style={{ marginTop: '40px' }}>
              <Paginator 
                total={result.total} 
                page={result.page} 
                pageSize={result.pageSize} 
                onChange={(p) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('page', p.toString());
                  setSearchParams(newParams);
                  window.scrollTo(0, 0);
                }} 
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
