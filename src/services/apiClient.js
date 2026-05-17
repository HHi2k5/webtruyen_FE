import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});

// Response interceptor for handling 401/403 (Unauthorized/Forbidden)
let logoutCallback = null;
export const setLogoutCallback = (cb) => { logoutCallback = cb; };

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (logoutCallback) logoutCallback();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Mapping utilities to convert backend camelCase to frontend snake_case requirements
const mapStory = s => s ? { ...s, coverUrl: s.coverImage || s.coverUrl } : s;
const mapChapter = c => c ? { ...c, chapter_number: c.chapterNumber ?? c.chapter_number } : c;
const mapComment = c => c ? { 
  ...c, 
  parent_id: c.parentId ?? c.parent_id,
  chapter_id: c.chapterId ?? c.chapter_id,
  story_id: (c.story?.id || c.storyId || c.story_id),
  user_id: (c.user?.id || c.userId || c.user_id),
  user: c.user || { id: c.userId || c.user_id, name: 'Anonymous' }
} : c;

// ===== USERS & AUTH =====
export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return { ...res.data, token: res.data.token || res.data.jwt };
}
export async function register({ name, email, password, role = 'user' }) {
  const res = await api.post('/auth/register', { name, email, password, role });
  return res.data;
}
export async function getUserById(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}
export async function listUsers({ q, page=1, pageSize=10 } = {}) {
  const params = { q, page, pageSize };
  try {
    const res = await api.get('/admin/users', { params });
    if (res.data && res.data.items) {
      return res.data;
    }
    // Fallback if backend hasn't updated yet
    return { items: res.data || [], total: (res.data || []).length, page: 1, pageSize };
  } catch (e) {
    return { items: [], total: 0, page: 1, pageSize };
  }
}
export async function updateUser(id, data) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}
export async function deleteUser(id) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
}

// ===== CATEGORIES =====
export async function listCategories() {
  try {
    const res = await api.get('/categories');
    return res.data || [];
  } catch (e) { return []; }
}
export async function createCategory(data) {
  const res = await api.post('/admin/categories', data);
  return res.data;
}
export async function updateCategory(id, data) {
  const res = await api.put(`/admin/categories/${id}`, data);
  return res.data;
}
export async function deleteCategory(id) {
  const res = await api.delete(`/admin/categories/${id}`);
  return res.data;
}

// ===== STORIES =====
export async function listStories({ q, categoryId, status, author, sortBy='updatedAt', order='desc', page=1, pageSize=12 }) {
  const params = { q, categoryId, status, author, sortBy, order, page, pageSize };
  try {
    const res = await api.get('/stories', { params });
    const items = res.data.content || res.data.items || res.data || [];
    return {
      items: items.map(mapStory),
      total: res.data.totalElements || res.data.total || items.length,
      page: res.data.number != null ? res.data.number + 1 : page,
      pageSize
    };
  } catch (e) {
    return { items: [], total: 0, page, pageSize };
  }
}
export async function getStory(storyId) {
  const res = await api.get(`/stories/${storyId}`);
  return mapStory(res.data);
}
export async function createStory(data) {
  const payload = { 
    ...data, 
    coverImage: data.coverImage || data.coverUrl,
    categories: (data.selectedCategories || []).map(id => ({ id }))
  };
  const res = await api.post('/admin/stories', payload);
  return mapStory(res.data);
}
export async function updateStory(id, data) {
  const payload = { 
    ...data, 
    coverImage: data.coverImage || data.coverUrl,
    categories: (data.selectedCategories || []).map(id => ({ id }))
  };
  const res = await api.put(`/admin/stories/${id}`, payload);
  return mapStory(res.data);
}
export async function deleteStory(id) {
  const res = await api.delete(`/admin/stories/${id}`);
  return res.data;
}
export async function setStoryCategories(storyId, categoryIds) {
  return await updateStory(storyId, { selectedCategories: categoryIds });
}
export async function incrementViews(storyId) {
  try {
    await api.patch(`/stories/${storyId}/views`);
  } catch (e) {
    console.error('Failed to increment views', e);
  }
}

