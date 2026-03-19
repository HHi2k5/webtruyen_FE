import React, { useMemo, useState } from 'react';
import * as api from '../services/apiClient.js';

export default function AdminUsers() {
  const [q, setQ] = useState('');
  const list = useMemo(() => api.listUsers().filter(u => u.name.toLowerCase().includes(q.toLowerCase())), [q]);

  const updateRole = (id) => {
    const role = prompt('New role (user/admin)?'); if (!role) return;
    api.updateUser(id, { role });
  };

  const renameUser = (id) => {
    const name = prompt('New name?'); if (!name) return;
    api.updateUser(id, { name });
  };


  const del = (id) => { if (confirm('Delete user?')) api.deleteUser(id); };

  const create = () => {
    const name = prompt('Name'); if (!name) return;
    const email = prompt('Email'); if (!email) return;
    const password = prompt('Password'); if (!password) return;
    const role = prompt('Role (user/admin)', 'user') || 'user';
    try {
      const u = api.register({ name, email, password, role });
      alert('Created: ' + u.name);
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h2>Manage Users</h2>
          <p className="sub-text">Manage and update member permissions</p>
        </div>
        <button className="btn btn-primary" onClick={create}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M16 11h6"/></svg>
          Add User
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search by name..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>
      </div>

      <div className="table-card">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan="4" className="text-center empty-state">No users found</td></tr>
            ) : list.map(u=>(
              <tr key={u.id}>
                <td>
                  <div className="user-name-cell">
                    <div className="avatar">{u.name.charAt(0).toUpperCase()}</div>
                    <span className="fw-500">{u.name}</span>
                  </div>
                </td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role === 'admin' ? 'admin' : 'user'}`}>
                    {u.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </td>
                <td className="actions text-right">
                  <button className="icon-btn btn-ghost" title="Rename" onClick={()=>renameUser(u.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="icon-btn btn-ghost" title="Change Role" onClick={()=>updateRole(u.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </button>
                  <button className="icon-btn btn-danger-ghost" title="Delete" onClick={()=>del(u.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
