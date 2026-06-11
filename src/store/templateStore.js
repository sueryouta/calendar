import { TEMPLATES } from '../constants';

const STORAGE_KEY = '@megane_templates';

let listeners = [];
let templates = null;

export function subscribeTemplates(listener) {
  listeners.push(listener);
  return () => { listeners = listeners.filter(l => l !== listener); };
}

function notify() {
  listeners.forEach(l => l([...templates]));
}

export async function loadTemplates() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    templates = json ? JSON.parse(json) : [...TEMPLATES];
  } catch {
    templates = [...TEMPLATES];
  }
  notify();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getTemplates() {
  return templates ?? [...TEMPLATES];
}

export async function addTemplate(tmpl) {
  const newTmpl = { ...tmpl, id: `t_${Date.now()}` };
  templates = [...templates, newTmpl];
  save();
  notify();
  return newTmpl;
}

export async function removeTemplate(id) {
  templates = templates.filter(t => t.id !== id);
  save();
  notify();
}
