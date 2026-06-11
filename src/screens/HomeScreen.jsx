import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getTasks, subscribe } from '../store/taskStore';
import { getCategories } from '../store/categoryStore';
import TaskCard from '../components/TaskCard';
import ProgressBar from '../components/ProgressBar';
import useTheme from '../hooks/useTheme';

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const HONSHA_DAYS = [2, 4];

export default function HomeScreen({ navigate }) {
  const C = useTheme();
  const [state, setState] = useState({ tasks: getTasks() });

  useEffect(() => {
    const unsub = subscribe(setState);
    return unsub;
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr  = format(today, 'yyyy-MM-dd');
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd   = endOfWeek(today, { weekStartsOn: 1 });

  const allTasks   = state.tasks.filter(t => !t.isCheckpoint);
  const weekTasks  = allTasks.filter(t => {
    try { return isWithinInterval(parseISO(t.deadline), { start: weekStart, end: weekEnd }); }
    catch { return false; }
  });
  const completedWeek    = weekTasks.filter(t => t.completed).length;
  const todayTasks       = state.tasks.filter(t => t.deadline === todayStr);
  const urgentTasks      = allTasks.filter(t => {
    if (t.completed) return false;
    try {
      const diff = Math.ceil((parseISO(t.deadline) - today) / 86400000);
      return diff <= 3;
    } catch { return false; }
  });
  const unprocessedHonsha = allTasks.filter(t => t.category === 'honsha' && !t.completed);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: C.background, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ backgroundColor: C.primaryDark, padding: '10px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
          {format(today, 'M月d日（E）', { locale: ja })}
        </span>
        <ProgressBar total={weekTasks.length} completed={completedWeek} />
      </div>

      <div style={{ flex: 1, padding: '0 0 16px' }}>
        {/* Alert */}
        {unprocessedHonsha.length > 0 && (
          <div style={{
            backgroundColor: C.lightBlue,
            margin: '12px 16px 0',
            borderRadius: 8,
            padding: 12,
            borderLeft: `4px solid ${C.danger}`,
          }}>
            <span style={{ color: C.danger, fontWeight: '700', fontSize: 14 }}>
              🔴 本社指示（未処理 {unprocessedHonsha.length}件）
            </span>
          </div>
        )}

        {/* Week grid */}
        <div style={{ backgroundColor: C.white, margin: '16px 16px 0', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: 15, fontWeight: '700', color: C.primaryDark, display: 'block', marginBottom: 12 }}>今週</span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {weekDays.map((d, i) => {
              const ds = format(d, 'yyyy-MM-dd');
              const isToday  = ds === todayStr;
              const isHonsha = HONSHA_DAYS.includes(d.getDay());
              const dayTasks = state.tasks.filter(t => t.deadline === ds);
              return (
                <button
                  key={i}
                  onClick={() => navigate('Calendar')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderRadius: 8,
                    gap: 2,
                    backgroundColor: isToday ? C.lightBlue : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 11, color: isToday ? C.primary : C.textLight, fontWeight: isToday ? '700' : '400' }}>
                    {DAYS[d.getDay()]}{isHonsha ? '★' : ''}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: '600', color: isToday ? C.primary : C.text }}>{d.getDate()}</span>
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', minHeight: 8 }}>
                    {dayTasks.slice(0, 3).map((t, j) => (
                      <div key={j} style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: t.isCheckpoint ? '#ccc' : (getCategories().find(c => c.id === t.category)?.color || '#ccc'),
                        opacity: t.completed ? 0.3 : 1,
                      }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's tasks */}
        <div style={{ backgroundColor: C.white, margin: '16px 16px 0', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: 15, fontWeight: '700', color: C.primaryDark, display: 'block', marginBottom: 12 }}>
            今日のタスク ({todayTasks.length}件)
          </span>
          {todayTasks.length === 0
            ? <span style={{ color: C.textLight, fontSize: 14, display: 'block', textAlign: 'center', paddingTop: 16, paddingBottom: 16 }}>今日のタスクはありません</span>
            : todayTasks.map(t => <TaskCard key={t.id} task={t} />)
          }
        </div>

        {/* Urgent tasks */}
        {urgentTasks.length > 0 && (
          <div style={{ backgroundColor: C.white, margin: '16px 16px 0', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: 15, fontWeight: '700', color: C.primaryDark, display: 'block', marginBottom: 12 }}>⚠️ 期日が近いタスク</span>
            {urgentTasks.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('AddTask')}
        style={{
          position: 'sticky',
          bottom: 16,
          marginLeft: 32,
          marginRight: 32,
          backgroundColor: C.primary,
          color: '#fff',
          fontSize: 16,
          fontWeight: '700',
          borderRadius: 16,
          paddingTop: 16,
          paddingBottom: 16,
          textAlign: 'center',
          boxShadow: `0 4px 12px ${C.primary}66`,
          cursor: 'pointer',
        }}
      >
        ＋ タスクを追加
      </button>
    </div>
  );
}
