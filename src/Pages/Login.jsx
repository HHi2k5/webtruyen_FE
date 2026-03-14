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
    <section style={{ maxWidth: '400px', margin: '40px auto' }}>
      <h2>Đăng nhập</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%' }}>Đăng nhập</button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '12px' }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
      <p style={{ fontSize: '12px', color: '#a6b0da' }}>
        Demo: admin@example.com / admin123
      </p>
    </section>
  );
}
