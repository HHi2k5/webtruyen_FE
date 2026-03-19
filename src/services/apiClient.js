import { getDb, setDb } from './mockDb.js';
import { uid } from '../utils/storage.js';

// ===== USERS & AUTH =====
export function getUserById(id) {
  const db = getDb();
  return db.users.find(u => u.id === id) || null;
}
export function login(email, password) {
  const db = getDb();
  const u = db.users.find(x => x.email === email && x.password === password);
  if (!u) throw new Error('Incorrect email or password');
  return u;
}
export function register({ name, email, password, role = 'user' }) {
  const db = getDb();
  if (db.users.some(u => u.email === email)) throw new Error('Email already exists');
  const u = { id: uid(), name, email, password, role };
  db.users.push(u);
  setDb(db);
  return u;
}

// user management (admin)
export function listUsers() {
  return getDb().users;
}
export function updateUser(id, data) {
  const db = getDb();
  const i = db.users.findIndex(u => u.id === id);
  if (i < 0) throw new Error('User does not exist');
  
  if (data.email && db.users.some(u => u.email === data.email && u.id !== id)) {
    throw new Error('Email already exists. Please choose a different email.');
  }

  db.users[i] = { ...db.users[i], ...data };
  setDb(db);
  return db.users[i];
}
export function deleteUser(id) {
  const db = getDb();
  db.users = db.users.filter(u => u.id !== id);
  // optionally remove related data (bookmarks/comments)
  db.chapter_bookmarks = db.chapter_bookmarks.filter(bm => bm.user_id !== id);
  db.comments = db.comments.filter(c => c.user_id !== id);
  setDb(db);
}

// ===== CATEGORIES =====
export function listCategories() { return getDb().categories; }
export function createCategory({ name, slug }) {
  const db = getDb();
  if (db.categories.some(c => c.slug === slug)) throw new Error('Slug already exists');
  const cat = { id: uid(), name, slug };
  db.categories.push(cat); setDb(db); return cat;
}
export function updateCategory(id, data) {
  const db = getDb();
  const i = db.categories.findIndex(c => c.id === id);
  if (i < 0) throw new Error('Not found');
  if (data.slug && db.categories.some(c => c.slug === data.slug && c.id !== id)) throw new Error('Slug already exists');
  db.categories[i] = { ...db.categories[i], ...data }; setDb(db); return db.categories[i];
}
export function deleteCategory(id) {
  const db = getDb();
  db.categories = db.categories.filter(c => c.id !== id);
  db.story_categories = db.story_categories.filter(sc => sc.category_id !== id);
  setDb(db);
}

// ===== STORIES =====
export function listStories({ q, categoryId, status, author, sortBy='updatedAt', order='desc', page=1, pageSize=12 }) {
  const db = getDb();
  let arr = [...db.stories];
  if (q) arr = arr.filter(s => s.title.toLowerCase().includes(q.toLowerCase()));
  if (status) arr = arr.filter(s => s.status === status);
  if (author) arr = arr.filter(s => s.author?.toLowerCase().includes(author.toLowerCase()));
  if (categoryId) {
    const storyIds = new Set(db.story_categories.filter(sc => sc.category_id === categoryId).map(x => x.story_id));
    arr = arr.filter(s => storyIds.has(s.id));
  }
  arr.sort((a,b)=>{
    const vA = a[sortBy] ?? 0, vB = b[sortBy] ?? 0;
    return order === 'asc' ? vA - vB : vB - vA;
  });
  const total = arr.length;
  const start = (page-1)*pageSize;
  const items = arr.slice(start, start+pageSize);
  return { items, total, page, pageSize };
}
export function getStory(storyId) {
  const db = getDb();
  const story = db.stories.find(s => s.id === storyId);
  if (!story) throw new Error('Story not found');
  const cats = db.story_categories.filter(sc => sc.story_id === storyId).map(sc => db.categories.find(c => c.id === sc.category_id));
  return { ...story, categories: cats };
}
export function createStory(data) {
  const db = getDb();
  const now = Date.now();
  const s = { id: uid(), createdAt: now, updatedAt: now, ...data };
  db.stories.push(s); setDb(db); return s;
}
export function updateStory(id, data) {
  const db = getDb();
  const i = db.stories.findIndex(s => s.id === id);
  if (i < 0) throw new Error('Story not found');
  db.stories[i] = { ...db.stories[i], ...data, updatedAt: Date.now() };
  setDb(db); return db.stories[i];
}
export function deleteStory(id) {
  const db = getDb();
  db.stories = db.stories.filter(s => s.id !== id);
  db.chapters = db.chapters.filter(ch => ch.story_id !== id);
  db.story_categories = db.story_categories.filter(sc => sc.story_id !== id);
  db.comments = db.comments.filter(c => c.story_id !== id);
  setDb(db);
}

