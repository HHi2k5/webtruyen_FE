import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Register() {
  const nav = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password, role });
      nav('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
      <section className="auth-card animate-fade" style={{ width: '100%' }}>
        <h2 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'white' }}>Create an Account</h2>
        <p style={{ color: 'var(--muted)', margin: '0 0 24px 0', fontSize: '14px' }}>Join us to save bookmarks and leave comments</p>
        
        {error && <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#ff4d6d', border: '1px solid rgba(225, 29, 72, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              placeholder="e.g. MangaLover99"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter an email to use"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
            Register Account
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Log in</Link>
        </p>
      </section>
    </div>
  );
}
