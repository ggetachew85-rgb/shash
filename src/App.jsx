import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import TodosScreen from './screens/TodosScreen';
import HealthScreen from './screens/HealthScreen';
import FinanceScreen from './screens/FinanceScreen';
import SettingsScreen from './screens/SettingsScreen';

const TABS = [
  { key:'home', label:'Home', icon:'⌂' },
  { key:'todos', label:'Todos', icon:'✓' },
  { key:'health', label:'Health', icon:'♥' },
  { key:'finance', label:'Finance', icon:'$' },
  { key:'settings', label:'Settings', icon:'⚙' },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const screens = { home:<HomeScreen />, todos:<TodosScreen />, health:<HealthScreen />, finance:<FinanceScreen />, settings:<SettingsScreen /> };

  return (
    <div className="app">
      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
        {screens[tab]}
      </div>
      <nav className="bottom-nav">
        {TABS.map(t => (
          <button key={t.key} className={`nav-item ${tab===t.key?'active':''}`} onClick={() => setTab(t.key)}>
            <div className="nav-icon">{t.icon}</div>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
