import React, { useMemo, useState } from 'react';
import * as api from '../services/apiClient.js';

export default function AdminUsers() {
  const [q, setQ] = useState('');
  const list = useMemo(() => api.listUsers().filter(u => u.name.toLowerCase().includes(q.toLowerCase())), [q]);

  const updateRole = (id) => {
    const role = prompt('Vai trò mới (user/admin)?'); if (!role) return;
    api.updateUser(id, { role });
  };

  const renameUser = (id) => {
    const name = prompt('Tên mới?'); if (!name) return;
    api.updateUser(id, { name });
  };


  const del = (id) => { if (confirm('Xoá người dùng?')) api.deleteUser(id); };

  const create = () => {
    const name = prompt('Tên'); if (!name) return;
    const email = prompt('Email'); if (!email) return;
    const password = prompt('Mật khẩu'); if (!password) return;
    const role = prompt('Vai trò (user/admin)', 'user') || 'user';
    try {
      const u = api.register({ name, email, password, role });
      alert('Đã tạo: ' + u.name);
    } catch (e) { alert(e.message); }
  };

  return (
    <section>
      <h2>Quản lý người dùng</h2>
      <div className="row">
        <input placeholder="Tìm" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <button onClick={create}>Tạo người dùng mới</button>
      <table className="table" style={{marginTop:'12px'}}>
        <thead><tr><th>Tên</th><th>Email</th><th>Vai trò</th><th>Hành động</th></tr></thead>
        <tbody>
          {list.map(u=>(
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={()=>renameUser(u.id)}>Đổi tên</button>
                <button onClick={()=>updateRole(u.id)}>Đổi vai trò</button>
                <button className="danger" onClick={()=>del(u.id)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
