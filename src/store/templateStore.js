import { supabase } from '../lib/supabase';
import { TEMPLATES } from '../constants';

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
  templates = [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { templates = [...TEMPLATES]; notify(); return; }

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) { templates = [...TEMPLATES]; notify(); return; }

  if (data.length === 0) {
    const rows = TEMPLATES.map(t => ({ ...t, user_id: user.id }));
    const { data: inserted, error: insertError } = await supabase
      .from('templates').insert(rows).select();
    templates = (!insertError && inserted) ? inserted : [...TEMPLATES];
  } else {
    templates = data;
  }
  notify();
}

export function getTemplates() {
  return templates ?? [...TEMPLATES];
}

export async function addTemplate(tmpl) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const newTmpl = { id: `t_${Date.now()}`, ...tmpl, user_id: user.id };
  const { data, error } = await supabase.from('templates').insert([newTmpl]).select().single();
  if (error) { console.error('addTemplate error:', error); return; }
  templates = [...templates, data];
  notify();
  return data;
}

export async function removeTemplate(id) {
  const { error } = await supabase.from('templates').delete().eq('id', id);
  if (error) { console.error('removeTemplate error:', error); return; }
  templates = templates.filter(t => t.id !== id);
  notify();
}
