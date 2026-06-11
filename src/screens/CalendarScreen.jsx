import { useState, useEffect, useCallback, useRef } from 'react';
import {
  format, parseISO, startOfMonth, endOfMonth,
  addDays, addMonths, subMonths,
  isSameDay, isBefore, isAfter,
} from 'date-fns';
import { getCategories } from '../store/categoryStore';
import { getTasks, subscribe } from '../store/taskStore';
import TaskCard from '../components/TaskCard';
import useTheme from '../hooks/useTheme';

const DAY_HEADERS = ['月', '火', '水', '木', '金', '土', '日'];
const BAR_H = 17;
const BAR_GAP = 2;
const MAX_LANES = 3;

function assignLanes(tasks) {
  const lanes = [];
  const taskLane = {};
  for (const t of tasks) {
    const ts = (t.startDate && t.startDate.length > 0) ? parseISO(t.startDate) : parseISO(t.deadline);
    const te = parseISO(t.deadline);
    let placed = false;
    for (let li = 0; li < lanes.length; li++) {
      const conflict = lanes[li].some(other => {
        const os = (other.startDate && other.startDate.length > 0) ? parseISO(other.startDate) : parseISO(other.deadline);
        const oe = parseISO(other.deadline);
        return !isAfter(ts, oe) && !isBefore(te, os);
      });
      if (!conflict) { lanes[li].push(t); taskLane[t.id] = li; placed = true; break; }
    }
    if (!placed) { lanes.push([t]); taskLane[t.id] = lanes.length - 1; }
  }
  return taskLane;
}

