import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [mode, setMode]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message === 'Invalid login credentials' ? 'メールアドレスまたはパスワードが違います' : err.message);
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) {
        setError(err.message);
      } else {
        setMessage('確認メールを送信しました。受信トレイをご確認ください。');
      }
    }
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
        width: 320,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}>
        <div style={{ fontSize: 48 }}>📅</div>
        <div style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
          店舗業務カレンダー
        </div>
        <div style={{ display: 'flex', width: '100%', borderRadius: 8, overflow: 'hidden', border: '1.5px solid #ddd' }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setMessage(''); }}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: 14,
                fontWeight: '600',
                backgroundColor: mode === m ? '#2563eb' : '#fff',
                color: mode === m ? '#fff' : '#666',
                borderRight: m === 'login' ? '1px solid #ddd' : 'none',
              }}
            >
              {m === 'login' ? 'ログイン' : 'サインアップ'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="メールアドレス"
            required
            autoFocus
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
          {message && (
            <div style={{ color: '#27ae60', fontSize: 13, textAlign: 'center' }}>{message}</div>
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
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </button>
        </form>
      </div>
    </div>
  );
}
