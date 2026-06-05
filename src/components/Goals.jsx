import { useState } from 'react'
import { useStore } from '../store.jsx'
import { Card, Pill, Bar } from './ui.jsx'
import { FUNDS, ROADMAP, fmt } from '../data'

function Fund({ f }){
  const { data, update } = useStore()
  const [v,setV]=useState('')
  const list=data.funds[f.id]||[]
  const saved=list.reduce((s,e)=>s+e.amt,0)
  const add=()=>{ const n=parseFloat(v); if(n>0){ update(d=>{ d.funds[f.id].unshift({amt:n,date:new Date().toLocaleDateString(),ts:Date.now()}) }); setV('') } }
  const del=(i)=>update(d=>{ d.funds[f.id].splice(i,1) })
  return (
    <Card accent={f.color} title={f.label} sub={f.note} right={<Pill color={f.color==='sage'?'':f.color}>{fmt(saved)}</Pill>}>
      <Bar pct={saved/f.goal*100} color={f.color==='sage'?'':f.color}/>
      <p className="stat">{saved>=f.goal? <>Goal hit — <b>{fmt(saved)}</b>.</> : <>Saved <b>{fmt(saved)}</b> of {fmt(f.goal)} · {fmt(f.goal-saved)} to go</>}</p>
      <div className="field">
        <div className="grow"><input className="inp" type="number" inputMode="decimal" placeholder="$ added" value={v} onChange={e=>setV(e.target.value)}/></div>
        <button className={'btn'+(f.color==='sage'?'':' '+f.color)} onClick={add}>Add</button>
      </div>
      {list.slice(0,4).map((e,i)=>(
        <div className="entry" key={i}><span>{fmt(e.amt)}</span><span style={{color:'var(--faint)'}}>{e.date}</span><span className="x" onClick={()=>del(i)}>×</span></div>
      ))}
    </Card>
  )
}

export default function Goals(){
  return (
    <div className="scroll">
      <div className="seclab">Savings goals</div>
      {FUNDS.map(f=> <Fund key={f.id} f={f}/>)}

      <div className="seclab" style={{marginTop:10}}>The road to Point Z</div>
      <Card accent="amber">
        {ROADMAP.map((p,i)=>(
          <div key={i} style={{padding:'11px 2px',borderTop:i?'1px solid var(--line2)':'none'}}>
            <Pill color="amber">{p.tag}</Pill>
            <div style={{fontWeight:700,fontSize:14.5,margin:'6px 0 2px'}}>{p.t}</div>
            <div style={{fontSize:13,color:'var(--muted)'}}>{p.d}</div>
          </div>
        ))}
      </Card>
    </div>
  )
}
