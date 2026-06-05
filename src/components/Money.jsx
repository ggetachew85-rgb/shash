import { useState } from 'react'
import { useStore } from '../store.jsx'
import { Card, Pill, Bar, CheckRow } from './ui.jsx'
import { CARDS, CARD_TOTAL, fmt } from '../data'

export default function Money(){
  const { data, update } = useStore()
  const [open,setOpen]=useState(null)
  const [pay,setPay]=useState('')
  const [cash,setCash]=useState(''); const [src,setSrc]=useState('Repair')

  const paidTotal=CARDS.reduce((s,c)=>s+Math.min(data.debtPaid[c.id]||0,c.bal),0)
  let next=null
  const rows=CARDS.map(c=>{ const paid=data.debtPaid[c.id]||0; const rem=Math.max(c.bal-paid,0); const done=rem<=0.005; if(!done&&!next)next=c; return {c,rem,done,paid} })

  const logPay=(id)=>{ const v=parseFloat(pay); if(v>0){ update(d=>{ d.debtPaid[id]=(d.debtPaid[id]||0)+v }); setPay(''); setOpen(null) } }
  const resetCard=(id)=>update(d=>{ d.debtPaid[id]=0 })

  const incomeWk=(()=>{ const cut=Date.now()-7*864e5; return (data.income||[]).filter(e=>e.ts>=cut).reduce((s,e)=>s+e.amt,0) })()
  const incomeAll=(data.income||[]).reduce((s,e)=>s+e.amt,0)
  const logCash=()=>{ const v=parseFloat(cash); if(v>0){ update(d=>{ d.income.unshift({amt:v,src,date:new Date().toLocaleDateString(),ts:Date.now()}) }); setCash('') } }
  const delCash=(i)=>update(d=>{ d.income.splice(i,1) })

  const surplus=data.budget.income-data.budget.expenses

  return (
    <div className="scroll">
      <Card accent="sage" title="This month" right={<Pill color={surplus>=0?'':'coral'}>{(surplus>=0?'+':'')+fmt(surplus)}</Pill>}>
        <div className="field" style={{marginBottom:8}}>
          <div className="grow"><span className="lbl">Income / mo</span>
            <input className="inp" type="number" inputMode="decimal" value={data.budget.income}
              onChange={e=>update(d=>{ d.budget.income=parseFloat(e.target.value)||0 })}/></div>
          <div className="grow"><span className="lbl">Expenses / mo</span>
            <input className="inp" type="number" inputMode="decimal" value={data.budget.expenses}
              onChange={e=>update(d=>{ d.budget.expenses=parseFloat(e.target.value)||0 })}/></div>
        </div>
        <p className="stat">{surplus>=0
          ? <>You keep <b>{fmt(surplus)}</b>/mo — every dollar of it is a weapon.</>
          : <>You're <b>{fmt(-surplus)}</b>/mo in the red. Income has to rise.</>}</p>
      </Card>

      <Card accent="sage" title="Debt snowball" right={<Pill>{rows.filter(r=>r.done).length} / 9 cleared</Pill>}>
        <Bar pct={paidTotal/CARD_TOTAL*100}/>
        <p className="stat">Remaining <b>{fmt(CARD_TOTAL-paidTotal)}</b> of {fmt(CARD_TOTAL)} ({Math.round(paidTotal/CARD_TOTAL*100)}% gone)</p>
        {rows.map(({c,rem,done,paid})=>(
          <div key={c.id}>
            <div className={'crow'+(done?' on':'')} onClick={()=>setOpen(open===c.id?null:c.id)}>
              <div className="cbox" style={{borderRadius:'50%',width:11,height:11,padding:0,background:done?'var(--sage)':'#D5D2C8',border:'none'}}/>
              <div className="ctext">{c.name} <span style={{color:'var(--faint)',fontSize:12}}>· {c.apr}%</span></div>
              <div className="ctail">{fmt(rem)}</div>
            </div>
            {open===c.id && !done && (
              <div className="field" style={{padding:'2px 6px 12px'}}>
                <input className="inp" style={{width:120}} type="number" inputMode="decimal" placeholder="$ paid" value={pay} onChange={e=>setPay(e.target.value)}/>
                <button className="btn" onClick={()=>logPay(c.id)}>Log payment</button>
                {paid>0 && <button className="btn ghost" onClick={()=>resetCard(c.id)}>Reset</button>}
              </div>
            )}
          </div>
        ))}
        <p className="note">{next?('Next target: '+next.name+' — '+fmt(Math.max(next.bal-(data.debtPaid[next.id]||0),0))+' left'):'Every card cleared. You did it.'}</p>
      </Card>

      <Card accent="sage" title="Cash earned" right={<Pill>{fmt(incomeWk)} / wk</Pill>}>
        <p className="stat">All-time: <b>{fmt(incomeAll)}</b></p>
        <div className="field">
          <div className="grow"><input className="inp" type="number" inputMode="decimal" placeholder="$ amount" value={cash} onChange={e=>setCash(e.target.value)}/></div>
          <select className="inp" value={src} onChange={e=>setSrc(e.target.value)}><option>Repair</option><option>Uber</option><option>Other</option></select>
          <button className="btn" onClick={logCash}>Log</button>
        </div>
        {(data.income||[]).slice(0,5).map((e,i)=>(
          <div className="entry" key={i}><span>{fmt(e.amt)} · {e.src}</span><span style={{color:'var(--faint)'}}>{e.date}</span><span className="x" onClick={()=>delCash(i)}>×</span></div>
        ))}
      </Card>
    </div>
  )
}