// ===== BOOKMARKS =====
export async function getUserBookmarks(userId, { page = 1, pageSize = 10 } = {}) {
  try {
    const res = await api.get(`/bookmarks/user/${userId}`, { params: { page, pageSize } });
    const items = res.data.items || [];
    
    // Convert backend ChapterBookmark mapping
    const hydrated = await Promise.all(items.map(async bm => {
      const chapter = mapChapter(bm.chapter);
      if (!chapter) return null;
      
      const storyId = chapter.story?.id || chapter.story_id || bm.storyId || bm.story_id;
      if (!storyId) return chapter;
      
      const story = mapStory(chapter.story || await getStory(storyId).catch(() => null));
      const allChaptersRes = await listChapters(storyId, { pageSize: 1, order: 'desc' });
      const latestChapterNumber = allChaptersRes.items[0]?.chapter_number || 0;
      
      return { ...chapter, story, latestChapterNumber };
    }));
    
    return {
      items: hydrated.filter(Boolean),
      total: res.data.total || items.length,
      page: res.data.page || page,
      pageSize: res.data.pageSize || pageSize
    };
  } catch(e) { return { items: [], total: 0, page, pageSize }; }
}
export async function toggleChapterBookmark(userId, chapterId) {
  const res = await api.post('/bookmarks/toggle', null, { params: { userId, chapterId }});
  return res.data;
}
export async function isBookmarked(userId, chapterId) {
  try {
    const res = await api.get('/bookmarks/check', { params: { userId, chapterId }});
    return res.data;
  } catch(e) { return false; }
}

// ===== CHAPTERS =====
export async function listChapters(storyId, { page=1, pageSize=20, order='asc' } = {}) {
  try {
    const res = await api.get(`/stories/${storyId}/chapters`, { params: { page, pageSize, order } });
    const items = res.data.content || res.data.items || res.data || [];
    return {
      items: items.map(mapChapter),
      total: res.data.totalElements || items.length,
      page: res.data.number != null ? res.data.number + 1 : page,
      pageSize
    };
  } catch(e) { return { items: [], total: 0, page, pageSize }; }
}
export async function getChapterByNumber(storyId, chapter_number) {
  const res = await api.get(`/stories/${storyId}/chapters/${chapter_number}`);
  return mapChapter(res.data);
}
export async function createChapter(data) {
  const payload = { ...data, chapterNumber: data.chapter_number };
  const res = await api.post(`/admin/stories/${data.story_id}/chapters`, payload);
  return mapChapter(res.data);
}
export async function updateChapter(id, data) {
  const storyId = data.story_id || 1;
  const payload = { ...data, chapterNumber: data.chapter_number };
  const res = await api.put(`/admin/stories/${storyId}/chapters/${id}`, payload);
  return mapChapter(res.data);
}
export async function deleteChapter(id, storyId = 1) {
  const res = await api.delete(`/admin/stories/${storyId}/chapters/${id}`);
  return res.data;
}

// ===== COMMENTS =====
export async function listComments({ story_id, chapter_id, page=1, pageSize=20 }) {
  try {
    const endpoint = (story_id || chapter_id) ? '/comments' : '/admin/comments';
    const res = await api.get(endpoint, { params: { storyId: story_id, chapterId: chapter_id, page, pageSize } });
    if (res.data && res.data.items) {
      return {
        ...res.data,
        items: res.data.items.map(mapComment)
      };
    }
    return { items: (res.data || []).map(mapComment), total: (res.data || []).length, page: 1, pageSize };
  } catch(e) { return { items: [], total: 0, page: 1, pageSize }; }
}
export async function createComment(data) {
  const request = {
    userId: data.user_id,
    storyId: data.story_id,
    chapterId: data.chapter_id,
    parentId: data.parent_id,
    content: data.content
  };
  const res = await api.post('/comments', request);
  return mapComment(res.data);
}
export async function deleteComment(id, options) {
  const res = await api.delete(`/admin/comments/${id}`);
  return res.data;
}
