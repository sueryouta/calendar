import { useMemo, useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, addDays, isSameMonth } from 'date-fns';
import { getHolidaysForRange } from '../utils/japaneseHolidays';
import useTheme from '../hooks/useTheme';

const thisYear = new Date().getFullYear();
const HOLIDAYS = getHolidaysForRange(thisYear - 1, thisYear + 2);
const TODAY = format(new Date(), 'yyyy-MM-dd');

const DAY_HEADERS = ['月', '火', '水', '木', '金', '土', '日'];

export default function MiniCalendar({ value, onChange, minDate, maxDate }) {
  const C = useTheme();
  const initial = value ? new Date(value) : new Date();
  const [viewMonth, setViewMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    // Start from Monday of the week containing monthStart
    const startDow = monthStart.getDay(); // 0=Sun
    const startOffset = startDow === 0 ? -6 : 1 - startDow;
    let cursor = addDays(monthStart, startOffset);
    const result = [];
    while (cursor <= monthEnd || result.length === 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cursor));
        cursor = addDays(cursor, 1);
      }
      result.push(week);
      if (cursor > monthEnd && result.length >= 4) break;
    }
    return result;
  }, [viewMonth]);

  function isDisabled(ds) {
    if (minDate && ds < minDate) return true;
    if (maxDate && ds > maxDate) return true;
    return false;
  }

  return (
    <div style={{
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 6,
      backgroundColor: C.white,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, padding: '10px 16px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#e74c3c' }} />
          <span style={{ fontSize: 11, color: C.textLight }}>日曜・祝日</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#3498db' }} />
          <span style={{ fontSize: 11, color: C.textLight }}>土曜</span>
        </div>
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 8px' }}>
        <button onClick={() => setViewMonth(m => subMonths(m, 1))} style={{ fontSize: 20, color: C.primary, padding: '4px 8px' }}>‹</button>
        <span style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark }}>
          {viewMonth.getFullYear()}年{viewMonth.getMonth() + 1}月
        </span>
        <button onClick={() => setViewMonth(m => addMonths(m, 1))} style={{ fontSize: 20, color: C.primary, padding: '4px 8px' }}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: `1px solid ${C.border}` }}>
        {DAY_HEADERS.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: '600', color: i === 5 ? '#3498db' : i === 6 ? '#e74c3c' : C.textLight, padding: '6px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: `1px solid ${C.border}` }}>
          {week.map((d, di) => {
            const ds = format(d, 'yyyy-MM-dd');
            const inMonth = isSameMonth(d, viewMonth);
            const disabled = isDisabled(ds) || !inMonth;
            const selected = ds === value;
            const isToday  = ds === TODAY;
            const holidayName = HOLIDAYS[ds];
            // di: 0=Mon..5=Sat,6=Sun
            const isSun = di === 6;
            const isSat = di === 5;
            const isSunOrHol = isSun || !!holidayName;

            let textColor = inMonth ? C.text : C.border;
            if (disabled)      textColor = C.textLight;
            if (selected)      textColor = '#fff';
            else if (isSunOrHol && inMonth) textColor = '#e74c3c';
            else if (isSat && inMonth)      textColor = '#3498db';

            return (
              <button
                key={ds}
                disabled={disabled}
                onClick={() => !disabled && onChange(ds)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '4px 0',
                  cursor: disabled ? 'default' : 'pointer',
                  opacity: !inMonth ? 0.3 : 1,
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? C.primary : 'transparent',
                  border: isToday && !selected ? `2px solid ${C.primary}` : 'none',
                }}>
                  <span style={{ fontSize: 13, fontWeight: '500', color: textColor }}>{d.getDate()}</span>
                </div>
                {holidayName && inMonth
                  ? <span style={{ fontSize: 7, color: '#e74c3c', lineHeight: '9px', textAlign: 'center', width: 36, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{holidayName}</span>
                  : <div style={{ height: 9 }} />
                }
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
