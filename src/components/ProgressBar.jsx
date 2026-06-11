import useTheme from '../hooks/useTheme';

export default function ProgressBar({ total, completed, label }) {
  const C = useTheme();
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
        {label || `今週 ${total}件中 ${completed}件完了`}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, backgroundColor: C.secondary, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: '700', color: C.secondary, minWidth: 36, textAlign: 'right' }}>{pct}%</span>
      </div>
    </div>
  );
}
