export function Card({ title, sub, right, accent, children }){
  return (
    <div className={'card'+(accent?' accent':'')} style={accent?{borderTopColor:'var(--'+accent+')'}:null}>
      {(title||right) && (
        <div className="card-h">
          <div>
            <h2>{title}</h2>
            {sub && <div className="sub">{sub}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}
export function Pill({ children, color }){
  return <span className={'pill'+(color?' '+color:'')}>{children}</span>
}
export function Bar({ pct, color }){
  return <div className={'bar'+(color?' '+color:'')}><span style={{width:Math.max(0,Math.min(100,pct))+'%'}}/></div>
}
export function CheckRow({ label, done, onClick, color, tail }){
  return (
    <div className={'crow'+(done?' on':'')+(color?' '+color:'')} onClick={onClick}>
      <div className="cbox">{done?'✓':''}</div>
      <div className="ctext">{label}</div>
      {tail!=null && <div className="ctail">{tail}</div>}
    </div>
  )
}
