const KEYS = {
  TODOS: 'shash_todos',
  PRIORITIES: 'shash_priorities',
  WEIGHT_LOG: 'shash_weight_log',
  FOOD_LOG: 'shash_food_log',
  UBER_LOG: 'shash_uber_log',
  DEBT_ACCOUNTS: 'shash_debt_accounts',
  GOALS: 'shash_goals',
  SETTINGS: 'shash_settings',
};

const DEFAULT_GOALS = {
  targetWeight: 158, startWeight: 210,
  weddingBudget: 3000, emergencyFundTarget: 8400,
};

const DEFAULT_SETTINGS = { name: 'G' };

const get = (key, fallback = null) => {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch { return fallback; }
};
const set = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

export const getDateKey = (d = new Date()) => d.toISOString().split('T')[0];
export const getWeekKey = (d = new Date()) => { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); return x.toISOString().split('T')[0]; };
export const getMonthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
export const getYearKey = (d = new Date()) => `${d.getFullYear()}`;

export const getPeriodKey = (freq) => {
  switch(freq) {
    case 'daily': return getDateKey();
    case 'weekly': return getWeekKey();
    case 'monthly': return getMonthKey();
    case 'yearly': return getYearKey();
    default: return 'once';
  }
};

// TODOS
export const getTodos = () => get(KEYS.TODOS, []);
export const saveTodos = (todos) => set(KEYS.TODOS, todos);
export const addTodo = (todo) => {
  const todos = getTodos();
  const t = { id: Date.now().toString(), title: todo.title, frequency: todo.frequency||'daily', category: todo.category||'general', completions: {}, createdAt: new Date().toISOString() };
  todos.push(t); saveTodos(todos); return todos;
};
export const toggleTodo = (id) => {
  const todos = getTodos();
  const t = todos.find(x => x.id === id);
  if (!t) return todos;
  if (!t.completions) t.completions = {};
  const key = getPeriodKey(t.frequency);
  t.completions[key] = !t.completions[key];
  saveTodos(todos); return todos;
};
export const isTodoComplete = (todo) => {
  if (!todo.completions) return false;
  return !!todo.completions[getPeriodKey(todo.frequency)];
};
export const deleteTodo = (id) => { saveTodos(getTodos().filter(t => t.id !== id)); };
export const updateTodo = (id, updates) => {
  const todos = getTodos();
  const idx = todos.findIndex(t => t.id === id);
  if (idx !== -1) todos[idx] = { ...todos[idx], ...updates };
  saveTodos(todos); return todos;
};

// PRIORITIES
export const getPriorities = () => {
  const all = get(KEYS.PRIORITIES, {});
  return all[getDateKey()] || ['', '', ''];
};
export const savePriorities = (items) => {
  const all = get(KEYS.PRIORITIES, {});
  all[getDateKey()] = items;
  set(KEYS.PRIORITIES, all);
};

// WEIGHT
export const getWeightLog = () => get(KEYS.WEIGHT_LOG, []);
export const addWeightEntry = (weight) => {
  const log = getWeightLog();
  const entry = { id: Date.now().toString(), date: getDateKey(), weight: parseFloat(weight) };
  const idx = log.findIndex(e => e.date === entry.date);
  if (idx !== -1) log[idx] = entry; else log.push(entry);
  log.sort((a,b) => a.date.localeCompare(b.date));
  set(KEYS.WEIGHT_LOG, log); return log;
};
export const deleteWeightEntry = (id) => { set(KEYS.WEIGHT_LOG, getWeightLog().filter(e => e.id !== id)); };

// FOOD
export const getTodayFood = () => { const log = get(KEYS.FOOD_LOG, []); return log.find(e => e.date === getDateKey()) || { outsideCount: 0, notes: '' }; };
export const saveFood = (entry) => {
  const log = get(KEYS.FOOD_LOG, []);
  const today = getDateKey();
  const idx = log.findIndex(e => e.date === today);
  const updated = { date: today, ...entry };
  if (idx !== -1) log[idx] = updated; else log.push(updated);
  set(KEYS.FOOD_LOG, log);
};

// UBER
export const getUberLog = () => get(KEYS.UBER_LOG, []);
export const addUberEntry = (entry) => {
  const log = getUberLog();
  log.unshift({ id: Date.now().toString(), date: getDateKey(), ...entry });
  set(KEYS.UBER_LOG, log); return log;
};
export const deleteUberEntry = (id) => { set(KEYS.UBER_LOG, getUberLog().filter(e => e.id !== id)); };

// DEBT
export const getDebtAccounts = () => get(KEYS.DEBT_ACCOUNTS, []);
export const saveDebtAccounts = (accounts) => set(KEYS.DEBT_ACCOUNTS, accounts);
export const addDebtAccount = (account) => {
  const accounts = getDebtAccounts();
  accounts.push({ id: Date.now().toString(), ...account, balance: parseFloat(account.balance), apr: parseFloat(account.apr), minimumPayment: parseFloat(account.minimumPayment||0), history: [{ date: getDateKey(), balance: parseFloat(account.balance) }], createdAt: new Date().toISOString() });
  saveDebtAccounts(accounts); return accounts;
};
export const updateDebtBalance = (id, balance) => {
  const accounts = getDebtAccounts();
  const idx = accounts.findIndex(a => a.id === id);
  if (idx !== -1) { accounts[idx].balance = parseFloat(balance); if (!accounts[idx].history) accounts[idx].history = []; accounts[idx].history.push({ date: getDateKey(), balance: parseFloat(balance) }); }
  saveDebtAccounts(accounts); return accounts;
};
export const deleteDebtAccount = (id) => { saveDebtAccounts(getDebtAccounts().filter(a => a.id !== id)); };

// GOALS & SETTINGS
export const getGoals = () => ({ ...DEFAULT_GOALS, ...get(KEYS.GOALS, {}) });
export const saveGoals = (g) => set(KEYS.GOALS, g);
export const getSettings = () => ({ ...DEFAULT_SETTINGS, ...get(KEYS.SETTINGS, {}) });
export const saveSettings = (s) => set(KEYS.SETTINGS, s);

// BACKUP
export const exportBackup = () => {
  const backup = {};
  Object.entries(KEYS).forEach(([k, sk]) => { backup[k] = get(sk); });
  backup.exportedAt = new Date().toISOString();
  backup.version = '1.0';
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `shash_backup_${getDateKey()}.json`; a.click();
  URL.revokeObjectURL(url);
};

export const importBackup = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target.result);
      Object.entries(KEYS).forEach(([k, sk]) => { if (backup[k] !== undefined) set(sk, backup[k]); });
      resolve(true);
    } catch { reject(false); }
  };
  reader.readAsText(file);
});
