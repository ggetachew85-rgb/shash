import { useState } from 'react'
import { useStore } from '../store.jsx'
import { Card, Pill } from './ui.jsx'

export default function Health(){
  const { data, update } = useStore()
  const [w,setW]=useState('')
  const weights=data.weights||[]
  const logW=()=>{ const v=parseFloat(w); if(v>0){ update(d=>{ d.weights.unshift({lbs:v,date:new Date().toLocaleDateString(),ts:Date.now()}) }); setW('') } }
  const delW=(i)=>update(d=>{ d.weights.splice(i,1) })

  const sorted=[...weights].sort((a,b)=>a.ts-b.ts)
  const latest=sorted.length?sorted[sorted.length-1].lbs:null
  const first=sorted.length?sorted[0].lbs:null
  const lost=(first!=null&&latest!=null)?(first-latest):0

  // sparkline
  let spark=null
  if(sorted.length>=2){
    const vals=sorted.map(s=>s.lbs)
    const min=Math.min(...vals), max=Math.max(...vals), span=(max-min)||1
    const W=320, H=54, pad=4
    const pts=vals.map((v,i)=>{
      const x=pad+(i/(vals.length-1))*(W-2*pad)
      const y=pad+(1-(v-min)/span)*(H-2*pad)
      return x.toFixed(1)+','+y.toFixed(1)
    }).join(' ')
    spark=<svg className="spark" viewBox={'0 0 '+W+' '+H} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  }

  return (
    <div className="scroll">
      <Card accent="coral" title="Weight" right={latest!=null?<Pill color="coral">{latest} lbs</Pill>:null}>
        {latest==null && <p className="stat" style={{color:'var(--faint)'}}>Log your first weigh-in (same time each morning).</p>}
        {spark}
        {latest!=null && <p className="stat">{lost>0
          ? <>Down <b>{lost.toFixed(1)} lbs</b> since you started. Goal: 50–70 total.</>
          : <>Tracking from <b>{latest} lbs</b>. The trend is what matters, not the day.</>}</p>}
        <div className="field">
          <div className="grow"><input className="inp" type="number" inputMode="decimal" placeholder="today's weight (lbs)" value={w} onChange={e=>setW(e.target.value)}/></div>
          <button className="btn coral" onClick={logW}>Log</button>
        </div>
        {weights.slice(0,6).map((e,i)=>(
          <div className="entry" key={i}><span>{e.lbs} lbs</span><span style={{color:'var(--faint)'}}>{e.date}</span><span className="x" onClick={()=>delW(i)}>×</span></div>
        ))}
      </Card>

      <Card accent="coral" title="Daily fuel" sub="Tracked on your Home tab, every day">
        <p className="stat">Your energy is the master key. The three levers, checked daily on Home:</p>
        <p className="stat">• <b>Sleep</b> — same time, lights out by 10:30<br/>• <b>Food</b> — a veg or fruit with meals, fast food only 1–2 set days<br/>• <b>Move</b> — a short walk most days</p>
        <p className="note">When you booked the blood panel (Plan, Day 4), log the date as a task. Waking tired after a full night is worth a doctor's look.</p>
      </Card>
    </div>
  )
}
