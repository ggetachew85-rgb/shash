import { useState } from 'react'
import Home from './components/Home.jsx'
import Money from './components/Money.jsx'
import Health from './components/Health.jsx'
import Career from './components/Career.jsx'
import Goals from './components/Goals.jsx'
import DataTab from './components/DataTab.jsx'

const TABS=[
  {id:'home',   label:'Home',   ic:'◎'},
  {id:'money',  label:'Money',  ic:'$'},
  {id:'health', label:'Health', ic:'♥'},
  {id:'career', label:'Career', ic:'▲'},
  {id:'goals',  label:'Goals',  ic:'◆'}
]

export default function App(){
  const [tab,setTab]=useState('home')
  const [settings,setSettings]=useState(false)
  const today=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">Shash<span className="dot">.</span></div>
        <button className="gear" onClick={()=>setSettings(s=>!s)}>{settings?'×':'⚙'}</button>
      </div>
      {!settings && <div className="daterow">{today}</div>}

      {settings ? <DataTab onClose={()=>setSettings(false)}/> : (
        <>
          {tab==='home'   && <Home/>}
          {tab==='money'  && <Money/>}
          {tab==='health' && <Health/>}
          {tab==='career' && <Career/>}
          {tab==='goals'  && <Goals/>}
        </>
      )}

      {!settings && (
        <div className="nav">
          {TABS.map(t=>(
            <button key={t.id} className={tab===t.id?'on':''} onClick={()=>setTab(t.id)}>
              <span className="ic">{t.ic}</span>{t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
