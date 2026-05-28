import { useState, useEffect } from 'react';
import { getDebtAccounts, addDebtAccount, updateDebtBalance, deleteDebtAccount, getUberLog, addUberEntry, deleteUberEntry } from '../utils/storage';

const TYPES = ['credit_card','student_loan','car_loan','personal_loan','other'];
const typeColor = t => ({credit_card:'var(--danger)',student_loan:'var(--warn)',car_loan:'var(--info)',personal_loan:'var(--purple)',other:'var(--text-2)'}[t]||'var(--text-2)');

export default function FinanceScreen() {
  const [debts, setDebts] = useState([]);
  const [ulog, setUlog] = useState([]);
  const [tab, setTab] = useState('debt');
  const [showDebt, setShowDebt] = useState(false);
  const [showUber, setShowUber] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [df, setDf] = useState({ name:'', balance:'', apr:'', minimumPayment:'', type:'credit_card' });
  const [uf, setUf] = useState({ gross:'', expenses:'', notes:'' });
  const [newBal, setNewBal] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => { setDebts(getDebtAccounts().sort((a,b) => b.apr - a.apr)); setUlog(getUberLog()); };

  const total = debts.reduce((s,a) => s+a.balance, 0);
  const interest = debts.reduce((s,a) => s+(a.balance*(a.apr/12/100)), 0);
  const minimums = debts.reduce((s,a) => s+(a.minimumPayment||0), 0);
  const now = new Date();
  const mk = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const monthUber = ulog.filter(e => e.date?.startsWith(mk)).reduce((s,e) => s+(parseFloat(e.net)||0), 0);
  const totalUber = ulog.reduce((s,e) => s+(parseFloat(e.net)||0), 0);

  const addDebt = () => {
    if (!df.name || !df.balance) return;
    addDebtAccount(df); setShowDebt(false); setDf({ name:'', balance:'', apr:'', minimumPayment:'', type:'credit_card' }); load();
  };
  const doUpdate = () => {
    if (!updateTarget || !newBal) return;
    updateDebtBalance(updateTarget.id, newBal); setUpdateTarget(null); setNewBal(''); load();
  };
  const deleteDebt = (id, name) => { if (confirm(`Delete ${name}?`)) { deleteDebtAccount(id); load(); } };
  const addUber = () => {
    const g = parseFloat(uf.gross); if (isNaN(g)) return;
    addUberEntry({ gross:g, expenses:parseFloat(uf.expenses)||0, net:g-(parseFloat(uf.expenses)||0), notes:uf.notes });
    setShowUber(false); setUf({ gross:'', expenses:'', notes:'' }); load();
  };
  const delUber = (id) => { if (confirm('Delete this session?')) { deleteUberEntry(id); load(); } };

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Finance</h1>
        <button className="btn btn-primary btn-sm" onClick={() => tab==='debt' ? setShowDebt(true) : setShowUber(true)}>+ Add</button>
      </div>
      <div className="screen-inner" style={{ paddingTop:0 }}>
        <div className="tabs">
          {['debt','uber'].map(t => <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t==='debt'?'Debt tracker':'Uber Eats'}</button>)}
        </div>

        {tab === 'debt' ? (<>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div className="stat-card"><div className="stat-label">Total debt</div><div className="stat-val" style={{ color:'var(--danger)', fontSize:20 }}>${Math.round(total).toLocaleString()}</div></div>
            <div className="stat-card"><div className="stat-label">Monthly interest</div><div className="stat-val" style={{ color:'var(--warn)', fontSize:20 }}>${Math.round(interest)}</div><div className="caption">burning/mo</div></div>
          </div>
          <div className="card row-between" style={{ marginBottom:16 }}>
            <h3>Min payments/month</h3>
            <span style={{ fontWeight:600, fontSize:15 }}>${Math.round(minimums)}</span>
          </div>
          <div className="section-title">Accounts — sorted by APR (attack order)</div>
          {debts.length === 0 ? <div className="empty">No accounts yet. Add your first debt.</div> : debts.map((debt, i) => (
            <div key={debt.id} className="card" style={i===0?{borderColor:'rgba(255,68,68,0.4)',borderWidth:1}:{}}>
              {i===0 && <div className="attack-badge"><span style={{ fontSize:12, color:'var(--danger)', fontWeight:600 }}>🎯 Attack this first</span></div>}
              <div className="row-between" style={{ marginBottom:8 }}>
                <h3>{debt.name}</h3>
                <span className="badge" style={{ background:`${typeColor(debt.type)}20`, color:typeColor(debt.type) }}>{debt.type.replace('_',' ')}</span>
              </div>
              <div className="row-between">
                <div>
                  <div style={{ fontSize:20, fontWeight:700, color:'var(--danger)' }}>${Math.round(debt.balance).toLocaleString()}</div>
                  <div className="caption">{debt.apr}% APR · ${Math.round(debt.minimumPayment||0)}/mo min</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setUpdateTarget(debt); setNewBal(debt.balance.toString()); }}>Update</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteDebt(debt.id, debt.name)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </>) : (<>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            <div className="stat-card"><div className="stat-label">This month</div><div className="stat-val" style={{ color:'var(--accent)', fontSize:20 }}>${Math.round(monthUber)}</div></div>
            <div className="stat-card"><div className="stat-label">All time net</div><div className="stat-val" style={{ color:'var(--accent)', fontSize:20 }}>${Math.round(totalUber)}</div></div>
          </div>
          <div className="section-title">Sessions</div>
          {ulog.length === 0 ? <div className="empty">No sessions yet.</div> : ulog.map(e => (
            <div key={e.id} className="card row-between" onDoubleClick={() => delUber(e.id)}>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:'var(--accent)' }}>+${parseFloat(e.net).toFixed(2)}</div>
                <div className="caption">{e.date} · gross ${e.gross} · exp ${e.expenses||0}</div>
                {e.notes && <div className="caption">{e.notes}</div>}
              </div>
            </div>
          ))}
          <div className="hint">Double-tap a session to delete it</div>
        </>)}
      </div>

      {showDebt && (
        <div className="modal-overlay" onClick={() => setShowDebt(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header"><h2>Add debt account</h2><button className="btn btn-primary btn-sm" onClick={addDebt}>Save</button></div>
            {[['Name','name','e.g. Chase CC','text'],['Balance ($)','balance','0.00','number'],['APR (%)','apr','20','number'],['Min Payment ($)','minimumPayment','0','number']].map(([l,k,p,t]) => (
              <div key={k} className="form-group"><label className="form-label">{l}</label><input type={t} placeholder={p} value={df[k]} onChange={e => setDf(f=>({...f,[k]:e.target.value}))} /></div>
            ))}
            <div className="form-group">
              <label className="form-label">Type</label>
              <div className="pill-options">{TYPES.map(t => <button key={t} className={`pill-opt ${df.type===t?'selected':''}`} style={df.type===t?{color:'var(--danger)',borderColor:'var(--danger)',background:'var(--danger-dim)'}:{}} onClick={() => setDf(f=>({...f,type:t}))}>{t.replace('_',' ')}</button>)}</div>
            </div>
            <button className="btn btn-secondary" style={{ marginTop:8 }} onClick={() => setShowDebt(false)}>Cancel</button>
          </div>
        </div>
      )}

      {updateTarget && (
        <div className="modal-overlay" onClick={() => setUpdateTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 style={{ marginBottom:6 }}>Update balance</h2>
            <div className="caption" style={{ marginBottom:16 }}>{updateTarget.name}</div>
            <input type="number" value={newBal} onChange={e => setNewBal(e.target.value)} style={{ fontSize:28, fontWeight:700, textAlign:'center', marginBottom:16 }} autoFocus onKeyDown={e => e.key==='Enter' && doUpdate()} />
            <button className="btn btn-primary" onClick={doUpdate}>Update</button>
            <button className="btn btn-secondary" style={{ marginTop:10 }} onClick={() => setUpdateTarget(null)}>Cancel</button>
          </div>
        </div>
      )}

      {showUber && (
        <div className="modal-overlay" onClick={() => setShowUber(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header"><h2>Log session</h2><button className="btn btn-primary btn-sm" onClick={addUber}>Save</button></div>
            {[['Gross earnings ($)','gross','50','number'],['Expenses ($)','expenses','0','number'],['Notes (optional)','notes','Good night, 3 hrs...','text']].map(([l,k,p,t]) => (
              <div key={k} className="form-group"><label className="form-label">{l}</label><input type={t} placeholder={p} value={uf[k]} onChange={e => setUf(f=>({...f,[k]:e.target.value}))} /></div>
            ))}
            {uf.gross && <div className="caption" style={{ textAlign:'center', color:'var(--accent)', marginBottom:16 }}>Net: ${(parseFloat(uf.gross||0)-parseFloat(uf.expenses||0)).toFixed(2)}</div>}
            <button className="btn btn-secondary" onClick={() => setShowUber(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
