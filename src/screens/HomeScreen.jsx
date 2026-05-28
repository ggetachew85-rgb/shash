import { useState, useEffect } from 'react';
import { getTodos, isTodoComplete, getWeightLog, getGoals, getDebtAccounts, getUberLog, getTodayFood, getPriorities, savePriorities, getSettings } from '../utils/storage';

export default function HomeScreen() {
  const [priorities, setPriorities] = useState(['', '', '']);
  const [stats, setStats] = useState({ todayDone: 0, todayTotal: 0, currentWeight: null, totalDebt: 0, monthUber: 0, outsideToday: 0 });
  const [goals, setGoals] = useState({ targetWeight: 158, startWeight: 210 });
  const [name, setName] = useState('G');

  useEffect(() => { load(); }, []);

  const load = () => {
    const todos = getTodos();
    const wlog = getWeightLog();
    const g = getGoals();
    const debts = getDebtAccounts();
    const ulog = getUberLog();
    const food = getTodayFood();
    const s = getSettings();
    const p = getPriorities();
    setPriorities(p);
    setGoals(g);
    setName(s.name || 'G');
    const daily = todos.filter(t => t.frequency === 'daily');
    const done = daily.filter(t => isTodoComplete(t)).length;
    const lastWeight = wlog.length ? wlog[wlog.length - 1].weight : null;
    const totalDebt = debts.reduce((s, a) => s + a.balance, 0);
    const now = new Date();
    const mk = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const monthUber = ulog.filter(e => e.date?.startsWith(mk)).reduce((s,e) => s + (parseFloat(e.net)||0), 0);
    setStats({ todayDone: done, todayTotal: daily.length, currentWeight: lastWeight, totalDebt, monthUber, outsideToday: food.outsideCount || 0 });
  };

  const updatePriority = (i, val) => {
    const p = [...priorities]; p[i] = val; setPriorities(p);
  };
  const savePrio = () => savePriorities(priorities);

  const lostSoFar = stats.currentWeight ? Math.max(0, goals.startWeight - stats.currentWeight) : 0;
  const pct = goals.startWeight !== goals.targetWeight ? Math.min(100, Math.round(lostSoFar / (goals.startWeight - goals.targetWeight) * 100)) : 0;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todoPct = stats.todayTotal ? Math.round(stats.todayDone / stats.todayTotal * 100) : 0;

  return (
    <div className="screen">
      <div className="screen-inner">
        <div style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 52px)', marginBottom: 24 }}>
          <div className="caption" style={{ marginBottom: 4 }}>{today}</div>
          <h1>{greeting}, {name}.</h1>
        </div>

        <div className="stats-grid">
          <div className="stat-card card-accent">
            <div className="stat-label" style={{ color: 'var(--accent)' }}>Daily todos</div>
            <div className="stat-val" style={{ color: 'var(--accent)' }}>{stats.todayDone}/{stats.todayTotal}</div>
            <div className="mini-bar" style={{ marginTop: 8 }}><div className="mini-bar-fill" style={{ width: `${todoPct}%` }} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total debt</div>
            <div className="stat-val" style={{ color: 'var(--danger)' }}>${Math.round(stats.totalDebt).toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Weight</div>
            <div className="stat-val">{stats.currentWeight ? `${stats.currentWeight}` : '—'}</div>
            {stats.currentWeight && <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 2 }}>-{lostSoFar} lbs ({pct}%)</div>}
          </div>
          <div className="stat-card">
            <div className="stat-label">Uber this month</div>
            <div className="stat-val" style={{ color: 'var(--accent)' }}>${Math.round(stats.monthUber)}</div>
          </div>
        </div>

        <div className="section-title">Today's 3 priorities</div>
        {[0, 1, 2].map(i => (
          <div key={i} className="priority-row">
            <div className="priority-num">{i + 1}</div>
            <input
              type="text"
              className="priority-input"
              placeholder={`Priority ${i + 1}...`}
              value={priorities[i]}
              onChange={e => updatePriority(i, e.target.value)}
              onBlur={savePrio}
            />
            {priorities[i] && <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', flexShrink: 0 }} />}
          </div>
        ))}

        <div className="section-title">Today's snapshot</div>
        <div className="card">
          <div className="row-between" style={{ marginBottom: 10 }}>
            <h3>Ate outside today</h3>
            <span style={{ fontSize: 18, fontWeight: 700, color: (stats.outsideToday||0) > 2 ? 'var(--danger)' : (stats.outsideToday||0) > 1 ? 'var(--warn)' : 'var(--accent)' }}>{stats.outsideToday||0}x</span>
          </div>
          <div className="row-between">
            <h3>Daily todos done</h3>
            <span style={{ fontSize: 18, fontWeight: 700, color: stats.todayTotal > 0 && stats.todayDone === stats.todayTotal ? 'var(--accent)' : stats.todayDone > 0 ? 'var(--warn)' : 'var(--text-2)' }}>{stats.todayDone}/{stats.todayTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
