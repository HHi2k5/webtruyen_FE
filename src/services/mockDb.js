
import { getJson, setJson, uid } from '../utils/storage.js';

const KEY = 'db_v1';

const seed = () => ({
  users: [
    { id: 'u_admin', name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { id: 'u_user',  name: 'User',  email: 'user@example.com',  password: 'user123',  role: 'user' },
  ],
  categories: [
    { id: uid(), name: 'Action', slug: 'action' },
    { id: uid(), name: 'Romance', slug: 'romance' },
    { id: uid(), name: 'Fantasy', slug: 'fantasy' },
  ],
  stories: [
    { id: uid(), title: 'Tu Tiên Chí Tôn', author: 'A. Tác giả', status: 'ongoing', description: 'Mô tả...', coverUrl: 'https://picsum.photos/300/400?random=31', createdAt: Date.now(), updatedAt: Date.now() },
    { id: uid(), title: 'Thiên Hạ Kiếm', author: 'B. Tác giả', status: 'ongoing', description: 'Mô tả...', coverUrl: 'https://picsum.photos/300/400?random=32', createdAt: Date.now(), updatedAt: Date.now() },
  ],
  story_categories: [],
  chapters: [
    // ví dụ 3 chương cho story 0
    // sẽ gán động ở init()
  ],
  comments: [],
  chapter_bookmarks: [],
});

export function getDb() {
  let db = getJson(KEY);
  if (!db) {
    db = seed();
    // tạo chapter mẫu cho story đầu
    const s0 = db.stories[0];
    for (let i = 1; i <= 3; i++) {
      db.chapters.push({
        id: uid(),
        story_id: s0.id,
        chapter_number: i,
        title: `Chương ${i}`,
        pages: Array.from({ length: 5 }, (_, p) => `https://picsum.photos/980/1400?random=${i * 10 + p}`),
        createdAt: Date.now(),
      });
    }
    setJson(KEY, db);
  }
  return db;
}
export function setDb(db) { setJson(KEY, db); }
