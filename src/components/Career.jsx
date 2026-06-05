import { useState } from 'react'
import { useStore } from '../store.jsx'
import { Card, Pill, Bar, CheckRow } from './ui.jsx'
import { CERTS, APLUS_MILES, DEV, APLUS_GOAL_HOURS } from '../data'

export default function Career(){
  const { data, update } = useStore()
  const [hrs,setHrs]=useState('')
  const c=data.career
  const logHrs=()=>{ const v=parseFloat(hrs); if(v>0){ update(d=>{ d.career.aplusHours+=v }); setHrs('') } }
  const pct=Math.min(c.aplusHours/APLUS_GOAL_HOURS,1)*100
  const certN=CERTS.filter(x=>c.certs[x.id]).length
  const devN=DEV.filter(x=>c.dev[x.id]).length

  return (
    <div className="scroll">
      <Card accent="blue" title="A+ study" right={<Pill color="blue">{Math.round(c.aplusHours*10)/10} hrs</Pill>}>
        <Bar pct={pct} color="blue"/>
        <p className="stat"><b>{Math.round(c.aplusHours*10)/10}</b> of ~{APLUS_GOAL_HOURS} hrs to A+ ({Math.round(pct)}%)</p>
        <div className="field" style={{marginBottom:6}}>
          <div className="grow"><input className="inp" type="number" inputMode="decimal" placeholder="hours studied" value={hrs} onChange={e=>setHrs(e.target.value)}/></div>
          <button className="btn blue" onClick={logHrs}>Log hours</button>
        </div>
        {APLUS_MILES.map(m=>(
          <CheckRow key={m.id} color="blue" label={m.label} done={!!c.miles[m.id]} onClick={()=>update(d=>{ d.career.miles[m.id]=!d.career.miles[m.id] })}/>
        ))}
        <p className="note">Free study: Professor Messer A+ on YouTube — one section each morning.</p>
      </Card>

      <Card accent="blue" title="Cert ladder" right={<Pill color="blue">{certN} / 4</Pill>}>
        <Bar pct={certN/4*100} color="blue"/>
        {CERTS.map(x=>(
          <CheckRow key={x.id} color="blue" label={x.label} done={!!c.certs[x.id]} onClick={()=>update(d=>{ d.career.certs[x.id]=!d.career.certs[x.id] })}/>
        ))}
        <p className="note">Each rung = more pay. IT first, fast money.</p>
      </Card>

      <Card accent="blue" title="Dev / AI — on the side" right={<Pill color="blue">{devN} / 4</Pill>}>
        <Bar pct={devN/4*100} color="blue"/>
        {DEV.map(x=>(
          <CheckRow key={x.id} color="blue" label={x.label} done={!!c.dev[x.id]} onClick={()=>update(d=>{ d.career.dev[x.id]=!d.career.dev[x.id] })}/>
        ))}
        <p className="note">Your higher ceiling. Weekend hours, after A+ is passed.</p>
      </Card>
    </div>
  )
}
