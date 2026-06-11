import { useEffect, useState } from 'react';
import HomeScreen     from './screens/HomeScreen';
import TaskListScreen from './screens/TaskListScreen';
import AddTaskScreen  from './screens/AddTaskScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen    from './screens/PasswordScreen';

import { supabase }       from './lib/supabase';
import { loadData }       from './store/taskStore';
import { loadTemplates }  from './store/templateStore';
import { loadCategories } from './store/categoryStore';
import { loadTheme }      from './store/themeStore';
import useTheme           from './hooks/useTheme';

const TABS = [
  { key: 'home',     label: 'ホーム',   emoji: '📅', title: '店舗業務カレンダー' },
  { key: 'tasks',    label: 'タスク',   emoji: '📋', title: 'タスク一覧' },
  { key: 'settings', label: '設定',     emoji: '⚙️', title: '設定' },
];

function AppContent() {
  const C = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [showAddTask, setShowAddTask] = useState(false);

  function navigate(screen) {
    if (screen === 'AddTask') { setShowAddTask(true); return; }
    const tab = TABS.find(t => t.key === screen.toLowerCase() || t.title === screen);
    if (tab) setActiveTab(tab.key);
  }

  const currentTab = TABS.find(t => t.key === activeTab) || TABS[0];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: C.background,
      position: 'relative',
      maxWidth: 800,
      margin: '0 auto',
    }}>
      <div style={{
        backgroundColor: C.primaryDark,
        padding: '0 16px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}>
        <span style={{ color: '#fff', fontWeight: '700', fontSize: 17 }}>{currentTab.title}</span>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'home'  && <HomeScreen     navigate={navigate} />}
        {activeTab === 'tasks' && <TaskListScreen navigate={navigate} />}
        {activeTab === 'settings' && <SettingsScreen />}
      </div>

      <div style={{
        display: 'flex',
        backgroundColor: C.white,
        borderTop: `1px solid ${C.border}`,
        height: 60,
        flexShrink: 0,
      }}>
        {TABS.map(tab => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                paddingBottom: 4,
                color: active ? C.primary : C.textLight,
              }}
            >
              <span style={{ fontSize: 22, opacity: active ? 1 : 0.5, lineHeight: 1 }}>{tab.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: '600', color: active ? C.primary : C.textLight }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {showAddTask && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <AddTaskScreen onClose={() => setShowAddTask(false)} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadTheme();
        loadData();
        loadTemplates();
        loadCategories();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(prev => {
        const prevId = prev?.user?.id;
        const nextId = session?.user?.id;
        if (nextId && nextId !== prevId) {
          loadTheme();
          loadData();
          loadTemplates();
          loadCategories();
        }
        return session;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4f8',
        fontSize: 16,
        color: '#666',
      }}>
        読み込み中...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ height: '100dvh' }}>
        <LoginScreen />
      </div>
    );
  }

  return <AppContent />;
}