function WeekRow({ weekStart, tasks, catColorMap, onDayPress, selectedDate, C }) {
  const rowRef = useRef(null);
  const [rowWidth, setRowWidth] = useState(0);

  useEffect(() => {
    if (!rowRef.current) return;
    const ro = new ResizeObserver(entries => {
      setRowWidth(entries[0].contentRect.width);
    });
    ro.observe(rowRef.current);
    setRowWidth(rowRef.current.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const cellW = rowWidth / 7;
  const days  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = days[6];

  const overlapping = tasks
    .filter(t => !t.isCheckpoint && t.deadline)
    .filter(t => {
      const ts = (t.startDate && t.startDate.length > 0) ? parseISO(t.startDate) : parseISO(t.deadline);
      const te = parseISO(t.deadline);
      return !isAfter(ts, weekEnd) && !isBefore(te, weekStart);
    })
    .sort((a, b) => {
      const aLen = (a.startDate && a.startDate.length > 0) ? (parseISO(a.deadline) - parseISO(a.startDate)) : 0;
      const bLen = (b.startDate && b.startDate.length > 0) ? (parseISO(b.deadline) - parseISO(b.startDate)) : 0;
      return bLen - aLen;
    });

  const taskLane = assignLanes(overlapping);
  const usedLanes = Math.min(
    overlapping.length > 0 ? Math.max(...overlapping.map(t => (taskLane[t.id] || 0) + 1)) : 0,
    MAX_LANES,
  );
  const barsH = usedLanes * (BAR_H + BAR_GAP);

  const bars = cellW > 0 ? overlapping.map(t => {
    const lane = taskLane[t.id] ?? 0;
    if (lane >= MAX_LANES) return null;
    const ts = (t.startDate && t.startDate.length > 0) ? parseISO(t.startDate) : parseISO(t.deadline);
    const te = parseISO(t.deadline);
    const clampStart = isBefore(ts, weekStart) ? weekStart : ts;
    const clampEnd   = isAfter(te, weekEnd)    ? weekEnd   : te;
    const startIdx = days.findIndex(d => isSameDay(d, clampStart));
    const endIdx   = days.findIndex(d => isSameDay(d, clampEnd));
    if (startIdx < 0 || endIdx < 0) return null;
    const isBarStart = !isBefore(ts, weekStart);
    const isBarEnd   = !isAfter(te, weekEnd);
    const color = t.completed ? C.border : (catColorMap[t.category] || '#95a5a6');
    const left  = startIdx * cellW + (isBarStart ? 2 : 0);
    const right = (6 - endIdx) * cellW + (isBarEnd ? 2 : 0);
    return (
      <div key={t.id} style={{
        position: 'absolute',
        top: lane * (BAR_H + BAR_GAP),
        left,
        right,
        height: BAR_H,
        backgroundColor: color,
        borderTopLeftRadius:     isBarStart ? 4 : 0,
        borderBottomLeftRadius:  isBarStart ? 4 : 0,
        borderTopRightRadius:    isBarEnd ? 4 : 0,
        borderBottomRightRadius: isBarEnd ? 4 : 0,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 5,
        paddingRight: 3,
        overflow: 'hidden',
      }}>
        {isBarStart && (
          <span style={{ color: '#fff', fontSize: 10, fontWeight: '600', lineHeight: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t.name}
          </span>
        )}
      </div>
    );
  }) : [];

  return (
    <div style={{ borderTop: `1px solid ${C.border}`, paddingBottom: 4 }}>
      <div ref={rowRef} style={{ display: 'flex' }}>
        {days.map(d => {
          const ds  = format(d, 'yyyy-MM-dd');
          const dow = d.getDay();
          const isSelected  = ds === selectedDate;
          const isTodayDate = isSameDay(d, new Date());
          const textColor = isSelected ? '#fff'
            : dow === 0 ? '#e74c3c'
            : dow === 6 ? '#3498db'
            : C.text;
          return (
            <button
              key={ds}
              onClick={() => onDayPress(ds)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 4, paddingBottom: 4 }}
            >
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSelected ? C.primary : 'transparent',
                border: isTodayDate && !isSelected ? `1.5px solid ${C.primary}` : 'none',
              }}>
                <span style={{ fontSize: 13, fontWeight: '500', color: textColor }}>{d.getDate()}</span>
              </div>
            </button>
          );
        })}
      </div>
      {barsH > 0 && (
        <div style={{ height: barsH + 4, position: 'relative' }}>
          {bars}
        </div>
      )}
    </div>
  );
}

export default function CalendarScreen({ navigate }) {
  const C = useTheme();
  const [state, setState]       = useState({ tasks: getTasks() });
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const unsub = subscribe(setState);
    return unsub;
  }, []);

  const catColorMap = Object.fromEntries(getCategories().map(c => [c.id, c.color]));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const weeks = [];
  let ws = addDays(monthStart, -((monthStart.getDay() + 6) % 7));
  while (ws <= monthEnd) { weeks.push(new Date(ws)); ws = addDays(ws, 7); }

  const handleDayPress = useCallback((ds) => setSelectedDate(ds), []);

  const selectedD     = parseISO(selectedDate);
  const selectedTasks = state.tasks.filter(t => {
    if (!t.deadline) return false;
    const ts = (t.startDate && t.startDate.length > 0) ? parseISO(t.startDate) : parseISO(t.deadline);
    const te = parseISO(t.deadline);
    return !isAfter(ts, selectedD) && !isBefore(te, selectedD);
  });
  const mainTasks  = selectedTasks.filter(t => !t.isCheckpoint);
  const checkpoints = selectedTasks.filter(t => t.isCheckpoint);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', backgroundColor: C.background, overflow: 'hidden' }}>
      {/* Month header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} style={{ fontSize: 24, color: C.primary, lineHeight: '28px', padding: 8 }}>‹</button>
        <span style={{ fontSize: 17, fontWeight: '700', color: C.primaryDark }}>
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </span>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} style={{ fontSize: 24, color: C.primary, lineHeight: '28px', padding: 8 }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'flex', backgroundColor: C.white, paddingBottom: 6, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {DAY_HEADERS.map((d, i) => (
          <span key={d} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: i === 5 ? '#3498db' : i === 6 ? '#e74c3c' : C.textLight }}>{d}</span>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* Calendar grid */}
        <div style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.border}` }}>
          {weeks.map(w => (
            <WeekRow
              key={format(w, 'yyyy-MM-dd')}
              weekStart={w}
              tasks={state.tasks}
              catColorMap={catColorMap}
              onDayPress={handleDayPress}
              selectedDate={selectedDate}
              C={C}
            />
          ))}
        </div>

        {/* Selected day tasks */}
        <div style={{ padding: '0 16px 16px' }}>
          <span style={{ fontSize: 15, fontWeight: '700', color: C.primaryDark, display: 'block', marginTop: 16, marginBottom: 8 }}>
            {format(selectedD, 'M月d日')} のタスク
          </span>
          {mainTasks.length === 0 && checkpoints.length === 0 && (
            <span style={{ color: C.textLight, fontSize: 14, display: 'block', textAlign: 'center', paddingTop: 24, paddingBottom: 24 }}>
              この日のタスクはありません
            </span>
          )}
          {mainTasks.map(t => <TaskCard key={t.id} task={t} />)}
          {checkpoints.length > 0 && (
            <>
              <span style={{ fontSize: 13, fontWeight: '600', color: C.primary, display: 'block', marginTop: 12, marginBottom: 4 }}>チェックポイント</span>
              {checkpoints.map(t => <TaskCard key={t.id} task={t} />)}
            </>
          )}
        </div>
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
