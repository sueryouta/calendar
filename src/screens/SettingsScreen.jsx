import { useState, useEffect } from 'react';
import { getSettings, updateSettings, subscribe } from '../store/taskStore';
import { getCategories, subscribeCategories } from '../store/categoryStore';
import { toggleTheme } from '../store/themeStore';
import useTheme, { useIsDark } from '../hooks/useTheme';
import { supabase } from '../lib/supabase';

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export default function SettingsScreen() {
  const C = useTheme();
  const isDark = useIsDark();
  const [state, setState]       = useState({ settings: getSettings() });
  const [categories, setCategories] = useState(getCategories());

  useEffect(() => {
    const u1 = subscribe(setState);
    const u2 = subscribeCategories(setCategories);
    return () => { u1(); u2(); };
  }, []);

  const settings = state.settings;

  function toggleClosedDay(dayIndex) {
    const current = settings.closedDays || [];
    const next = current.includes(dayIndex)
      ? current.filter(d => d !== dayIndex)
      : [...current, dayIndex];
    updateSettings({ closedDays: next });
  }

  const section = {
    backgroundColor: C.white,
    marginLeft: 16, marginRight: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  };

  return (
    <div style={{ flex: 1, backgroundColor: C.background, overflowY: 'auto' }}>

      {/* Display settings */}
      <div style={section}>
        <span style={{ fontSize: 13, fontWeight: '700', color: C.textLight, display: 'block', marginBottom: 12, textTransform: 'uppercase' }}>表示設定</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 10 }}>
          <span style={{ fontSize: 15, color: C.text }}>🌙 ダークモード</span>
          {/* Toggle switch */}
          <button
            onClick={toggleTheme}
            style={{
              width: 44, height: 24, borderRadius: 12,
              backgroundColor: isDark ? C.primary : C.border,
              position: 'relative', cursor: 'pointer',
              transition: 'background-color 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 2,
              left: isDark ? 22 : 2,
              width: 20, height: 20, borderRadius: 10,
              backgroundColor: isDark ? '#fff' : C.textLight,
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
      </div>

      {/* Closed days */}
      <div style={section}>
        <span style={{ fontSize: 13, fontWeight: '700', color: C.textLight, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>定休日設定</span>
        <span style={{ fontSize: 12, color: C.textLight, display: 'block', marginBottom: 12 }}>定休日は逆算スケジュールの作業日から除外されます</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DAY_LABELS.map((label, i) => {
            const closed = (settings.closedDays || []).includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleClosedDay(i)}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  border: `1.5px solid ${closed ? C.danger : C.border}`,
                  backgroundColor: closed ? C.danger : 'transparent',
                  color: closed ? '#fff' : C.text,
                  fontSize: 14, fontWeight: closed ? '700' : '400',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category legend */}
      <div style={section}>
        <span style={{ fontSize: 13, fontWeight: '700', color: C.textLight, display: 'block', marginBottom: 12, textTransform: 'uppercase' }}>カテゴリ凡例</span>
        {categories.map(cat => (
          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6, paddingBottom: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cat.color }} />
            <span style={{ fontSize: 14, color: C.text }}>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* About */}
      <div style={section}>
        <span style={{ fontSize: 13, fontWeight: '700', color: C.textLight, display: 'block', marginBottom: 12, textTransform: 'uppercase' }}>アプリ情報</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}>
          <span style={{ fontSize: 15, color: C.text }}>バージョン</span>
          <span style={{ fontSize: 13, color: C.textLight }}>1.0.0</span>
        </div>
        <div style={{ height: 1, backgroundColor: C.border }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}>
          <span style={{ fontSize: 15, color: C.text }}>データ保存先</span>
          <span style={{ fontSize: 13, color: C.textLight }}>Supabase</span>
        </div>
      </div>

      {/* Logout */}
      <div style={{ ...section }}>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 8,
            border: `1.5px solid ${C.danger}`,
            backgroundColor: 'transparent',
            color: C.danger,
            fontSize: 15,
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ログアウト
        </button>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}
