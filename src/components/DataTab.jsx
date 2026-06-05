import { useRef, useState } from 'react'
import { useStore } from '../store.jsx'
import { Card } from './ui.jsx'
import { todayKey } from '../data'

export default function DataTab({ onClose }){
  const { data, replaceAll } = useStore()
  const fileRef=useRef(null)
  const [msg,setMsg]=useState('')

  const doExport=()=>{
    try{
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
      const url=URL.createObjectURL(blob)
      const a=document.createElement('a'); a.href=url; a.download='shash-backup-'+todayKey()+'.json'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setTimeout(()=>URL.revokeObjectURL(url),1500)
      setMsg('Backup file created — save it somewhere safe.')
    }catch(e){ setMsg('Could not create the file on this browser.') }
  }
  const onFile=(e)=>{
    const f=e.target.files[0]; if(!f) return
    const r=new FileReader()
    r.onload=()=>{ try{ const obj=JSON.parse(r.result); replaceAll(obj); setMsg('Restored from backup.') }catch(err){ setMsg('That file could not be read.') } }
    r.readAsText(f); e.target.value=''
  }

  return (
    <div className="scroll">
      <Card accent="sage" title="Backup & restore">
        <p className="stat">Your data lives on this phone only. Back it up to a file so a wiped browser never erases your progress.</p>
        <button className="btn block" onClick={doExport}>Export backup (save file)</button>
        <div style={{height:10}}/>
        <button className="btn ghost block" onClick={()=>fileRef.current && fileRef.current.click()}>Restore from a backup file</button>
        <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={onFile}/>
        <p className="center-msg" style={{color:'var(--sage)'}}>{msg}</p>
        <p className="note">Tip: export every Sunday. Restore replaces what's currently in the app.</p>
      </Card>

      <Card title="About">
        <p className="stat">Shash v2 — your life command center. Built React + Vite, deployed on Vercel, data saved on your device.</p>
        <button className="btn ghost block" onClick={onClose}>Back</button>
      </Card>
    </div>
  )
}
