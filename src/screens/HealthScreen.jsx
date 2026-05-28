import { useState, useEffect } from 'react';
import { getWeightLog, addWeightEntry, deleteWeightEntry, getTodayFood, saveFood, getGoals } from '../utils/storage';

export default function HealthScreen() {
  const [weightLog, setWeightLog] = useState([]);
  const [goals, setGoals] = useState({ targetWeight:158, startWeight:210 });
  const [food, setFood] = useState({ outsideCount:0, notes:'' });
  const [tab, setTab] = useState('weight');
  const [newWeight, setNewWeight] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { load(); }, []);
  const load = () => {
    setWeightLog(getWeightLog().slice().reverse());
    setGoals(getGoals());
    setFood(getTodayFood());
  };

  const handleAddWeight = () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w < 50 || w > 600) return alert('Enter a valid weight in lbs');
    addWeightEntry(w); setNewWeight(''); setShowModal(false); load();
  };

  const handleDeleteWeight = (id, weight) => {
    if (confirm(`Remove ${weight} lbs entry?`)) { deleteWeightEntry(id); load(); }
  };

  const updateFood = (updates) => {
    const updated = { ...food, ...updates };
    setFood(updated); saveFood(updated);
  };

  const current = weightLog.length ? weightLog[0].weight : null;
  const lost = current ? Math.max(0, goals.startWeight - current) : 0;
  const total = goals.startWeight - goals.targetWeight;
  const pct = total > 0 ? Math.min(100, Math.round(lost / total * 100)) : 0;
  const toGo = current ? Math.max(0, current - goals.targetWeight) : total;

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Health</h1>
        {tab === 'weight' && <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Log weight</button>}
      </div>
      <div className="screen-inner" style={{ paddingTop:0 }}>
        <div className="tabs">
          {['weight','food'].map(t => <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t === 'weight' ? 'Weight' : 'Food log'}</button>)}
        </div>

        {tab === 'weight' ? (<>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
            {[['Current', current ? `${current}` : '—', 'var(--text)'],['Lost', lost > 0 ? `-${lost}` : '0', 'var(--accent)'],['To go', toGo, 'var(--warn)']].map(([l,v,c]) => (
              <div key={l} className="stat-card"><div className="stat-label">{l}</div><div className="stat-val" style={{ fontSize:20, color:c }}>{v}</div><div className="caption">lbs</div></div>
            ))}
          </div>
          <div className="card">
            <div className="row-between" style={{ marginBottom:8 }}><h3>Goal progress</h3><span style={{ color:'var(--accent)', fontWeight:700 }}>{pct}%</span></div>
            <div className="progress-bar"><div className="progress-fill" style={{ width:`${pct}%`, background:'var(--accent)' }} /></div>
            <div className="row-between" style={{ marginTop:6 }}><span className="caption">{goals.startWeight} lbs start</span><span className="caption">{goals.targetWeight} lbs goal</span></div>
          </div>
          <div className="section-title">Log history</div>
          {weightLog.length === 0 ? <div className="empty">No entries yet. Log your first weight.</div> : weightLog.map((entry, i) => {
            const prev = weightLog[i+1];
            const diff = prev ? entry.weight - prev.weight : null;
            return (
              <div key={entry.id} className="card row-between" onDoubleClick={() => handleDeleteWeight(entry.id, entry.weight)}>
                <div><div style={{ fontSize:17, fontWeight:600 }}>{entry.weight} lbs</div><div className="caption">{entry.date}</div></div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {diff !== null && <span style={{ fontSize:17, fontWeight:700, color: diff < 0 ? 'var(--accent)' : 'var(--danger)' }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}</span>}
                  {i === 0 && <span className="badge" style={{ background:'var(--accent-dim)', color:'var(--accent)' }}>latest</span>}
                </div>
              </div>
            );
          })}
          <div className="hint">Double-tap any entry to delete it</div>
        </>) : (<>
          <div className="card">
            <h3 style={{ marginBottom:12 }}>Times eaten outside today</h3>
            <div className="counter-row">
              <button className="counter-btn" onClick={() => updateFood({ outsideCount: Math.max(0, (food.outsideCount||0)-1) })}>−</button>
              <div style={{ textAlign:'center' }}>
                <div className="counter-num" style={{ color: (food.outsideCount||0) > 2 ? 'var(--danger)' : (food.outsideCount||0) > 1 ? 'var(--warn)' : 'var(--accent)' }}>{food.outsideCount||0}</div>
                <div className="caption">times</div>
              </div>
              <button className="counter-btn" onClick={() => updateFood({ outsideCount: (food.outsideCount||0)+1 })}>+</button>
            </div>
            <div style={{ textAlign:'center', fontSize:13, color:'var(--text-2)', marginTop:10 }}>
              {(food.outsideCount||0) === 0 ? '✓ Perfect — home cooking wins today' : (food.outsideCount||0) <= 1 ? '✓ Good — under target' : (food.outsideCount||0) <= 3 ? '⚠ Getting close to your 3x limit' : '✕ Over today\'s limit'}
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom:10 }}>Notes for today</h3>
            <textarea placeholder="What did you eat? How did you feel? Any wins or struggles..." value={food.notes||''} onChange={e => setFood(f=>({...f,notes:e.target.value}))} onBlur={() => saveFood(food)} />
          </div>
          <div className="card">
            <h3 style={{ marginBottom:12 }}>Weekly targets</h3>
            {[['🎯','Max 3x eating outside per week'],['🥚','High protein every meal — 150g+ daily'],['🍗','Meal prep Sunday — batch cook rice + chicken']].map(([icon,text]) => (
              <div key={text} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}><span style={{ fontSize:18 }}>{icon}</span><span style={{ fontSize:14, color:'var(--text-2)' }}>{text}</span></div>
            ))}
          </div>
        </>)}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 style={{ marginBottom:20 }}>Log weight</h2>
            <input type="number" placeholder="210" value={newWeight} onChange={e => setNewWeight(e.target.value)} style={{ fontSize:32, fontWeight:700, textAlign:'center', marginBottom:8 }} onKeyDown={e => e.key==='Enter' && handleAddWeight()} autoFocus />
            <div className="caption" style={{ textAlign:'center', marginBottom:20 }}>Enter your weight in lbs</div>
            <button className="btn btn-primary" onClick={handleAddWeight}>Save entry</button>
            <button className="btn btn-secondary" style={{ marginTop:10 }} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
