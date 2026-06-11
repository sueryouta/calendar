import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = `${username.trim()}@gmail.com`;
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError('ユーザー名またはパスワードが違います');
    setLoading(false);
  }

  const inp = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 16,
    border: '1.5px solid #ccc',
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      backgroundColor: '#f0f4f8',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: '40px 32px',
        width: 300,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}>
        <div style={{ fontSize: 48 }}>📅</div>
        <div style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
          店舗業務カレンダー
        </div>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            placeholder="ユーザー名"
            required
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            style={inp}
          />
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="パスワード"
            required
            style={inp}
          />
          {error && (
            <div style={{ color: '#e53e3e', fontSize: 13, textAlign: 'center' }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#93b4f5' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 0',
              fontSize: 16,
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? '処理中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
