import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import MiniCalendar from '../components/MiniCalendar';
import { DIFFICULTY_LABELS } from '../constants';
import { addTask } from '../store/taskStore';
import { getTemplates, loadTemplates, subscribeTemplates, addTemplate, removeTemplate } from '../store/templateStore';
import { getCategories, loadCategories, subscribeCategories, addCategory, removeCategory } from '../store/categoryStore';
import useTheme from '../hooks/useTheme';

const QUICK_DATES = [
  { label: '今日',    days: 0 },
  { label: '明日',    days: 1 },
  { label: '3日後',  days: 3 },
  { label: '1週間後', days: 7 },
];

const PRESET_COLORS = [
  '#e74c3c', '#e67e22', '#f0b429', '#27ae60',
  '#3498db', '#2d6a9f', '#9b59b6', '#95a5a6',
];

export default function AddTaskScreen({ onClose }) {
  const C = useTheme();
  const [name, setName]           = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline]   = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calOpen, setCalOpen]     = useState(null);
  const [category, setCategory]   = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [notes, setNotes]         = useState('');
  const [error, setError]         = useState('');

  const [templates, setTemplates] = useState(getTemplates());
  const [categories, setCategories] = useState(getCategories());

  const [showTemplates, setShowTemplates]   = useState(false);
  const [addTmplOpen, setAddTmplOpen]       = useState(false);
  const [newTmplName, setNewTmplName]       = useState('');
  const [newTmplDifficulty, setNewTmplDifficulty] = useState('small');
  const [newTmplColor, setNewTmplColor]     = useState(PRESET_COLORS[4]);

  const [showCatEditor, setShowCatEditor]   = useState(false);
  const [addCatOpen, setAddCatOpen]         = useState(false);
  const [newCatName, setNewCatName]         = useState('');
  const [newCatColor, setNewCatColor]       = useState(PRESET_COLORS[0]);

  useEffect(() => {
    loadTemplates(); loadCategories();
    const u1 = subscribeTemplates(setTemplates);
    const u2 = subscribeCategories(cats => {
      setCategories(cats);
      if (category && !cats.find(c => c.id === category)) setCategory('');
    });
    return () => { u1(); u2(); };
  }, []);

  useEffect(() => {
    if (!category && categories.length > 0) setCategory(categories[0].id);
  }, [categories]);

  async function handleSave() {
    if (!name.trim()) { setError('タスク名を入力してください'); return; }
    if (startDate && startDate >= deadline) { setError('開始日は終了日より前にしてください'); return; }
    setError('');
    await addTask({ name: name.trim(), startDate: startDate || null, deadline, category, difficulty, notes });
    onClose();
  }

  function applyTemplate(tmpl) {
    setName(tmpl.name); setCategory(tmpl.category); setDifficulty(tmpl.difficulty);
    setShowTemplates(false);
  }

  async function handleAddTemplate() {
    if (!newTmplName.trim()) { setError('テンプレート名を入力してください'); return; }
    await addTemplate({ name: newTmplName.trim(), category, difficulty: newTmplDifficulty, color: newTmplColor });
    setNewTmplName(''); setNewTmplDifficulty('small'); setNewTmplColor(PRESET_COLORS[4]); setAddTmplOpen(false);
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) { setError('カテゴリ名を入力してください'); return; }
    const newCat = await addCategory({ name: newCatName.trim(), color: newCatColor });
    setCategory(newCat.id); setNewCatName(''); setNewCatColor(PRESET_COLORS[0]); setAddCatOpen(false);
  }

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const inp = {
    backgroundColor: C.white, borderRadius: 10, padding: 14,
    fontSize: 16, color: C.text, border: `1px solid ${C.border}`,
    width: '100%', outline: 'none',
  };
  const optChipBase = {
    border: `1.5px solid ${C.primary}`, borderRadius: 20,
    paddingLeft: 14, paddingRight: 14, paddingTop: 7, paddingBottom: 7,
    fontSize: 13, fontWeight: '600', cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.background }}>
      {/* Header */}
      <div style={{ backgroundColor: C.primaryDark, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} style={{ color: '#fff', fontSize: 20, padding: '0 8px 0 0' }}>‹</button>
        <span style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>タスクを追加</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {error && (
          <div style={{ backgroundColor: '#fde8e8', border: '1px solid #e74c3c', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <span style={{ color: '#c0392b', fontSize: 14 }}>{error}</span>
          </div>
        )}

        {/* Templates toggle */}
        <button
          onClick={() => setShowTemplates(v => !v)}
          style={{ width: '100%', backgroundColor: C.white, borderRadius: 8, padding: 12, marginBottom: 8, border: `1px solid ${C.border}`, textAlign: 'left', color: C.primary, fontWeight: '600', fontSize: 14 }}
        >
          📋 テンプレートから選ぶ {showTemplates ? '▲' : '▼'}
        </button>

        {showTemplates && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {templates.map(t => {
                const col = t.color || catMap[t.category]?.color || '#999';
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${col}`, borderRadius: 20, overflow: 'hidden' }}>
                    <button onClick={() => applyTemplate(t)} style={{ paddingLeft: 12, paddingRight: 12, paddingTop: 7, paddingBottom: 7, color: col, fontWeight: '600', fontSize: 13 }}>{t.name}</button>
                    <button onClick={() => removeTemplate(t.id)} style={{ paddingLeft: 9, paddingRight: 9, paddingTop: 7, paddingBottom: 7, color: col, fontSize: 11, fontWeight: '700', borderLeft: '1px solid rgba(0,0,0,0.1)' }}>✕</button>
                  </div>
                );
              })}
              <button onClick={() => setAddTmplOpen(v => !v)} style={{ border: `1.5px dashed ${C.primary}`, borderRadius: 20, paddingLeft: 14, paddingRight: 14, paddingTop: 7, paddingBottom: 7, color: C.primary, fontSize: 16, fontWeight: '700' }}>
                {addTmplOpen ? '✕' : '＋'}
              </button>
            </div>
            {addTmplOpen && (
              <div style={{ marginTop: 10, backgroundColor: C.white, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, fontWeight: '700', color: C.primaryDark, display: 'block', marginBottom: 10 }}>新しいテンプレートを追加</span>
                <input style={inp} value={newTmplName} onChange={e => setNewTmplName(e.target.value)} placeholder="テンプレート名" autoFocus />
                <span style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark, display: 'block', marginTop: 10, marginBottom: 6 }}>カラー</span>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewTmplColor(c)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, border: newTmplColor === c ? '3px solid #fff' : 'none', boxShadow: newTmplColor === c ? '0 0 0 2px ' + c : 'none' }} />
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark, display: 'block', marginTop: 10, marginBottom: 6 }}>難易度</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                    <button key={key} onClick={() => setNewTmplDifficulty(key)} style={{ ...optChipBase, backgroundColor: newTmplDifficulty === key ? C.primary : 'transparent', color: newTmplDifficulty === key ? '#fff' : C.primary }}>{label}</button>
                  ))}
                </div>
                <button onClick={handleAddTemplate} style={{ marginTop: 12, flex: 2, padding: 14, borderRadius: 12, backgroundColor: C.primary, color: '#fff', fontSize: 15, fontWeight: '700', width: '100%' }}>追加する</button>
              </div>
            )}
          </div>
        )}

        {/* Task name */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark, display: 'block', marginBottom: 8 }}>タスク名 <span style={{ color: C.danger }}>*</span></span>
          <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="例：棚卸し、月次レポート提出..." autoFocus={!showTemplates} />
        </div>

        {/* Date range */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark, display: 'block', marginBottom: 8 }}>期間 <span style={{ color: C.danger }}>*</span></span>

          <span style={{ fontSize: 12, fontWeight: '600', color: C.textLight, display: 'block', marginBottom: 6 }}>開始日（任意）</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <button onClick={() => { setStartDate(''); setCalOpen(null); }} style={{ ...optChipBase, border: `1.5px solid ${C.border}`, backgroundColor: startDate === '' ? '#888' : 'transparent', borderColor: startDate === '' ? '#888' : C.border, color: startDate === '' ? '#fff' : C.textLight }}>未設定</button>
            {QUICK_DATES.map(qd => {
              const ds = format(addDays(new Date(), qd.days), 'yyyy-MM-dd');
              return (
                <button key={'s' + qd.label} onClick={() => { setStartDate(ds); setCalOpen(null); }} style={{ ...optChipBase, border: `1.5px solid ${C.border}`, backgroundColor: startDate === ds ? C.secondary : 'transparent', borderColor: startDate === ds ? C.secondary : C.border, color: startDate === ds ? '#fff' : C.textLight }}>{qd.label}</button>
              );
            })}
          </div>
          <button onClick={() => setCalOpen(v => v === 'start' ? null : 'start')} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: C.white, borderRadius: 10, border: `${calOpen === 'start' ? 2 : 1}px solid ${calOpen === 'start' ? C.primary : C.border}`, padding: 14, width: '100%', cursor: 'pointer' }}>
            <span>📅</span>
            <span style={{ flex: 1, fontSize: 15, color: startDate ? C.text : C.textLight, fontWeight: startDate ? '500' : '400', textAlign: 'left' }}>{startDate || 'カレンダーで選ぶ'}</span>
            <span style={{ fontSize: 12, color: C.textLight }}>{calOpen === 'start' ? '▲' : '▼'}</span>
          </button>
          {calOpen === 'start' && <MiniCalendar value={startDate} onChange={ds => { setStartDate(ds); setCalOpen(null); }} />}

          <span style={{ fontSize: 12, fontWeight: '600', color: C.textLight, display: 'block', marginTop: 14, marginBottom: 6 }}>終了日（期日） <span style={{ color: C.danger }}>*</span></span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {QUICK_DATES.map(qd => {
              const ds = format(addDays(new Date(), qd.days), 'yyyy-MM-dd');
              return (
                <button key={'e' + qd.label} onClick={() => { setDeadline(ds); setCalOpen(null); }} style={{ ...optChipBase, backgroundColor: deadline === ds ? C.primary : 'transparent', color: deadline === ds ? '#fff' : C.primary }}>{qd.label}</button>
              );
            })}
          </div>
          <button onClick={() => setCalOpen(v => v === 'end' ? null : 'end')} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: C.white, borderRadius: 10, border: `${calOpen === 'end' ? 2 : 1}px solid ${calOpen === 'end' ? C.primary : C.border}`, padding: 14, width: '100%', cursor: 'pointer' }}>
            <span>📅</span>
            <span style={{ flex: 1, fontSize: 15, color: C.text, fontWeight: '500', textAlign: 'left' }}>{deadline}</span>
            <span style={{ fontSize: 12, color: C.textLight }}>{calOpen === 'end' ? '▲' : '▼'}</span>
          </button>
          {calOpen === 'end' && <MiniCalendar value={deadline} minDate={startDate || undefined} onChange={ds => { setDeadline(ds); setCalOpen(null); }} />}

          {(startDate || deadline) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: C.lightBlue, borderRadius: 10, padding: 12, marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, color: C.textLight, display: 'block', marginBottom: 2 }}>開始日</span>
                <span style={{ fontSize: 15, fontWeight: !startDate ? '400' : '700', color: !startDate ? C.textLight : C.primaryDark }}>{startDate || '未設定'}</span>
              </div>
              <span style={{ fontSize: 18, color: C.primary, fontWeight: '700' }}>→</span>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <span style={{ fontSize: 10, color: C.textLight, display: 'block', marginBottom: 2 }}>終了日</span>
                <span style={{ fontSize: 15, fontWeight: '700', color: C.primaryDark }}>{deadline}</span>
              </div>
            </div>
          )}
        </div>

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark }}>カテゴリ</span>
            <button onClick={() => setShowCatEditor(v => !v)} style={{ fontSize: 13, color: C.primary, fontWeight: '600' }}>{showCatEditor ? '▲ 閉じる' : '✎ 編集'}</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)} style={{ border: `1.5px solid ${cat.color}`, borderRadius: 20, paddingLeft: 14, paddingRight: 14, paddingTop: 7, paddingBottom: 7, backgroundColor: category === cat.id ? cat.color : 'transparent', color: category === cat.id ? '#fff' : cat.color, fontSize: 13, fontWeight: '600' }}>{cat.name}</button>
            ))}
          </div>
          {showCatEditor && (
            <div style={{ marginTop: 10, backgroundColor: C.white, borderRadius: 10, padding: 14, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 13, fontWeight: '700', color: C.primaryDark, display: 'block', marginBottom: 10 }}>カテゴリを編集</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${cat.color}`, borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color, marginLeft: 10 }} />
                    <span style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 7, paddingBottom: 7, color: cat.color, fontWeight: '600', fontSize: 13 }}>{cat.name}</span>
                    {categories.length > 1 && (
                      <button onClick={() => removeCategory(cat.id)} style={{ paddingLeft: 9, paddingRight: 9, paddingTop: 7, paddingBottom: 7, color: cat.color, fontSize: 11, fontWeight: '700', borderLeft: '1px solid rgba(0,0,0,0.1)' }}>✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setAddCatOpen(v => !v)} style={{ border: `1.5px dashed ${C.primary}`, borderRadius: 20, paddingLeft: 14, paddingRight: 14, paddingTop: 7, paddingBottom: 7, color: C.primary, fontSize: 16, fontWeight: '700' }}>
                  {addCatOpen ? '✕' : '＋'}
                </button>
              </div>
              {addCatOpen && (
                <div style={{ marginTop: 12 }}>
                  <input style={inp} value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="カテゴリ名" autoFocus />
                  <span style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark, display: 'block', marginTop: 10, marginBottom: 6 }}>カラー</span>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => setNewCatColor(c)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, border: newCatColor === c ? '3px solid #fff' : 'none', boxShadow: newCatColor === c ? '0 0 0 2px ' + c : 'none' }} />
                    ))}
                  </div>
                  <button onClick={handleAddCategory} style={{ marginTop: 12, padding: 14, borderRadius: 12, backgroundColor: C.primary, color: '#fff', fontSize: 15, fontWeight: '700', width: '100%' }}>追加する</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark, display: 'block', marginBottom: 8 }}>難易度（逆算の細かさ）</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => setDifficulty(key)} style={{ ...optChipBase, backgroundColor: difficulty === key ? C.primary : 'transparent', color: difficulty === key ? '#fff' : C.primary }}>{label}</button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: C.textLight, display: 'block', marginTop: 6 }}>
            {difficulty === 'small'  && '→ 前日に最終確認を自動生成'}
            {difficulty === 'medium' && '→ 3日前に準備・前日に最終確認を自動生成'}
            {difficulty === 'large'  && '→ 7日前・3日前・前日の3段階を自動生成'}
          </span>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 14, fontWeight: '700', color: C.primaryDark, display: 'block', marginBottom: 8 }}>メモ（任意）</span>
          <textarea
            style={{ ...inp, height: 80, verticalAlign: 'top' }}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="本社指示の内容など..."
            rows={3}
          />
        </div>

        <div style={{ height: 40 }} />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', gap: 12, padding: '16px 16px 24px', backgroundColor: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onClose} style={{ flex: 1, padding: 16, borderRadius: 12, border: `1.5px solid ${C.border}`, color: C.textLight, fontSize: 16, fontWeight: '600' }}>キャンセル</button>
        <button onClick={handleSave} style={{ flex: 2, padding: 16, borderRadius: 12, backgroundColor: C.primary, color: '#fff', fontSize: 16, fontWeight: '700' }}>登録する</button>
      </div>
    </div>
  );
}
