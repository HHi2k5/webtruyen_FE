import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/apiClient.js';

export default function AdminStories() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', author:'', status:'ongoing', coverUrl:'', description:'' });
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');
  const list = useMemo(()=>api.listStories({ q, page:1, pageSize:999 }).items, [q]);

  const create = () => {
    try {
      const s = api.createStory(form);
      alert('Đã tạo: ' + s.title);
      setForm({ title:'', author:'', status:'ongoing', coverUrl:'', description:'' });
    } catch(e){ alert(e.message); }
  };

  const beginEdit = (story) => {
    setEditing(story);
    setForm({
      title: story.title,
      author: story.author,
      status: story.status,
      coverUrl: story.coverUrl || '',
      description: story.description || ''
    });
  };
  const cancelEdit = () => {
    setEditing(null);
    setForm({ title:'', author:'', status:'ongoing', coverUrl:'', description:'' });
  };
  const saveEdit = () => {
    if (!editing) return;
    api.updateStory(editing.id, form);
    alert('Đã cập nhật');
    setEditing(null);
    setForm({ title:'', author:'', status:'ongoing', coverUrl:'', description:'' });
  };

  const updateTitle = (id) => {
    const title = prompt('Tên mới?'); if (!title) return;
    api.updateStory(id, { title });
  };

  const updateDescription = (id) => {
    const desc = prompt('Mô tả mới?'); if (desc == null) return;
    api.updateStory(id, { description: desc });
    alert('Đã cập nhật mô tả');
  }; 

  const del = (id) => { if (confirm('Xoá truyện và toàn bộ chương?')) api.deleteStory(id); };

  const quickCats = (storyId) => {
    const current = api.getStory(storyId).categories.map(c=>c.id);
    const picked = prompt(`Nhập danh sách categoryId (cách nhau bởi dấu phẩy)\nHiện tại: ${current.join(', ')}`) ?? '';
    const arr = picked.split(',').map(s=>s.trim()).filter(Boolean);
    api.setStoryCategories(storyId, arr);
    alert('Đã lưu');
  };

  return (
    <section>
      <h2>Quản lý truyện</h2>
      <div className="admin-form-card">
        <h3>{editing ? 'Chỉnh sửa truyện' : 'Tạo truyện mới'}</h3>
        <div className="admin-field">
          <label>Tiêu đề:</label>
          <input placeholder="Tiêu đề" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
        </div>
        <div className="admin-field">
          <label>Tác giả:</label>
          <input placeholder="Tác giả" value={form.author} onChange={e=>setForm({...form, author: e.target.value})} />
        </div>
        <div className="admin-field">
          <label>Trạng thái:</label>
          <select value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
            <option value="ongoing">Đang ra</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
        <div className="admin-field">
          <label>Ảnh bìa URL:</label>
          <input placeholder="Ảnh bìa URL" value={form.coverUrl} onChange={e=>setForm({...form, coverUrl: e.target.value})} />
        </div>
        <div className="admin-field">
          <label>Mô tả:</label>
          <input placeholder="Mô tả" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
        </div>
        {editing ? (
          <>
            <button onClick={saveEdit} className="primary">Cập nhật truyện</button>
            <button onClick={cancelEdit}>Huỷ</button>
          </>
        ) : (
          <button onClick={create} className="primary">Tạo</button>
        )}
      </div>

      <div className="row" style={{marginTop:'20px'}}>
        <input placeholder="Tìm" value={q} onChange={e=>setQ(e.target.value)} />
      </div>

      <table className="table">
        <thead><tr><th>Tiêu đề</th><th>Tác giả</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
        <tbody>
          {list.map(s=>(
            <tr key={s.id}>
              <td><Link to={`/story/${s.id}`}>{s.title}</Link></td>
              <td>{s.author}</td>
              <td>{s.status}</td>
              <td className="actions">
                <button onClick={()=>beginEdit(s)}>Sửa</button>
                <button onClick={()=>updateTitle(s.id)}>Sửa tên</button>
                <button onClick={()=>updateDescription(s.id)}>Sửa mô tả</button>
                <button onClick={()=>quickCats(s.id)}>Gán thể loại</button>
                <button onClick={()=>navigate(`/admin/chapters?storyId=${s.id}`)}>Chương</button>
                <button className="danger" onClick={()=>del(s.id)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}