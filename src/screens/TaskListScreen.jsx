import { useState, useEffect } from 'react';
import { getTasks, subscribe } from '../store/taskStore';
import TaskCard from '../components/TaskCard';
import useTheme from '../hooks/useTheme';

const FILTERS = [
  { key: 'all',       label: 'すべて' },
  { key: 'honsha',   label: '本社指示' },
  { key: 'store',    label: '店舗自主' },
  { key: 'routine',  label: '定期業務' },
  { key: 'incomplete', label: '未完了' },
];

export default function TaskListScreen({ navigate }) {
  const C = useTheme();
  const [state, setState] = useState({ tasks: getTasks() });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsub = subscribe(setState);
    return unsub;
  }, []);

  const mainTasks = state.tasks.filter(t => !t.isCheckpoint);
  const filtered  = mainTasks.filter(t => {
    if (filter === 'all')        return true;
    if (filter === 'incomplete') return !t.completed;
    return t.category === filter;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.deadline.localeCompare(b.deadline);
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: C.background, overflow: 'hidden' }}>
      {/* Filter chips */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        padding: 12,
        gap: 8,
        flexWrap: 'wrap',
        backgroundColor: C.white,
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              paddingLeft: 14,
              paddingRight: 14,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 20,
              border: `1.5px solid ${filter === f.key ? C.primary : C.border}`,
              backgroundColor: filter === f.key ? C.primary : 'transparent',
              color: filter === f.key ? '#fff' : C.textLight,
              fontSize: 13,
              fontWeight: filter === f.key ? '700' : '400',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 80 }}>
        {sorted.length === 0
          ? <span style={{ display: 'block', textAlign: 'center', color: C.textLight, paddingTop: 40, fontSize: 15 }}>タスクがありません</span>
          : sorted.map(t => <TaskCard key={t.id} task={t} />)
        }
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('AddTask')}
        style={{
          position: 'absolute',
          bottom: 80,
          right: 24,
          backgroundColor: C.primary,
          color: '#fff',
          width: 56,
          height: 56,
          borderRadius: 28,
          fontSize: 28,
          lineHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${C.primary}66`,
          zIndex: 10,
        }}
      >
        ＋
      </button>
    </div>
  );
}
