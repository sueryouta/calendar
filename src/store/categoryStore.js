const STORAGE_KEY = '@megane_categories';

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
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    categories = json ? JSON.parse(json) : [...DEFAULT_CATEGORIES];
  } catch {
    categories = [...DEFAULT_CATEGORIES];
  }
  notify();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export function getCategories() {
  return categories ?? [...DEFAULT_CATEGORIES];
}

export async function addCategory(cat) {
  const newCat = { ...cat, id: `cat_${Date.now()}` };
  categories = [...categories, newCat];
  save();
  notify();
  return newCat;
}

export async function removeCategory(id) {
  categories = categories.filter(c => c.id !== id);
  save();
  notify();
}
