import { COLORS, DARK_COLORS } from '../constants';

const STORAGE_KEY = '@megane_dark_mode';

let isDark = false;
let listeners = [];

export function subscribeTheme(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function notify() {
  listeners.forEach(l => l(isDark));
}

export function getIsDark()       { return isDark; }
export function getThemeColors()  { return isDark ? DARK_COLORS : COLORS; }

export async function loadTheme() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val !== null) isDark = JSON.parse(val);
  } catch (e) {}
  notify();
}

export async function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(isDark));
  notify();
}
