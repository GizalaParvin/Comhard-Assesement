import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import TaskManager from './pages/TaskManager';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  function handleAuthSuccess(userData) {
    setUser(userData);
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Task Manager...</div>;
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} theme={theme} onToggleTheme={toggleTheme} />;
  }

  return <TaskManager user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />;
}

export default App;
