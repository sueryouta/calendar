export const COLORS = {
  primary: '#2d6a9f',
  primaryDark: '#1a3c5e',
  secondary: '#27ae60',
  warning: '#f0b429',
  danger: '#c0392b',
  background: '#f5f6f8',
  white: '#ffffff',
  lightBlue: '#e8f0f8',
  text: '#1a1a1a',
  textLight: '#666666',
  border: '#e5eaf0',
};

export const DARK_COLORS = {
  primary: '#4fa8e0',
  primaryDark: '#2d6a9f',
  secondary: '#2ecc71',
  warning: '#f0b429',
  danger: '#e74c3c',
  background: '#0d1117',
  white: '#161b22',
  lightBlue: '#1a2635',
  text: '#e6edf3',
  textLight: '#8b949e',
  border: '#30363d',
};

export const DIFFICULTY_LABELS = {
  small: '小',
  medium: '中',
  large: '大',
};

export const REVERSE_RULES = {
  small: [
    { daysBeforeDeadline: 1, label: '最終確認' },
  ],
  medium: [
    { daysBeforeDeadline: 3, label: '準備開始' },
    { daysBeforeDeadline: 1, label: '最終確認' },
  ],
  large: [
    { daysBeforeDeadline: 7, label: '初動開始' },
    { daysBeforeDeadline: 3, label: '中間確認' },
    { daysBeforeDeadline: 1, label: '最終確認' },
  ],
};

export const TEMPLATES = [
  { id: 't1', name: '棚卸し',       category: 'routine', difficulty: 'medium' },
  { id: 't2', name: '在庫確認',     category: 'routine', difficulty: 'small' },
  { id: 't3', name: '月次レポート', category: 'honsha',  difficulty: 'medium' },
  { id: 't4', name: '売上集計',     category: 'store',   difficulty: 'small' },
  { id: 't5', name: '清掃・点検',   category: 'routine', difficulty: 'small' },
];
