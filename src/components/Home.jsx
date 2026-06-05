import { useState } from 'react'
import { useStore } from '../store.jsx'
import { Card, Pill, CheckRow } from './ui.jsx'
import { DAILY_HABITS, planFor, offsetKey, dayLabel, fmt, fmtDay, keyBefore,
         CARDS, CARD_TOTAL, APLUS_GOAL_HOURS } from '../data'

export default function Home(){
  const { data, update } = useStore()
  const [off,setOff]=useState(0)
  const [txt,setTxt]=useState('')
  const tk=offsetKey(off)
  const todayK=offsetKey(0)
  const day=data.days[tk]||{}
  const viewingToday=(off===0)
  const isPast=keyBefore(tk, todayK)

  // ---- mutations (completion is always stamped with the REAL current date) ----
  const togglePlan=(i)=>update(d=>{ const x=d.days[tk]||(d.days[tk]={}); const p=x.plan||(x.plan={}); p[i]= p[i] ? null : todayK })
  const toggleHabit=(id)=>update(d=>{ const x=d.days[tk]||(d.days[tk]={}); const h=x.habits||(x.habits={}); h[id]=!h[id] })
  const addTask=(text)=>update(d=>{ const x=d.days[tk]||(d.days[tk]={}); const c=x.custom||(x.custom=[]); c.push({id:Date.now(),text,doneOn:null}) })
  const delTask=(id)=>update(d=>{ const x=d.days[tk]; if(x&&x.custom)x.custom=x.custom.filter(t=>t.id!==id) })
  const toggleTaskOn=(dk,id)=>update(d=>{ const c=(d.days[dk]&&d.days[dk].custom)||[]; const t=c.find(t=>t.id===id); if(t)t.doneOn= t.doneOn ? null : todayK })
  const togglePlanOn=(dk,i)=>update(d=>{ const x=d.days[dk]||(d.days[dk]={}); const p=x.plan||(x.plan={}); p[i]= p[i] ? null : todayK })

  // ---- streak (habits only) ----
  const allHabits=(o)=>{ const h=(o&&o.habits)||{}; return DAILY_HABITS.every(it=>h[it.id]) }
  const streak=(()=>{ let n=0,start=0; if(!allHabits(data.days[todayK]))start=1
    for(let i=start;i<400;i++){ if(allHabits(data.days[offsetKey(-i)]))n++; else break } return n })()

  // ---- overdue scan (only shown on the real current day) ----
  const overdue=[]
  if(viewingToday){
    for(let i=1;i<=140;i++){
      const dk=offsetKey(-i)
      if(keyBefore(dk, data.startDate)) break
      planFor(data.startDate, dk).forEach((it,idx)=>{
        if(it.note||it.recurring) return
        const dd=data.days[dk]
        const doneVal=dd&&dd.plan&&dd.plan[idx]
        if(!doneVal) overdue.push({kind:'plan', dk, idx, text:it.text})
      })
      const cust=(data.days[dk]&&data.days[dk].custom)||[]
      cust.forEach(t=>{ if(!t.doneOn && !t.done) overdue.push({kind:'custom', dk, id:t.id, text:t.text}) })
    }
  }

  // ---- snapshot ----
  const paid=CARDS.reduce((s,c)=>s+Math.min(data.debtPaid[c.id]||0,c.bal),0)
  const debtLeft=CARD_TOTAL-paid
  const aplusPct=Math.round(Math.min(data.career.aplusHours/APLUS_GOAL_HOURS,1)*100)
  const wed=(data.funds.wedding||[]).reduce((s,e)=>s+e.amt,0)

  const plan=planFor(data.startDate, tk)
  const habits=day.habits||{}
  const custom=day.custom||[]

  // row with done/missed/date tag (for plan + custom on the viewed day)
  const StatusRow=({label, doneVal, onToggle, onDelete})=>{
    const done=!!doneVal
    const dateText=(typeof doneVal==='string') ? doneVal : null
    const missed=!done && isPast
    let tag=null
    if(done) tag=<span className="tag done">{dateText?('✓ '+fmtDay(dateText)):'✓'}</span>
    else if(missed) tag=<span className="tag miss">missed</span>
    return (
      <div className={'crow'+(done?' on':'')} onClick={onToggle}>
        <div className="cbox">{done?'✓':''}</div>
        <div className="ctext">{label}</div>
        {tag}
        {onDelete && <div className="del" onClick={(e)=>{e.stopPropagation(); onDelete()}}>×</div>}
      </div>
    )
  }

  return (
    <div className="scroll">
      <div className="snap">
        <div className="chip"><div className="k">DEBT LEFT</div><div className="v">{fmt(debtLeft)}</div></div>
        <div className="chip"><div className="k">STREAK</div><div className="v">{streak} <small>{streak===1?'day':'days'}</small></div></div>
        <div className="chip"><div className="k">A+ PROGRESS</div><div className="v">{aplusPct}<small>%</small></div></div>
        <div className="chip"><div className="k">WEDDING FUND</div><div className="v">{fmt(wed)}</div></div>
      </div>

      {viewingToday && overdue.length>0 && (
        <Card accent="coral" title="Overdue" right={<Pill color="coral">{overdue.length}</Pill>}>
          {overdue.map((o,n)=>(
            <div className="crow" key={o.kind+o.dk+(o.idx??o.id)+n}
                 onClick={()=> o.kind==='plan' ? togglePlanOn(o.dk,o.idx) : toggleTaskOn(o.dk,o.id)}>
              <div className="cbox"></div>
              <div className="ctext">{o.text}</div>
              <span className="tag from">{fmtDay(o.dk)}</span>
            </div>
          ))}
          <p className="note">From earlier days. Check one off and it stamps today as the date you did it.</p>
        </Card>
      )}

      <Card accent="sage" title={'Plan — '+dayLabel(off)} right={
        <div className="daynav" style={{margin:0}}>
          <button onClick={()=>setOff(o=>Math.max(o-1,-140))}>‹</button>
          <button onClick={()=>setOff(o=>Math.min(o+1,30))}>›</button>
        </div>
      }>
        {plan.map((p,i)=> p.note
          ? <p className="stat" key={i} style={{color:'var(--faint)'}}>{p.text}</p>
          : <StatusRow key={i} label={p.text} doneVal={day.plan&&day.plan[i]} onToggle={()=>togglePlan(i)} />
        )}
      </Card>

      <Card title="Daily habits" right={<Pill color="amber">{streak} day streak</Pill>}>
        {DAILY_HABITS.map(h=>(
          <CheckRow key={h.id} label={h.label} done={!!habits[h.id]} onClick={()=>toggleHabit(h.id)} />
        ))}
        <p className="note">{allHabits(day)?'All 6 done — streak protected.':'Check all 6 to grow the streak.'}</p>
      </Card>

      <Card title="My tasks" sub="Anything you add for this day">
        {custom.length===0 && <p className="stat" style={{color:'var(--faint)'}}>Nothing added yet.</p>}
        {custom.map(t=>(
          <StatusRow key={t.id} label={t.text} doneVal={t.doneOn || (t.done ? true : null)}
            onToggle={()=>toggleTaskOn(tk,t.id)} onDelete={()=>delTask(t.id)} />
        ))}
        <div className="field" style={{marginTop:8}}>
          <div className="grow"><input className="inp" placeholder="Add a task…" value={txt}
            onChange={e=>setTxt(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&txt.trim()){ addTask(txt.trim()); setTxt('') } }}/></div>
          <button className="btn" onClick={()=>{ if(txt.trim()){ addTask(txt.trim()); setTxt('') } }}>Add</button>
        </div>
      </Card>
    </div>
  )
}
