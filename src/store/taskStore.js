import { REVERSE_RULES } from '../constants';
import { addDays, subDays, format } from 'date-fns';

const STORAGE_KEY = '@megane_tasks';
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

export async function loadData() {
  try {
    const tasksJson    = localStorage.getItem(STORAGE_KEY);
    const settingsJson = localStorage.getItem(SETTINGS_KEY);
    if (tasksJson)    tasks    = JSON.parse(tasksJson);
    if (settingsJson) settings = { ...settings, ...JSON.parse(settingsJson) };
  } catch (e) {}
  notify();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function isWorkDay(date) {
  const day = new Date(date).getDay();
  return !settings.closedDays.includes(day);
}

function findWorkDay(date) {
  let d = new Date(date);
  while (!isWorkDay(d)) {
    d = addDays(d, -1);
  }
  return d;
}

function generateCheckpoints(taskId, deadline, difficulty) {
  const rules = REVERSE_RULES[difficulty] || REVERSE_RULES.small;
  return rules.map((rule, idx) => {
    let date = subDays(new Date(deadline), rule.daysBeforeDeadline);
    date = findWorkDay(date);
    return {
      id: `${taskId}_cp${idx}`,
      parentTaskId: taskId,
      label: rule.label,
      name: rule.label,
      deadline: format(date, 'yyyy-MM-dd'),
      completed: false,
      isCheckpoint: true,
    };
  }).filter(cp => cp.deadline < deadline);
}

export function getTasks()    { return [...tasks]; }
export function getSettings() { return { ...settings }; }

export async function addTask(taskData) {
  const id = `task_${Date.now()}`;
  const newTask = {
    id,
    name:       taskData.name,
    startDate:  taskData.startDate || null,
    deadline:   taskData.deadline,
    category:   taskData.category || 'other',
    difficulty: taskData.difficulty || 'small',
    notes:      taskData.notes || '',
    completed:  false,
    createdAt:  new Date().toISOString(),
    isCheckpoint: false,
  };
  const checkpoints = generateCheckpoints(id, taskData.deadline, newTask.difficulty);
  tasks = [...tasks, newTask, ...checkpoints];
  saveTasks();
  notify();
  return newTask;
}

export async function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTasks();
  notify();
}

export async function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id && t.parentTaskId !== id);
  saveTasks();
  notify();
}

export async function updateSettings(newSettings) {
  settings = { ...settings, ...newSettings };
  saveSettings();
  notify();
}
