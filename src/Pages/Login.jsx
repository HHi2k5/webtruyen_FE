import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      if (user.role === 'admin') {
        nav('/admin/stories');
      } else {
        nav('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section className="auth-card animate-fade" style={{ width: '100%' }}>
        <h2 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'white' }}>Welcome Back</h2>
        <p style={{ color: 'var(--muted)', margin: '0 0 24px 0', fontSize: '14px' }}>Log in to continue reading your favorite mangas</p>
        
        {error && <div style={{ background: 'rgba(225, 29, 72, 0.1)', color: '#ff4d6d', border: '1px solid rgba(225, 29, 72, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
            Log In
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Register here</Link>
        </p>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          Demo Credentials: admin@example.com / admin123
        </p>
      </section>
    </div>
  );
}
