import { differenceInDays, parseISO, format } from 'date-fns';
import { toggleTask, deleteTask } from '../store/taskStore';
import { getCategories } from '../store/categoryStore';
import useTheme from '../hooks/useTheme';

export default function TaskCard({ task, onPress }) {
  const C = useTheme();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = parseISO(task.deadline);
  const cats = getCategories();
  const catMap = Object.fromEntries(cats.map(c => [c.id, c]));
  const categoryColor = catMap[task.category]?.color || '#95a5a6';
  const categoryName  = catMap[task.category]?.name  || 'その他';
  const daysLeft = differenceInDays(deadline, today);

  const badgeColor =
    daysLeft < 0   ? C.danger   :
    daysLeft === 0 ? '#e67e22'  :
    daysLeft <= 3  ? '#f0b429'  :
    C.secondary;

  const badgeText =
    daysLeft < 0   ? `${Math.abs(daysLeft)}日超過` :
    daysLeft === 0 ? '今日が期日'                   :
    `あと${daysLeft}日`;

  const dateLabel = task.startDate
    ? `${format(parseISO(task.startDate), 'M/d')} 〜 ${format(deadline, 'M/d')}`
    : format(deadline, 'M/d');

  function handleClick() {
    if (onPress) onPress();
    else toggleTask(task.id);
  }

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`「${task.name}」を削除しますか？`)) {
      deleteTask(task.id);
    }
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: C.white,
        borderRadius: 10,
        marginTop: 4,
        marginBottom: 4,
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: task.completed ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      <div style={{ width: 5, backgroundColor: task.isCheckpoint ? '#bbb' : categoryColor, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            fontSize: 15,
            fontWeight: '600',
            color: task.completed ? C.textLight : C.text,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}>
            {task.completed ? '✓ ' : ''}{task.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              borderRadius: 4,
              paddingLeft: 8,
              paddingRight: 8,
              paddingTop: 3,
              paddingBottom: 3,
              backgroundColor: task.completed ? C.border : badgeColor,
              color: '#fff',
              fontSize: 12,
              fontWeight: '700',
              whiteSpace: 'nowrap',
            }}>
              {task.completed ? '完了' : badgeText}
            </span>
            {!task.isCheckpoint && (
              <button
                onClick={handleDelete}
                title="削除"
                style={{
                  fontSize: 14,
                  color: C.textLight,
                  lineHeight: 1,
                  padding: '2px 4px',
                  borderRadius: 4,
                  opacity: 0.6,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: C.textLight }}>{categoryName}</span>
          <span style={{ fontSize: 12, color: C.textLight }}>·</span>
          <span style={{ fontSize: 12, color: task.startDate ? C.primary : C.textLight, fontWeight: task.startDate ? '600' : '400' }}>{dateLabel}</span>
          {task.isCheckpoint && (
            <span style={{ fontSize: 12, color: C.primary }}>◆ チェックポイント</span>
          )}
        </div>
      </div>
    </div>
  );
}