// ===== STORY CATEGORIES (gán thể loại) =====
export function setStoryCategories(storyId, categoryIds) {
  const db = getDb();
  db.story_categories = db.story_categories.filter(sc => sc.story_id !== storyId);
  for (const cid of categoryIds) db.story_categories.push({ story_id: storyId, category_id: cid });
  setDb(db);
}
export function getUserBookmarks(userId) {
  const db = getDb();
  const bookmarks = db.chapter_bookmarks.filter(bm => bm.user_id === userId);
  const chapters = bookmarks.map(bm => {
    const chapter = db.chapters.find(ch => ch.id === bm.chapter_id);
    if (!chapter) return null;
    const story = db.stories.find(s => s.id === chapter.story_id);
    if (!story) return null;
    
    const storyChapters = db.chapters.filter(c => c.story_id === story.id);
    let latestChapterNumber = null;
    if (storyChapters.length > 0) {
      latestChapterNumber = Math.max(...storyChapters.map(c => Number(c.chapter_number) || 0));
    }
    
    return { ...chapter, story, latestChapterNumber };
  }).filter(Boolean);
  return chapters;
}
export function toggleChapterBookmark(userId, chapterId) {
  const db = getDb();
  const existing = db.chapter_bookmarks.find(bm => bm.user_id === userId && bm.chapter_id === chapterId);
  if (existing) {
    db.chapter_bookmarks = db.chapter_bookmarks.filter(bm => bm !== existing);
  } else {
    db.chapter_bookmarks.push({ user_id: userId, chapter_id: chapterId });
  }
  setDb(db);
  return !existing; // true if added, false if removed
}
export function isBookmarked(userId, chapterId) {
  const db = getDb();
  return db.chapter_bookmarks.some(bm => bm.user_id === userId && bm.chapter_id === chapterId);
}
export function addBookmark(userId, chapterId) {
  const db = getDb();
  if (!db.chapter_bookmarks.some(bm => bm.user_id === userId && bm.chapter_id === chapterId)) {
    db.chapter_bookmarks.push({ user_id: userId, chapter_id: chapterId });
    setDb(db);
  }
}
export function removeBookmark(userId, chapterId) {
  const db = getDb();
  db.chapter_bookmarks = db.chapter_bookmarks.filter(bm => !(bm.user_id === userId && bm.chapter_id === chapterId));
  setDb(db);
}

// ===== CHAPTERS =====
export function listChapters(storyId, { page=1, pageSize=20, order='asc' } = {}) {
  const db = getDb();
  let arr = db.chapters.filter(ch => ch.story_id === storyId);
  arr.sort((a,b)=> order==='asc' ? a.chapter_number - b.chapter_number : b.chapter_number - a.chapter_number);
  const total = arr.length;
  const start = (page-1)*pageSize;
  const items = arr.slice(start, start+pageSize);
  return { items, total, page, pageSize };
}
export function getChapterByNumber(storyId, chapter_number) {
  const db = getDb();
  const ch = db.chapters.find(c => c.story_id === storyId && c.chapter_number === Number(chapter_number));
  if (!ch) throw new Error('Chapter not found');
  return ch;
}
export function createChapter({ story_id, chapter_number, title, pages }) {
  const db = getDb();
  if (db.chapters.some(c => c.story_id === story_id && Number(c.chapter_number) === Number(chapter_number))) {
    throw new Error('Chapter number already exists for this story');
  }
  const ch = { id: uid(), story_id, chapter_number: Number(chapter_number), title, pages, createdAt: Date.now() };
  db.chapters.push(ch); setDb(db); return ch;
}
export function updateChapter(id, data) {
  const db = getDb();
  const i = db.chapters.findIndex(c => c.id === id);
  if (i < 0) throw new Error('Chapter not found');
  // nếu đổi chapter_number, áp ràng buộc unique
  if (data.chapter_number != null) {
    const ch = db.chapters[i];
    if (db.chapters.some(c => c.story_id === ch.story_id && Number(c.chapter_number) === Number(data.chapter_number) && c.id !== id)) {
      throw new Error('Chapter number already exists for this story');
    }
  }
  db.chapters[i] = { ...db.chapters[i], ...data }; setDb(db); return db.chapters[i];
}
export function deleteChapter(id) {
  const db = getDb();
  db.chapters = db.chapters.filter(c => c.id !== id);
  db.comments = db.comments.filter(cm => cm.chapter_id !== id);
  db.chapter_bookmarks = db.chapter_bookmarks.filter(bm => bm.chapter_id !== id);
  setDb(db);
}

export function listComments({ story_id, chapter_id }) {
  const db = getDb();
  let arr = db.comments;
  if (story_id) arr = arr.filter(c => c.story_id === story_id);
  if (chapter_id) arr = arr.filter(c => c.chapter_id === chapter_id);
  return arr.sort((a,b)=>a.createdAt - b.createdAt);
}
export function createComment({ user_id, story_id, chapter_id, parent_id, content }) {
  const db = getDb();
  const cm = { id: uid(), user_id, story_id, chapter_id, parent_id: parent_id || null, content, createdAt: Date.now() };
  db.comments.push(cm); setDb(db); return cm;
}
export function deleteComment(id, { requester }) {
  const db = getDb();
  const cm = db.comments.find(c => c.id === id);
  if (!cm) return;
  if (requester.role !== 'admin' && requester.id !== cm.user_id) throw new Error('Permission denied to delete');
  
  const idsToDelete = new Set([id]);
  db.comments.forEach(c => { if (c.parent_id === id) idsToDelete.add(c.id); });
  
  db.comments = db.comments.filter(c => !idsToDelete.has(c.id)); 
  setDb(db);
}
