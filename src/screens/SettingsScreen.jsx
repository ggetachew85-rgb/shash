import { useState, useEffect, useRef } from 'react';
import { getGoals, saveGoals, getSettings, saveSettings, exportBackup, importBackup } from '../utils/storage';

export default function SettingsScreen() {
  const [goals, setGoals] = useState({});
  const [settings, setSettings] = useState({});
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const fileRef = useRef();

  useEffect(() => { load(); }, []);
  const load = () => { setGoals(getGoals()); setSettings(getSettings()); };

  const startEdit = (key, val, src) => { setEditing({ key, src }); setEditVal(String(val)); };
  const saveEdit = () => {
    if (!editing) return;
    if (editing.src === 'goals') { const g = { ...goals, [editing.key]: isNaN(editVal) ? editVal : parseFloat(editVal) }; setGoals(g); saveGoals(g); }
    else { const s = { ...settings, [editing.key]: editVal }; setSettings(s); saveSettings(s); }
    setEditing(null);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importBackup(file).then(() => { alert('Restored! Reload the page to see your data.'); load(); }).catch(() => alert('Import failed. Make sure it\'s a valid Shash backup file.'));
  };

  const Field = ({ label, fkey, src, unit='' }) => {
    const val = src === 'settings' ? settings[fkey] : goals[fkey];
    const isEditing = editing?.key === fkey;
    return (
      <div className="field-row">
        <span style={{ fontSize:15, color:'var(--text-2)', flex:1 }}>{label}</span>
        {isEditing ? (
          <div className="field-input-wrap">
            <input type="text" className="field-input" value={editVal} onChange={e => setEditVal(e.target.value)} autoFocus onKeyDown={e => { if(e.key==='Enter') saveEdit(); if(e.key==='Escape') setEditing(null); }} style={{ width:120 }} />
            <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
          </div>
        ) : (
          <div className="field-val" onClick={() => startEdit(fkey, val, src)}>
            <div className="field-val-text">{val != null ? `${unit}${val}` : '—'}</div>
            <div className="field-edit-hint">tap to edit</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="screen">
      <div className="screen-header"><h1>Settings</h1></div>
      <div className="screen-inner" style={{ paddingTop:0 }}>

        <div className="section-title">Profile</div>
        <div className="card">
          <Field label="Your name" fkey="name" src="settings" />
        </div>

        <div className="section-title">Health goals</div>
        <div className="card">
          <Field label="Starting weight" fkey="startWeight" src="goals" unit="" />
          <div className="divider" />
          <Field label="Target weight" fkey="targetWeight" src="goals" unit="" />
        </div>

        <div className="section-title">Financial goals</div>
        <div className="card">
          <Field label="Wedding budget ($)" fkey="weddingBudget" src="goals" unit="$" />
          <div className="divider" />
          <Field label="Emergency fund ($)" fkey="emergencyFundTarget" src="goals" unit="$" />
        </div>

        <div className="section-title">Data</div>
        <div className="card">
          <div className="row-between" style={{ padding:'8px 0', cursor:'pointer' }} onClick={exportBackup}>
            <div><h3>Export backup</h3><div className="caption">Download all your data as JSON</div></div>
            <span style={{ fontSize:20 }}>⬆</span>
          </div>
          <div className="divider" />
          <div className="row-between" style={{ padding:'8px 0', cursor:'pointer' }} onClick={() => fileRef.current?.click()}>
            <div><h3>Restore from backup</h3><div className="caption">Overwrite data from a backup file</div></div>
            <span style={{ fontSize:20 }}>⬇</span>
          </div>
          <input ref={fileRef} type="file" accept=".json" style={{ display:'none' }} onChange={handleImport} />
        </div>

        <div className="section-title">About</div>
        <div className="card">
          <h3>Shash v1.0</h3>
          <div className="caption" style={{ marginTop:4 }}>Built for G — your goals, your plan, your app.</div>
        </div>
        <div style={{ height:40 }} />
      </div>
    </div>
  );
}
