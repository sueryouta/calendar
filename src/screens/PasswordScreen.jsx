import { useState } from 'react';

const CORRECT_PASSWORD = 'megane2024';
const STORAGE_KEY = 'app_auth';

export function isAuthenticated() {
  return localStorage.getItem(STORAGE_KEY) === CORRECT_PASSWORD;
}

export function saveAuth() {
  localStorage.setItem(STORAGE_KEY, CORRECT_PASSWORD);
}

export default function PasswordScreen({ onSuccess }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      saveAuth();
      onSuccess();
    } else {
      setError(true);
      setInput('');
    }
  }

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
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
          パスワードを入力
        </div>
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="パスワード"
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 16,
              border: `1.5px solid ${error ? '#e53e3e' : '#ccc'}`,
              borderRadius: 8,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ color: '#e53e3e', fontSize: 13, textAlign: 'center' }}>
              パスワードが違います
            </div>
          )}
          <button
            type="submit"
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 0',
              fontSize: 16,
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
