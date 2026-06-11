import { supabase } from '../lib/supabase';
import { REVERSE_RULES } from '../constants';
import { addDays, subDays, format } from 'date-fns';

const SETTINGS_KEY = '@megane_settings';

let listeners = [];
let tasks = [];
let settings = {
  closedDays: [0],
  notificationTime: '08:00',
};

export function subscribe(listener) {
  listeners.push(listener);
  return () => { listeners = listeners.filter(l => l !== listener); };
}

function notify() {
  listeners.forEach(l => l({ tasks: [...tasks], settings: { ...settings } }));
}

function fromDB(row) {
  return {
    id: row.id,
    name: row.title,
    startDate: row.start_date || null,
    deadline: row.deadline,
    category: row.category,
    difficulty: row.difficulty || 'small',
    notes: row.notes || '',
    completed: row.completed || false,
    createdAt: row.created_at,
    isCheckpoint: row.is_checkpoint || false,
    parentTaskId: row.parent_task_id || null,
    label: row.label || null,
  };
}

function toDB(task, userId) {
  return {
    id: task.id,
    user_id: userId,
    title: task.name,
    start_date: task.startDate || null,
    deadline: task.deadline,
    category: task.category || 'other',
    difficulty: task.difficulty || 'small',
    notes: task.notes || '',
    completed: task.completed || false,
    is_checkpoint: task.isCheckpoint || false,
    parent_task_id: task.parentTaskId || null,
    label: task.label || null,
  };
}

function isWorkDay(date) {
  return !settings.closedDays.includes(new Date(date).getDay());
}

function findWorkDay(date) {
  let d = new Date(date);
  while (!isWorkDay(d)) d = addDays(d, -1);
  return d;
}

function generateCheckpoints(taskId, deadline, difficulty) {
  const rules = REVERSE_RULES[difficulty] || REVERSE_RULES.small;
  return rules.map(rule => {
    let date = subDays(new Date(deadline), rule.daysBeforeDeadline);
    date = findWorkDay(date);
    return {
      id: crypto.randomUUID(),
      parentTaskId: taskId,
      name: rule.label,
      label: rule.label,
      deadline: format(date, 'yyyy-MM-dd'),
      completed: false,
      isCheckpoint: true,
      category: null,
      difficulty: 'small',
      notes: '',
      startDate: null,
    };
  }).filter(cp => cp.deadline < deadline);
}

export function getTasks()    { return [...tasks]; }
export function getSettings() { return { ...settings }; }

export async function loadData() {
  tasks = [];
  const settingsJson = localStorage.getItem(SETTINGS_KEY);
  if (settingsJson) {
    try { settings = { ...settings, ...JSON.parse(settingsJson) }; } catch (e) {}
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { notify(); return; }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });

  if (!error && data) tasks = data.map(fromDB);
  notify();
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function addTask(taskData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const id = crypto.randomUUID();
  const newTask = {
    id,
    name:         taskData.name,
    startDate:    taskData.startDate || null,
    deadline:     taskData.deadline,
    category:     taskData.category || 'other',
    difficulty:   taskData.difficulty || 'small',
    notes:        taskData.notes || '',
    completed:    false,
    createdAt:    new Date().toISOString(),
    isCheckpoint: false,
    parentTaskId: null,
    label:        null,
  };
  const checkpoints = generateCheckpoints(id, taskData.deadline, newTask.difficulty);
  const allTasks = [newTask, ...checkpoints];

  const { error } = await supabase.from('tasks').insert(allTasks.map(t => toDB(t, user.id)));
  if (error) { console.error('addTask error:', error); return; }

  tasks = [...tasks, ...allTasks];
  notify();
  return newTask;
}

export async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const next = !task.completed;
  const { error } = await supabase.from('tasks').update({ completed: next }).eq('id', id);
  if (error) { console.error('toggleTask error:', error); return; }
  tasks = tasks.map(t => t.id === id ? { ...t, completed: next } : t);
  notify();
}

export async function deleteTask(id) {
  const ids = tasks.filter(t => t.id === id || t.parentTaskId === id).map(t => t.id);
  const { error } = await supabase.from('tasks').delete().in('id', ids);
  if (error) { console.error('deleteTask error:', error); return; }
  tasks = tasks.filter(t => t.id !== id && t.parentTaskId !== id);
  notify();
}

export async function updateSettings(newSettings) {
  settings = { ...settings, ...newSettings };
  saveSettings();
  notify();
}
