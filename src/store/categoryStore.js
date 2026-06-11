import { supabase } from '../lib/supabase';

const DEFAULT_CATEGORIES = [
  { id: 'honsha',  name: '本社指示', color: '#e74c3c' },
  { id: 'store',   name: '店舗自主', color: '#3498db' },
  { id: 'routine', name: '定期業務', color: '#9b59b6' },
  { id: 'other',   name: 'その他',   color: '#95a5a6' },
];

let listeners = [];
let categories = null;

export function subscribeCategories(listener) {
  listeners.push(listener);
  return () => { listeners = listeners.filter(l => l !== listener); };
}

function notify() {
  listeners.forEach(l => l([...categories]));
}

export async function loadCategories() {
  categories = [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { categories = [...DEFAULT_CATEGORIES]; notify(); return; }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) { categories = [...DEFAULT_CATEGORIES]; notify(); return; }

  if (data.length === 0) {
    const rows = DEFAULT_CATEGORIES.map(c => ({ ...c, user_id: user.id }));
    const { data: inserted, error: insertError } = await supabase
      .from('categories').insert(rows).select();
    categories = (!insertError && inserted) ? inserted : [...DEFAULT_CATEGORIES];
  } else {
    categories = data;
  }
  notify();
}

export function getCategories() {
  return categories ?? [...DEFAULT_CATEGORIES];
}

export async function addCategory(cat) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const newCat = { id: `cat_${Date.now()}`, ...cat, user_id: user.id };
  const { data, error } = await supabase.from('categories').insert([newCat]).select().single();
  if (error) { console.error('addCategory error:', error); return; }
  categories = [...categories, data];
  notify();
  return data;
}

export async function removeCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) { console.error('removeCategory error:', error); return; }
  categories = categories.filter(c => c.id !== id);
  notify();
}
