import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { todayKey } from './data'

const KEY='shash_v2'
function makeDefault(){
  return {
    startDate: todayKey(),
    days:{},
    budget:{ income:2800, expenses:2761 },
    debtPaid:{},
    income:[],
    weights:[],
    career:{ aplusHours:0, certs:{}, dev:{}, miles:{} },
    funds:{ wedding:[], car:[], emergency:[], house:[] }
  }
}
function loadInit(){
  try{
    const v=localStorage.getItem(KEY)
    if(v){ return { ...makeDefault(), ...JSON.parse(v) } }
  }catch(e){}
  return makeDefault()
}

const Ctx=createContext(null)

export function StoreProvider({ children }){
  const [data,setData]=useState(loadInit)
  useEffect(()=>{ try{ localStorage.setItem(KEY, JSON.stringify(data)) }catch(e){} },[data])

  const update=useCallback((fn)=>{
    setData(prev=>{ const next=JSON.parse(JSON.stringify(prev)); fn(next); return next })
  },[])
  const replaceAll=useCallback((obj)=>{ setData({ ...makeDefault(), ...obj }) },[])

  return <Ctx.Provider value={{ data, update, replaceAll }}>{children}</Ctx.Provider>
}
export function useStore(){ return useContext(Ctx) }
