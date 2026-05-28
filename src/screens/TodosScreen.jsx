import { useState, useEffect } from 'react';
import { getTodos, addTodo, toggleTodo, deleteTodo, updateTodo, isTodoComplete } from '../utils/storage';

const FREQS = [{ key:'daily',label:'Daily',color:'var(--accent)'},{key:'weekly',label:'Weekly',color:'var(--info)'},{key:'monthly',label:'Monthly',color:'var(--warn)'},{key:'yearly',label:'Yearly',color:'var(--purple)'},{key:'once',label:'One-time',color:'var(--text-2)'}];
const CATS = ['general','health','finance','career','habits','family'];

export default function TodosScreen() {
  const [todos, setTodos] = useState([]);
  const [tab, setTab] = useState('daily');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ title:'', frequency:'daily', category:'general' });

  useEffect(() => { load(); }, []);
  const load = () => setTodos(getTodos());

  const filtered = todos.filter(t => t.frequency === tab);
  const done = filtered.filter(t => isTodoComplete(t)).length;
  const pct = filtered.length ? Math.round(done / filtered.length * 100) : 0;
  const tabColor = FREQS.find(f => f.key === tab)?.color || 'var(--accent)';

  const handleToggle = (id) => setTodos(toggleTodo(id));
  const handleDelete = (id) => { if (confirm('Delete this todo?')) { deleteTodo(id); load(); } };

  const openAdd = () => { setEditItem(null); setForm({ title:'', frequency:tab, category:'general' }); setShowModal(true); };
  const openEdit = (t) => { setEditItem(t); setForm({ title:t.title, frequency:t.frequency, category:t.category||'general' }); setShowModal(true); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editItem) updateTodo(editItem.id, { title:form.title, frequency:form.frequency, category:form.category });
    else addTodo(form);
    setShowModal(false); load();
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Todos</h1>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add</button>
      </div>
      <div className="screen-inner" style={{ paddingTop: 0 }}>
        <div className="tabs">
          {FREQS.map(f => <button key={f.key} className={`tab-btn ${tab===f.key?'active':''}`} onClick={() => setTab(f.key)} style={tab===f.key?{color:f.color,borderColor:f.color,background:`${f.color}15`}:{}}>{f.label}</button>)}
        </div>

        {filtered.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div className="progress-bar" style={{ flex:1 }}>
              <div className="progress-fill" style={{ width:`${pct}%`, background:tabColor }} />
            </div>
            <span className="caption">{done}/{filtered.length} done</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty">
            <div style={{ marginBottom:8 }}>No {tab} todos yet.</div>
            <button className="btn btn-secondary btn-sm" onClick={openAdd} style={{ width:'auto' }}>+ Add one</button>
          </div>
        ) : filtered.map(todo => {
          const complete = isTodoComplete(todo);
          const color = FREQS.find(f => f.key === todo.frequency)?.color || 'var(--accent)';
          return (
            <div key={todo.id} className={`todo-item ${complete?'done':''}`} onClick={() => handleToggle(todo.id)}>
              <div className={`checkbox ${complete?'checked':''}`} style={complete?{background:color,borderColor:color}:{}}>
                {complete && <span className="checkmark">✓</span>}
              </div>
              <div style={{ flex:1 }} onDoubleClick={(e) => { e.stopPropagation(); openEdit(todo); }}>
                <div className={`todo-text ${complete?'done':''}`}>{todo.title}</div>
                <div className="todo-cat">{todo.category}</div>
              </div>
              <span className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(todo.id); }}>✕</span>
            </div>
          );
        })}
        <div className="hint">Double-tap any todo to edit it</div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header">
              <h2>{editItem ? 'Edit todo' : 'New todo'}</h2>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" placeholder="What do you need to do?" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} autoFocus onKeyDown={e => e.key==='Enter' && handleSave()} />
            </div>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <div className="pill-options">
                {FREQS.map(f => <button key={f.key} className={`pill-opt ${form.frequency===f.key?'selected':''}`} style={form.frequency===f.key?{color:f.color,borderColor:f.color,background:`${f.color}15`}:{}} onClick={() => setForm(x=>({...x,frequency:f.key}))}>{f.label}</button>)}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="pill-options">
                {CATS.map(c => <button key={c} className={`pill-opt ${form.category===c?'selected':''}`} onClick={() => setForm(x=>({...x,category:c}))}>{c}</button>)}
              </div>
            </div>
            <button className="btn btn-secondary" style={{ marginTop:8 }} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
