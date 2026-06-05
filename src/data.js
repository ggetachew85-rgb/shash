export function keyFor(d){ return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
export function todayKey(){ return keyFor(new Date()); }
export function offsetKey(o){ const d=new Date(); d.setDate(d.getDate()+o); return keyFor(d); }
export function parseKey(k){ const p=k.split('-'); return new Date(+p[0], +p[1]-1, +p[2]); }
export function fmt(n){ return '$'+Math.round(n).toLocaleString(); }

export function dayLabel(o){
  if(o===0) return 'Today';
  if(o===-1) return 'Yesterday';
  if(o===1) return 'Tomorrow';
  const d=new Date(); d.setDate(d.getDate()+o);
  return d.toLocaleDateString(undefined,{weekday:'short', month:'short', day:'numeric'});
}
export function dayNumber(startKey, k){
  return Math.round((parseKey(k)-parseKey(startKey))/86400000)+1;
}

export const DAILY_HABITS=[
  {id:'phone', label:'Phone across the room last night'},
  {id:'wake',  label:'Up by 6:30 — no morning scroll'},
  {id:'study', label:'A+ study block (45 min)'},
  {id:'food',  label:'Veg or fruit with meals'},
  {id:'move',  label:'Moved / walked a bit'},
  {id:'sleep', label:'Lights out by 10:30'}
];

const SCHEDULE={
  1:['Put your phone charger across the room tonight','Set your 6:00 alarm'],
  2:['Wake 6:00 — no scroll','Post your PC repair ad (Marketplace + Nextdoor)'],
  3:['Do the free Twogether in Texas course (cheap marriage license)'],
  4:['Call a clinic — book a basic blood panel'],
  5:['Start Professor Messer A+ — Core 1, first section'],
  6:['A+ practice block','Uber a meal rush (lunch or dinner)'],
  7:['Plan next week','Reply to any repair leads'],
  8:['A+ section','Add a veg or fruit to every meal today'],
  9:['A+ section','Pick your 1–2 fast-food days for the week'],
  10:['A+ section','Do your first repair job (or chase the leads)'],
  11:['A+ section','Open a free GitHub, push your first CS50 work'],
  12:['A+ section'],
  13:['Deep work block (A+ / CS50)','Cash block: Uber + repair'],
  14:['Review your first 2 weeks — which boxes did you hit?']
};
const MILESTONES={ 42:['Aim to book your A+ Core 1 exam'], 70:['Push to take A+ Core 2 soon'], 90:['Lock your September wedding details'] };

export function planFor(startKey, k){
  const n=dayNumber(startKey, k);
  if(n<1) return [{text:'Before your start date.', note:true}];
  if(SCHEDULE[n]) return SCHEDULE[n].map(t=>({text:t}));
  let out=[];
  if(MILESTONES[n]) out=out.concat(MILESTONES[n].map(t=>({text:t})));
  const wd=parseKey(k).getDay();
  if(wd===0) out.push({text:'Weekly review: check your numbers', recurring:true},{text:'Export a backup (gear → Backup)', recurring:true});
  if(wd===6) out.push({text:'Cash block: Uber meal rushes + repair jobs', recurring:true});
  if(out.length===0) out.push({text:'No set task — protect your habits and push your #1 lever (A+ or a repair job).', note:true});
  return out;
}

export const CARDS=[
  {id:1,name:'H Slate',bal:252.17,apr:18.49},
  {id:2,name:'G Free',bal:490.24,apr:27.24},
  {id:3,name:'G Small LIF',bal:1295.50,apr:27.24},
  {id:4,name:'H Apple',bal:1857.07,apr:25.49},
  {id:5,name:'G Apple',bal:2987.47,apr:27.24},
  {id:6,name:'H Freedom Unlimited',bal:3198.42,apr:25.74},
  {id:7,name:'H Freedom',bal:3924.35,apr:18.49},
  {id:8,name:'G Slate',bal:5832.71,apr:27.24},
  {id:9,name:'G Big LF',bal:9082.52,apr:27.24}
];
export const CARD_TOTAL=CARDS.reduce((s,c)=>s+c.bal,0);

export const CERTS=[
  {id:'aplus',label:'CompTIA A+ — the on-ramp'},
  {id:'net',  label:'Network+ — sysadmin doors'},
  {id:'sec',  label:'Security+ — gov/contractor pay'},
  {id:'cloud',label:'Cloud (AWS/Azure) — the big money'}
];
export const APLUS_MILES=[
  {id:'c1s',label:'Core 1 — studied'},
  {id:'c1p',label:'Core 1 — PASSED'},
  {id:'c2s',label:'Core 2 — studied'},
  {id:'c2p',label:'Core 2 — PASSED (A+ done!)'}
];
export const DEV=[
  {id:'cs50', label:'Finish CS50'},
  {id:'p1',   label:'Build AI project #1 (public on GitHub)'},
  {id:'p2',   label:'Build AI project #2'},
  {id:'live', label:'Portfolio live — pivot-ready'}
];
export const APLUS_GOAL_HOURS=60;

export const FUNDS=[
  {id:'wedding',   label:'Wedding',        goal:2400,  color:'amber', note:'September'},
  {id:'car',       label:'Car fund',       goal:3000,  color:'blue',  note:'Repair the 250K or her next car'},
  {id:'emergency', label:'Emergency fund', goal:2761,  color:'sage',  note:'First target: 1 month'},
  {id:'house',     label:'House down payment', goal:10000, color:'coral', note:'The big lot'}
];

export const ROADMAP=[
  {tag:'Now → Mo 2', t:'1 · Stabilize', d:'Lock sleep + no scroll, see a doctor, start PC repair + weekend Uber. Cards at minimums.'},
  {tag:'Mo 1 → 3',   t:'2 · Certify',   d:'Earn A+ (free study). Rewrite your resume around the IT you already do.'},
  {tag:'Mo 3 → 12',  t:'3 · The Leap',  d:'Land an IT job (~$45–55K). Climb Network+ → Security+ → Cloud. Fiancée passes NCLEX.'},
  {tag:'Income jumps',t:'4 · Demolish debt', d:'Throw the whole raise at cards (smallest first), then loans.'},
  {tag:'Year 2+',    t:'5 · Build wealth', d:'Emergency fund, her car, an AI side income, then the house with the big lot.'}
];

export function keyBefore(a,b){ return parseKey(a) < parseKey(b); }
export function fmtDay(k){ const t=todayKey(); if(k===t) return 'today'; const d=parseKey(k); return d.toLocaleDateString(undefined,{month:'short',day:'numeric'}); }
