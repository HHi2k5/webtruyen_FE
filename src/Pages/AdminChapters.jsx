import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as api from '../services/apiClient.js';

export default function AdminChapters() {
  const stories = useMemo(()=>api.listStories({ page:1, pageSize:999 }).items, []);
  const location = useLocation();
  const navigate = useNavigate();
  // attempt to read storyId from query param if provided
  const queryId = new URLSearchParams(location.search).get('storyId');
  const [storyId, setStoryId] = useState(queryId || stories[0]?.id);

  // if stories load later and queryId was given but not in list, fallback
  useEffect(()=>{
    if (queryId && !stories.find(s=>s.id===queryId)) {
      // clear invalid query
      setStoryId(stories[0]?.id);
      navigate('/admin/chapters', { replace: true });
    }
  }, [queryId, stories, navigate]);
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const res = useMemo(()=>storyId ? api.listChapters(storyId, { order, page, pageSize: 20 }) : { items: [], total:0, page:1, pageSize:20 }, [storyId, order, page]);

  const [form, setForm] = useState({ chapter_number:'', title:'', pagesCsv:'' });
  const [editing, setEditing] = useState(null);

  const create = () => {
    const pages = form.pagesCsv.split(',').map(s=>s.trim()).filter(Boolean);
    try {
      api.createChapter({ story_id: storyId, chapter_number: Number(form.chapter_number), title: form.title, pages });
      setForm({ chapter_number:'', title:'', pagesCsv:'' });
      alert('Đã tạo chương');
    } catch (e) { alert(e.message); }
  };

  const beginEdit = (ch) => {
    setEditing(ch);
    setForm({ chapter_number: ch.chapter_number.toString(), title: ch.title, pagesCsv: ch.pages.join(', ') });
  };
  const cancelEdit = () => {
    setEditing(null);
    setForm({ chapter_number:'', title:'', pagesCsv:'' });
  };
  const saveEdit = () => {
    if (!editing) return;
    const pages = form.pagesCsv.split(',').map(s=>s.trim()).filter(Boolean);
    api.updateChapter(editing.id, { chapter_number: Number(form.chapter_number), title: form.title, pages });
    alert('Đã cập nhật chương');
    setEditing(null);
    setForm({ chapter_number:'', title:'', pagesCsv:'' });
  };

  const rename = (id) => {
    const title = prompt('Tiêu đề mới?'); if (!title) return;
    api.updateChapter(id, { title });
  };

  const renum = (id) => {
    const num = prompt('Số chương mới?'); if (!num) return;
    try { api.updateChapter(id, { chapter_number: Number(num) }); }
    catch(e){ alert(e.message); }
  };

  const del = (id) => { if (confirm('Xoá chương?')) api.deleteChapter(id); };

  return (
    <section>
      <h2>Quản lý chương</h2>
      <div className="row">
        <select value={storyId} onChange={e=>{const id=e.target.value; setStoryId(id); setPage(1); navigate(`/admin/chapters?storyId=${id}`);}}>
          {stories.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <select value={order} onChange={e=>setOrder(e.target.value)}>
          <option value="asc">Cũ → mới</option>
          <option value="desc">Mới → cũ</option>
        </select>
      </div>

      <div className="admin-form-card">
        <h3>{editing ? 'Chỉnh sửa chương' : 'Tạo chương mới'}</h3>
        <div className="admin-field">
          <label>Số chương:</label>
          <input placeholder="Số chương" value={form.chapter_number} onChange={e=>setForm({...form, chapter_number:e.target.value})}/>
        </div>
        <div className="admin-field">
          <label>Tiêu đề:</label>
          <input placeholder="Tiêu đề" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        </div>
        <div className="admin-field">
          <label>Danh sách ảnh (URL, cách nhau bằng dấu phẩy):</label>
          <input placeholder="Danh sách ảnh (URL, cách nhau bằng dấu phẩy)" value={form.pagesCsv} onChange={e=>setForm({...form, pagesCsv:e.target.value})}/>
        </div>
        {editing ? (
          <>
            <button onClick={saveEdit} className="primary">Cập nhật</button>
            <button onClick={cancelEdit}>Huỷ</button>
          </>
        ) : (
          <button onClick={create} className="primary">Tạo chương</button>
        )}
      </div>

      <table className="table">
        <thead><tr><th>#</th><th>Tiêu đề</th><th>Hành động</th></tr></thead>
        <tbody>
          {res.items.map(ch=>(
            <tr key={ch.id}>
              <td>{ch.chapter_number}</td>
              <td>{ch.title}</td>
              <td>
                <button onClick={()=>beginEdit(ch)}>Sửa</button>
                <button onClick={()=>rename(ch.id)}>Đổi tên</button>
                <button onClick={()=>renum(ch.id)}>Đổi số chương</button>
                <button className="danger" onClick={()=>del(ch.id)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}