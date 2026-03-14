import React, { useState } from 'react';
import * as api from '../services/apiClient.js';

export default function Categories() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [dummy, setDummy] = useState(0); // eslint-disable-line no-unused-vars
  const cats = api.listCategories();

  const create = () => {
    if (!name || !slug) return;
    try { api.createCategory({ name, slug }); setName(''); setSlug(''); setDummy(x=>x+1); }
    catch (e) { alert(e.message); }
  };

  const update = (id) => {
    const newName = prompt('Tên mới?');
    if (!newName) return;
    try { api.updateCategory(id, { name: newName }); setDummy(x=>x+1); }
    catch (e) { alert(e.message); }
  };

  const del = (id) => { if (confirm('Xoá?')) { api.deleteCategory(id); setDummy(x=>x+1); } };

  return (
    <section>
      <h2>Danh mục</h2>
      <div className="row">
        <input placeholder="Tên" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="slug" value={slug} onChange={e=>setSlug(e.target.value)} />
        <button onClick={create}>Thêm</button>
      </div>
      <table className="table">
        <thead><tr><th>Tên</th><th>Slug</th><th>Hành động</th></tr></thead>
        <tbody>
          {cats.map(c=>(
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td>
                <button onClick={()=>update(c.id)}>Sửa</button>
                <button className="danger" onClick={()=>del(c.id)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}