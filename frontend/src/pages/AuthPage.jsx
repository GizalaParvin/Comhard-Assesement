import React, { useState } from 'react';

function AuthPage({ onAuthSuccess, theme, onToggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>✓</div>
        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-dark, #1e3a8a)' }}>TaskFlow</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={onToggleTheme}
          style={{
            background: 'var(--bg-alt)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
        </button>
      </div>

      <h2>{isLogin ? 'Login to Your Account' : 'Create an Account'}</h2>

      {/* Demo Credentials Helper */}
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setEmail('demo@example.com');
            setPassword('password123');
            setError('');
          }}
          style={{ width: '100%', background: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8', fontSize: '0.8rem' }}
        >
          Quick Demo Login (demo@example.com)
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          style={{ border: 'none', background: 'none', color: '#2563eb', padding: '0', textDecoration: 'underline' }}
        >
          {isLogin ? 'Sign up' : 'Login'}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
