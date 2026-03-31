import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "wedding-planner-v6";
const FONT = "'MaruBuri', 'Nanum Myeongjo', Georgia, serif";

/* ── watercolor SVGs ── */
function FlowerYellow({style}) {
  return (
    <svg viewBox="0 0 120 120" style={{position:"absolute",opacity:0.18,pointerEvents:"none",...style}} xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="fy"><feGaussianBlur stdDeviation="2"/></filter></defs>
      <g filter="url(#fy)">
        <ellipse cx="60" cy="35" rx="22" ry="28" fill="#FDD835" transform="rotate(0 60 60)"/>
        <ellipse cx="60" cy="35" rx="22" ry="28" fill="#FFEE58" transform="rotate(72 60 60)"/>
        <ellipse cx="60" cy="35" rx="22" ry="28" fill="#FFF176" transform="rotate(144 60 60)"/>
        <ellipse cx="60" cy="35" rx="22" ry="28" fill="#FDD835" transform="rotate(216 60 60)"/>
        <ellipse cx="60" cy="35" rx="22" ry="28" fill="#FFEE58" transform="rotate(288 60 60)"/>
        <circle cx="60" cy="60" r="12" fill="#FFB300"/>
      </g>
    </svg>
  );
}
function FlowerGreen({style}) {
  return (
    <svg viewBox="0 0 100 60" style={{position:"absolute",opacity:0.15,pointerEvents:"none",...style}} xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="fg"><feGaussianBlur stdDeviation="1.5"/></filter></defs>
      <g filter="url(#fg)">
        <path d="M50 55 Q30 30 15 40 Q0 50 20 55Z" fill="#81C784"/>
        <path d="M50 55 Q70 30 85 40 Q100 50 80 55Z" fill="#A5D6A7"/>
        <path d="M50 55 Q40 15 50 5 Q60 15 50 55Z" fill="#66BB6A"/>
      </g>
    </svg>
  );
}
function FlowerPink({style}) {
  return (
    <svg viewBox="0 0 90 90" style={{position:"absolute",opacity:0.12,pointerEvents:"none",...style}} xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="fp"><feGaussianBlur stdDeviation="2"/></filter></defs>
      <g filter="url(#fp)">
        <ellipse cx="45" cy="25" rx="16" ry="22" fill="#F8BBD0" transform="rotate(0 45 45)"/>
        <ellipse cx="45" cy="25" rx="16" ry="22" fill="#F48FB1" transform="rotate(60 45 45)"/>
        <ellipse cx="45" cy="25" rx="16" ry="22" fill="#F8BBD0" transform="rotate(120 45 45)"/>
        <ellipse cx="45" cy="25" rx="16" ry="22" fill="#F48FB1" transform="rotate(180 45 45)"/>
        <ellipse cx="45" cy="25" rx="16" ry="22" fill="#F8BBD0" transform="rotate(240 45 45)"/>
        <ellipse cx="45" cy="25" rx="16" ry="22" fill="#F48FB1" transform="rotate(300 45 45)"/>
        <circle cx="45" cy="45" r="8" fill="#FFE0B2"/>
      </g>
    </svg>
  );
}

/* ── localStorage helper ── */
const storage = {
  get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  },
};

/* ── data ── */
const CHECKLIST_TEMPLATE = [
  { period:"2026-02/2026-04", label:"준비 시작", emoji:"🌱", items:[
    {id:"s01",text:"플래너 결정",category:"planner",done:false},
    {id:"s02",text:"웨딩홀 투어 후 웨딩홀 결정",category:"venue",done:false},
    {id:"s03",text:"스튜디오 예약",category:"photo",done:false},
    {id:"s04",text:"드레스샵 결정",category:"dress",done:false},
    {id:"s05",text:"혼주 메이크업 예약",category:"makeup",done:false},
    {id:"s06",text:"본식 스냅/DVD 결정",category:"photo",done:false,note:"웨딩홀 연계 여부 확인"},
    {id:"s07",text:"허니문 예약",category:"honeymoon",done:false},
    {id:"s08",text:"결혼반지(예물) 준비",category:"shopping",done:false},
    {id:"s09",text:"예복(신랑 턱시도) 알아보기",category:"shopping",done:false},
  ]},
  { period:"2026-04/2026-05", label:"드레스투어 & 혼수", emoji:"👗", items:[
    {id:"d01",text:"드레스투어 후 샵 결정",category:"dress",done:false,note:"샵당 1시간/4벌 피팅, 5.5만원/샵"},
    {id:"d02",text:"촬영 전 혼수품목 준비 시작",category:"shopping",done:false},
    {id:"d03",text:"예복 가봉 진행",category:"shopping",done:false},
    {id:"d04",text:"예물 디자인 셀렉 후 제작 시작",category:"shopping",done:false},
    {id:"d05",text:"한복 대여 셀렉 / 맞춤 시 가봉",category:"shopping",done:false},
  ]},
  { period:"2026-06/2026-07", label:"촬영 준비", emoji:"📸", items:[
    {id:"p01",text:"촬영드레스 셀렉 (촬영가봉)",category:"dress",done:false,note:"5~6벌 중 3~4벌, 1~1.5시간"},
    {id:"p02",text:"촬영 준비 (소품, 컨셉)",category:"photo",done:false},
    {id:"p03",text:"촬영부케 생화부케 예약",category:"flower",done:false},
    {id:"p04",text:"신랑 예복 디자인 고르기",category:"shopping",done:false},
  ]},
  { period:"2026-09/2026-10", label:"스튜디오 촬영", emoji:"💛", items:[
    {id:"ph01",text:"스튜디오 웨딩 촬영",category:"photo",done:false,note:"4~4.5시간, 20p앨범+20R액자+데이터"},
    {id:"ph02",text:"헬퍼이모님 예약 확인",category:"photo",done:false,note:"1회 25만원, 출장비 별도"},
  ]},
  { period:"2026-11/2026-12", label:"셀렉 & 청첩장", emoji:"🖼️", items:[
    {id:"sl01",text:"앨범/액자 사진 셀렉",category:"photo",done:false,note:"2~3시간, 페이지추가 3.3만원"},
    {id:"sl02",text:"모바일 청첩장 준비",category:"etc",done:false},
  ]},
  { period:"2026-11/2027-01", label:"막바지 준비", emoji:"🏡", items:[
    {id:"f01",text:"신혼집 구하기",category:"etc",done:false},
    {id:"f02",text:"가전·가구 준비",category:"shopping",done:false},
    {id:"f03",text:"주례 / 사회 / 축가 정하기",category:"ceremony",done:false},
    {id:"f04",text:"접수대 봐주시는 분 섭외",category:"ceremony",done:false},
    {id:"f05",text:"폐백 진행 여부 결정",category:"ceremony",done:false},
    {id:"f06",text:"2부 의상 준비",category:"dress",done:false},
    {id:"f07",text:"혼주 정장 / 혼주 한복 준비",category:"family",done:false},
  ]},
  { period:"2027-01/2027-03", label:"본식 가봉 & 마무리", emoji:"✨", items:[
    {id:"b01",text:"본식드레스 셀렉 (본식가봉)",category:"dress",done:false,note:"4벌 중 1벌, 1시간"},
    {id:"b02",text:"원본사진 수령 및 셀렉",category:"photo",done:false},
    {id:"b03",text:"종이 청첩장 준비",category:"etc",done:false},
    {id:"b04",text:"수정본 수령",category:"photo",done:false},
    {id:"b05",text:"스튜디오 액자 수령",category:"photo",done:false},
    {id:"b06",text:"혼주한복·정장 확인 / 예단",category:"family",done:false},
    {id:"b07",text:"웨딩 식순 준비",category:"ceremony",done:false},
    {id:"b08",text:"부케 셀렉",category:"flower",done:false,note:"부케1, 부토니아1, 코사지6"},
    {id:"b09",text:"식순 체크",category:"ceremony",done:false},
    {id:"b10",text:"MR, 연주 부분",category:"ceremony",done:false},
    {id:"b11",text:"식전영상",category:"ceremony",done:false},
    {id:"b12",text:"식권 도장찍기",category:"ceremony",done:false},
    {id:"b13",text:"포토테이블 사진 준비",category:"ceremony",done:false},
  ]},
  { period:"2027-04/2027-05", label:"웨딩데이", emoji:"💍", items:[
    {id:"w01",text:"웨딩데이 ♥",category:"ceremony",done:false},
  ]},
];

const CAT={venue:{bg:"#FFF8E1",text:"#F9A825",label:"웨딩홀"},planner:{bg:"#F3E8FF",text:"#7C3AED",label:"플래너"},dress:{bg:"#FFF1F2",text:"#E11D48",label:"드레스"},makeup:{bg:"#FDF2F8",text:"#DB2777",label:"메이크업"},photo:{bg:"#E8F5E9",text:"#388E3C",label:"촬영"},shopping:{bg:"#FFF8E1",text:"#E6A817",label:"혼수"},honeymoon:{bg:"#E0F7FA",text:"#00838F",label:"신혼여행"},ceremony:{bg:"#FFF3E0",text:"#E65100",label:"예식"},flower:{bg:"#FCE4EC",text:"#C62828",label:"부케·꽃"},family:{bg:"#FFF8E1",text:"#A16207",label:"혼주"},etc:{bg:"#F1F5F9",text:"#546E7A",label:"기타"}};

const DEFAULT_DATA={groomName:"",brideName:"",weddingDate:"",weddingTime:"12:00",email:"",smtpEmail:"",smtpAppPassword:"",isSetup:false,checklist:JSON.parse(JSON.stringify(CHECKLIST_TEMPLATE)),budget:[],vendors:[],emailLog:[]};

/* ── utils ── */
function getDday(d){if(!d)return null;const t=new Date();t.setHours(0,0,0,0);const w=new Date(d);w.setHours(0,0,0,0);return Math.ceil((w-t)/864e5);}
function fmtDate(d){if(!d)return"";const o=new Date(d),w=["일","월","화","수","목","금","토"];return o.getFullYear()+"년 "+(o.getMonth()+1)+"월 "+o.getDate()+"일 ("+w[o.getDay()]+")";}
function fmtWon(n){return n.toLocaleString("ko-KR")+"원";}
function periodStatus(p){const n=new Date(),parts=p.split("/"),sp=parts[0].split("-").map(Number),ep=parts[1].split("-").map(Number),start=new Date(sp[0],sp[1]-1,1),end=new Date(ep[0],ep[1],0);return n<start?"upcoming":n>end?"past":"current";}
function periodToLabel(p){const parts=p.split("/"),sp=parts[0].split("-").map(Number),ep=parts[1].split("-").map(Number),sy=sp[0]%100,ey=ep[0]%100;return sy===ey?sy+"년 "+sp[1]+"~"+ep[1]+"월":sy+"년 "+sp[1]+"월 ~ "+ey+"년 "+ep[1]+"월";}
function monthsBefore(period,wd){if(!wd)return"";const ep=period.split("/")[1].split("-").map(Number),ed=new Date(ep[0],ep[1]-1,1),w=new Date(wd),diff=(w.getFullYear()-ed.getFullYear())*12+(w.getMonth()-ed.getMonth());return diff<=0?"결혼 당월":"결혼 "+diff+"개월 전까지";}
function deadlineDate(period){const ep=period.split("/")[1].split("-").map(Number),end=new Date(ep[0],ep[1],0),w=["일","월","화","수","목","금","토"];return end.getFullYear()+"."+(end.getMonth()+1)+"."+end.getDate()+" ("+w[end.getDay()]+")";}

/* ───── Setup ───── */
function SetupScreen({data,setData}){
  const[f,setF]=useState({groomName:data.groomName||"",brideName:data.brideName||"",weddingDate:data.weddingDate||"",weddingTime:data.weddingTime||"12:00",email:data.email||""});
  const go=()=>{if(!f.groomName||!f.brideName||!f.weddingDate)return;setData({...data,...f,isSetup:true,checklist:data.checklist.length>0?data.checklist:JSON.parse(JSON.stringify(CHECKLIST_TEMPLATE))});};
  const ok=f.groomName&&f.brideName&&f.weddingDate;
  return(
    <div style={S.setupWrap}>
      <FlowerYellow style={{width:130,top:-20,left:-25}}/><FlowerPink style={{width:95,top:15,right:5}}/><FlowerGreen style={{width:110,bottom:30,left:15}}/><FlowerYellow style={{width:90,bottom:-5,right:-15}}/>
      <div style={S.setupCard}>
        <div style={{fontSize:48,marginBottom:6}}>🌿</div>
        <h1 style={S.setupH1}>우리의 결혼 준비</h1>
        <p style={S.setupSub}>두 사람의 이름과 예정일을 입력하면<br/>맞춤 체크리스트가 시작돼요</p>
        <div style={{display:"flex",flexDirection:"column",gap:16,textAlign:"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,minWidth:0}}><label style={S.lbl}>신랑 🌿</label><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={f.groomName} onChange={e=>setF({...f,groomName:e.target.value})} placeholder="이름"/></div>
            <div style={{fontSize:20,color:"#81C784",flexShrink:0,paddingTop:18}}>♥</div>
            <div style={{flex:1,minWidth:0}}><label style={S.lbl}>신부 🌻</label><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={f.brideName} onChange={e=>setF({...f,brideName:e.target.value})} placeholder="이름"/></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1,minWidth:0}}><label style={S.lbl}>결혼 예정일</label><input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={f.weddingDate} onChange={e=>setF({...f,weddingDate:e.target.value})}/></div>
            <div style={{flex:1,minWidth:0}}><label style={S.lbl}>예식 시간</label><input type="time" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={f.weddingTime} onChange={e=>setF({...f,weddingTime:e.target.value})}/></div>
          </div>
          <div><label style={S.lbl}>이메일 (알림용, 선택)</label><input type="email" style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="example@gmail.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
          <button style={{...S.btn1,opacity:ok?1:0.4,cursor:ok?"pointer":"not-allowed",width:"100%",marginTop:4}} onClick={go} disabled={!ok}>시작하기 🌷</button>
        </div>
      </div>
    </div>
  );
}

/* ───── Dashboard ───── */
function Dashboard({data,setTab}){
  const dd=getDday(data.weddingDate),total=data.checklist.reduce((s,p)=>s+p.items.length,0),done=data.checklist.reduce((s,p)=>s+p.items.filter(i=>i.done).length,0),pct=total>0?Math.round(done/total*100):0,bT=data.budget.reduce((s,b)=>s+(b.unitPrice||0)*(b.qty||0),0),bP=data.budget.reduce((s,b)=>s+(b.paid||0),0);
  const cur=data.checklist.find(p=>periodStatus(p.period)==="current")||data.checklist.find(p=>periodStatus(p.period)==="upcoming");
  const todo=cur?cur.items.filter(i=>!i.done):[];
  return(<div>
    <div style={S.ddayCard}>
      <FlowerYellow style={{width:120,top:-25,left:-15}}/><FlowerPink style={{width:85,top:8,right:-5}}/><FlowerGreen style={{width:100,bottom:-15,right:35}}/><FlowerYellow style={{width:75,bottom:8,left:8}}/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{fontSize:12,fontWeight:600,color:"#7B6B5D",letterSpacing:2.5,marginBottom:8,opacity:0.5}}>OUR WEDDING</div>
        <div style={S.ddayCouple}>{data.groomName} 🌿 ♥ 🌻 {data.brideName}</div>
        <div style={S.ddayNum}>{dd>0?("D-"+dd):dd===0?"D-Day 🎉":("D+"+Math.abs(dd))}</div>
        <div style={S.ddayDate}>{fmtDate(data.weddingDate)} {data.weddingTime}</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:20}}>
      <div style={S.card}><div style={S.cardLbl}>진행률</div><div style={S.barOut}><div style={{...S.barIn,width:pct+"%"}}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:10}}><span style={{fontSize:26,fontWeight:700,color:"#4E7D3A"}}>{pct}%</span><span style={{fontSize:13,color:"#A1887F",alignSelf:"flex-end"}}>{done}/{total}</span></div></div>
      <div style={S.card}><div style={S.cardLbl}>예산</div><div style={{fontSize:22,fontWeight:700,color:"#4E7D3A"}}>{fmtWon(bT)}</div><div style={{fontSize:13,color:"#A1887F",marginTop:6}}>지출 {fmtWon(bP)} · 잔여 {fmtWon(bT-bP)}</div></div>
    </div>
    <div style={{...S.card,marginTop:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={S.cardLbl}>{cur?(cur.emoji+" 지금 할 일 — "+cur.label):"모든 준비 완료! 🎉"}</div>{cur&&<button style={S.linkBtn} onClick={()=>setTab("checklist")}>전체 보기 →</button>}</div>
      {cur&&<div style={{fontSize:13,color:"#8D6E63",marginBottom:14}}>📅 {periodToLabel(cur.period)} · {monthsBefore(cur.period,data.weddingDate)} · 기한 {deadlineDate(cur.period)}</div>}
      {todo.length===0&&<div style={{color:"#A1887F",fontSize:14,padding:"8px 0"}}>모든 항목 완료! 🌟</div>}
      {todo.slice(0,8).map(item=>{const c=CAT[item.category]||CAT.etc;return(<div key={item.id} style={S.todoRow}><span style={{...S.badge,background:c.bg,color:c.text}}>{c.label}</span><span style={{fontSize:14,color:"#3E2723"}}>{item.text}</span>{item.note&&<span style={{fontSize:11,color:"#A1887F",marginLeft:4}}>· {item.note}</span>}</div>);})}
      {todo.length>8&&<div style={{fontSize:13,color:"#A1887F",marginTop:8}}>외 {todo.length-8}개 더...</div>}
    </div>
  </div>);
}

/* ───── Checklist ───── */
function ChecklistTab({data,setData}){
  const toggle=(pi,id)=>{const nc=data.checklist.map((p,i)=>i!==pi?p:{...p,items:p.items.map(it=>it.id===id?{...it,done:!it.done}:it)});setData({...data,checklist:nc});};
  return(<div style={S.tab}>
    <h2 style={S.tabH}>🌿 체크리스트</h2>
    <p style={S.tabSub}>{data.brideName} ♥ {data.groomName} · 결혼까지의 여정</p>
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {data.checklist.map((ph,pi)=>{const st=periodStatus(ph.period),allD=ph.items.every(i=>i.done),dc=ph.items.filter(i=>i.done).length;return(<div key={pi} style={{...S.phaseCard,borderLeft:"3px solid "+(st==="current"?"#81C784":st==="past"?"#C8E6C9":"#E0E0E0")}}>
        <div style={S.phHead}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{...S.dot,background:allD?"#66BB6A":st==="current"?"#FDD835":st==="past"?"#A5D6A7":"#E0E0E0"}}>{allD?"✓":""}</span><span style={{fontSize:15,fontWeight:700,color:"#3E2723"}}>{ph.emoji} {ph.label}</span><span style={{fontSize:13,color:"#A1887F"}}>{dc}/{ph.items.length}</span></div>{st==="current"&&<span style={S.nowTag}>지금</span>}</div>
        <div style={{fontSize:13,color:"#8D6E63",marginBottom:12,paddingLeft:32}}>📅 {periodToLabel(ph.period)} · {monthsBefore(ph.period,data.weddingDate)} · 기한 {deadlineDate(ph.period)}</div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>{ph.items.map(item=>{const c=CAT[item.category]||CAT.etc;return(<div key={item.id} style={{...S.chkRow,opacity:item.done?0.45:1}} onClick={()=>toggle(pi,item.id)}><div style={{...S.chk,background:item.done?"#66BB6A":"#fff",borderColor:item.done?"#66BB6A":"#D7CCC8"}}>{item.done?"✓":""}</div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{...S.badge,background:c.bg,color:c.text}}>{c.label}</span><span style={{textDecoration:item.done?"line-through":"none",fontSize:14,color:"#3E2723"}}>{item.text}</span></div>{item.note&&<div style={{fontSize:12,color:"#A1887F",marginTop:3}}>💡 {item.note}</div>}</div></div>);})}</div>
      </div>);})}
    </div>
  </div>);
}

/* ───── Budget ───── */
function BudgetTab({data,setData}){
  const[f,setF]=useState({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});
  const[editing,setEditing]=useState(null);const[ef,setEf]=useState({});
  const add=()=>{if(!f.name||!f.unitPrice)return;const up=parseInt(f.unitPrice)||0,q=parseInt(f.qty)||1;setData({...data,budget:[...data.budget,{id:Date.now().toString(),name:f.name,category:f.category,unitPrice:up,qty:q,amount:up*q,paid:parseInt(f.paid)||0}]});setF({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});};
  const rm=id=>setData({...data,budget:data.budget.filter(b=>b.id!==id)});
  const startEdit=item=>{setEditing(item.id);setEf({name:item.name,category:item.category,unitPrice:String(item.unitPrice),qty:String(item.qty),paid:String(item.paid)});};
  const saveEdit=id=>{const up=parseInt(ef.unitPrice)||0,q=parseInt(ef.qty)||1;setData({...data,budget:data.budget.map(b=>b.id===id?{...b,name:ef.name,category:ef.category,unitPrice:up,qty:q,amount:up*q,paid:parseInt(ef.paid)||0}:b)});setEditing(null);};
  const t=data.budget.reduce((s,b)=>s+b.amount,0),tp=data.budget.reduce((s,b)=>s+b.paid,0);
  return(<div style={S.tab}>
    <h2 style={S.tabH}>🌻 예산 관리</h2>
    <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}><div style={S.sumBox}><span style={S.sumLbl}>총 예산</span><span style={{fontSize:20,fontWeight:700,color:"#4E7D3A"}}>{fmtWon(t)}</span></div><div style={S.sumBox}><span style={S.sumLbl}>지출</span><span style={{fontSize:20,fontWeight:700,color:"#E65100"}}>{fmtWon(tp)}</span></div><div style={S.sumBox}><span style={S.sumLbl}>잔여</span><span style={{fontSize:20,fontWeight:700,color:"#2E7D32"}}>{fmtWon(t-tp)}</span></div></div>
    <div style={S.addRow}>
      <input style={{...S.inp,flex:2,minWidth:100}} placeholder="항목명" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
      <select style={{...S.inp,flex:1,minWidth:70}} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
      <input style={{...S.inp,width:80}} type="number" placeholder="단가" value={f.unitPrice} onChange={e=>setF({...f,unitPrice:e.target.value})}/>
      <input style={{...S.inp,width:50}} type="number" placeholder="수량" value={f.qty} onChange={e=>setF({...f,qty:e.target.value})}/>
      <input style={{...S.inp,width:80}} type="number" placeholder="지출액" value={f.paid} onChange={e=>setF({...f,paid:e.target.value})}/>
      <button style={S.addBtn} onClick={add}>추가</button>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {data.budget.length===0&&<div style={S.empty}>예산 항목을 추가해보세요 🌻</div>}
      {data.budget.map(item=>{const c=CAT[item.category]||CAT.etc,pp=item.amount>0?Math.round(item.paid/item.amount*100):0;
        if(editing===item.id)return(<div key={item.id} style={S.budgetCard}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}><input style={{...S.inp,flex:2,padding:"8px 12px",fontSize:13,minWidth:80}} value={ef.name} onChange={e=>setEf({...ef,name:e.target.value})}/><select style={{...S.inp,flex:1,padding:"8px 12px",fontSize:13,minWidth:60}} value={ef.category} onChange={e=>setEf({...ef,category:e.target.value})}>{Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}><span style={{fontSize:12,color:"#8D6E63"}}>단가</span><input style={{...S.inp,width:80,padding:"8px 12px",fontSize:13}} type="number" value={ef.unitPrice} onChange={e=>setEf({...ef,unitPrice:e.target.value})}/><span style={{color:"#A1887F"}}>x</span><span style={{fontSize:12,color:"#8D6E63"}}>수량</span><input style={{...S.inp,width:50,padding:"8px 12px",fontSize:13}} type="number" value={ef.qty} onChange={e=>setEf({...ef,qty:e.target.value})}/><span style={{fontSize:13,color:"#4E7D3A",fontWeight:700}}>= {fmtWon((parseInt(ef.unitPrice)||0)*(parseInt(ef.qty)||1))}</span></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:"#8D6E63"}}>지출</span><input style={{...S.inp,width:90,padding:"8px 12px",fontSize:13}} type="number" value={ef.paid} onChange={e=>setEf({...ef,paid:e.target.value})}/><button style={{...S.addBtn,padding:"8px 16px",fontSize:13}} onClick={()=>saveEdit(item.id)}>저장</button><button style={S.editBtn} onClick={()=>setEditing(null)}>취소</button></div>
        </div>);
        return(<div key={item.id} style={S.budgetCard}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{...S.badge,background:c.bg,color:c.text}}>{c.label}</span><span style={{fontWeight:600,color:"#3E2723",fontSize:14}}>{item.name}</span><span style={{fontSize:12,color:"#A1887F"}}>{fmtWon(item.unitPrice)} x {item.qty}</span></div><div style={{display:"flex",gap:6}}><button style={S.editBtn} onClick={()=>startEdit(item)}>수정</button><button style={S.delBtn} onClick={()=>rm(item.id)}>✕</button></div></div>
          <div style={S.bBar}><div style={{...S.bBarIn,width:Math.min(pp,100)+"%"}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#8D6E63"}}><span>{fmtWon(item.paid)} / {fmtWon(item.amount)}</span><span>{pp}%</span></div>
        </div>);
      })}
    </div>
  </div>);
}

/* ───── Vendors ───── */
function VendorTab({data,setData}){
  const[f,setF]=useState({name:"",category:"venue",phone:"",memo:""});
  const add=()=>{if(!f.name)return;setData({...data,vendors:[...data.vendors,{id:Date.now().toString(),...f}]});setF({name:"",category:"venue",phone:"",memo:""});};
  const rm=id=>setData({...data,vendors:data.vendors.filter(v=>v.id!==id)});
  return(<div style={S.tab}>
    <h2 style={S.tabH}>📇 업체 연락처</h2>
    <div style={S.addRow}>
      <input style={{...S.inp,flex:2,minWidth:100}} placeholder="업체명" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
      <select style={{...S.inp,flex:1,minWidth:70}} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
      <input style={{...S.inp,flex:1,minWidth:80}} placeholder="연락처" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
      <input style={{...S.inp,flex:2,minWidth:100}} placeholder="메모" value={f.memo} onChange={e=>setF({...f,memo:e.target.value})}/>
      <button style={S.addBtn} onClick={add}>추가</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>
      {data.vendors.length===0&&<div style={S.empty}>업체 정보를 추가해보세요 🌻</div>}
      {data.vendors.map(v=>{const c=CAT[v.category]||CAT.etc;return(<div key={v.id} style={S.vendorCard}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{...S.badge,background:c.bg,color:c.text}}>{c.label}</span><button style={S.delBtn} onClick={()=>rm(v.id)}>✕</button></div><div style={{fontWeight:700,fontSize:16,color:"#3E2723",margin:"8px 0 4px"}}>{v.name}</div>{v.phone&&<div style={{fontSize:14,color:"#558B2F"}}>📞 {v.phone}</div>}{v.memo&&<div style={{fontSize:13,color:"#8D6E63",marginTop:4}}>📝 {v.memo}</div>}</div>);})}
    </div>
  </div>);
}

/* ───── Email ───── */
function EmailTab({data,setData}){
  const[sending,setSending]=useState(false);const[result,setResult]=useState(null);
  const[smtp,setSmtp]=useState({smtpEmail:data.smtpEmail||"",smtpAppPassword:data.smtpAppPassword||"",email:data.email||""});
  const[serverUrl,setServerUrl]=useState(data.serverUrl||"http://localhost:5000");
  const saveSm=()=>{setData({...data,...smtp,serverUrl});setResult({ok:true,msg:"저장 완료!"});setTimeout(()=>setResult(null),3000);};
  const buildBody=()=>{
    const ps=data.checklist.filter(p=>{const s=periodStatus(p.period);return s==="current"||s==="upcoming";}).slice(0,2);
    let b=data.groomName+" + "+data.brideName+" Wedding Alert\nD-"+getDday(data.weddingDate)+" | "+fmtDate(data.weddingDate)+"\n\n";
    ps.forEach(p=>{b+="== "+p.emoji+" "+p.label+" ("+periodToLabel(p.period)+") ==\n";p.items.forEach(i=>{b+="  "+(i.done?"[v]":"[ ]")+" "+i.text+"\n";if(i.note)b+="     > "+i.note+"\n";});b+="\n";});
    const tt=data.checklist.reduce((s,p)=>s+p.items.length,0),dd=data.checklist.reduce((s,p)=>s+p.items.filter(i=>i.done).length,0);
    b+="Progress: "+dd+"/"+tt+" ("+Math.round(dd/tt*100)+"%)\n";return b;
  };
  const send=async()=>{
    setSending(true);setResult(null);
    try{const r=await fetch(serverUrl+"/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({smtp_email:smtp.smtpEmail,smtp_password:smtp.smtpAppPassword,to_email:smtp.email,subject:"Wedding Planner | D-"+getDday(data.weddingDate),body:buildBody()})});
      if(r.ok){setResult({ok:true,msg:"발송 완료!"});setData({...data,emailLog:[...(data.emailLog||[]),{date:new Date().toISOString()}]});}
      else{const e=await r.json();setResult({ok:false,msg:e.error||"Error"});}
    }catch(err){setResult({ok:false,msg:"서버에 연결할 수 없어요. Python 서버를 실행해주세요."});}
    setSending(false);
  };
  return(<div style={S.tab}>
    <h2 style={S.tabH}>📧 이메일 알림</h2>
    <div style={S.section}>
      <h3 style={S.secH}>이메일 서버 설정</h3>
      <p style={{fontSize:13,color:"#A1887F",margin:"0 0 16px",lineHeight:1.7}}>Python 서버 주소와 Gmail SMTP 정보를 입력하세요.</p>
      <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:480}}>
        <div><label style={S.lbl}>서버 주소</label><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="http://localhost:5000" value={serverUrl} onChange={e=>setServerUrl(e.target.value)}/></div>
        <div><label style={S.lbl}>발신 Gmail</label><input type="email" style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="sender@gmail.com" value={smtp.smtpEmail} onChange={e=>setSmtp({...smtp,smtpEmail:e.target.value})}/></div>
        <div><label style={S.lbl}>앱 비밀번호</label><input type="password" style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="xxxx xxxx xxxx xxxx" value={smtp.smtpAppPassword} onChange={e=>setSmtp({...smtp,smtpAppPassword:e.target.value})}/></div>
        <div><label style={S.lbl}>수신 이메일</label><input type="email" style={{...S.inp,width:"100%",boxSizing:"border-box"}} placeholder="receiver@gmail.com" value={smtp.email} onChange={e=>setSmtp({...smtp,email:e.target.value})}/></div>
        <div style={{display:"flex",gap:10}}><button style={S.btn1} onClick={saveSm}>저장</button><button style={{...S.addBtn,background:"#558B2F"}} onClick={send} disabled={sending}>{sending?"발송 중...":"📨 테스트 발송"}</button></div>
        {result&&<div style={{padding:"10px 14px",borderRadius:12,fontSize:14,background:result.ok?"#E8F5E9":"#FBE9E7",color:result.ok?"#2E7D32":"#C62828"}}>{result.msg}</div>}
      </div>
    </div>
    <div style={{...S.section,marginTop:20}}><h3 style={S.secH}>미리보기</h3><div style={S.preview}><pre style={{margin:0,whiteSpace:"pre-wrap",fontFamily:"inherit",fontSize:13,color:"#5D4037",lineHeight:1.8}}>{buildBody()}</pre></div></div>
  </div>);
}

/* ───── Settings ───── */
function SettingsTab({data,setData}){
  const[f,setF]=useState({groomName:data.groomName,brideName:data.brideName,weddingDate:data.weddingDate,weddingTime:data.weddingTime});const[saved,setSaved]=useState(false);
  const save=()=>{const m={};data.checklist.forEach(p=>p.items.forEach(i=>{m[i.id]=i.done;}));const nc=JSON.parse(JSON.stringify(CHECKLIST_TEMPLATE));nc.forEach(p=>p.items.forEach(i=>{if(m[i.id]!==undefined)i.done=m[i.id];}));setData({...data,...f,checklist:nc});setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return(<div style={S.tab}>
    <h2 style={S.tabH}>⚙️ 설정</h2>
    <div style={{maxWidth:480,display:"flex",flexDirection:"column",gap:12}}>
      <div><label style={S.lbl}>신랑</label><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={f.groomName} onChange={e=>setF({...f,groomName:e.target.value})}/></div>
      <div><label style={S.lbl}>신부</label><input style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={f.brideName} onChange={e=>setF({...f,brideName:e.target.value})}/></div>
      <div><label style={S.lbl}>결혼 예정일</label><input type="date" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={f.weddingDate} onChange={e=>setF({...f,weddingDate:e.target.value})}/></div>
      <div><label style={S.lbl}>예식 시간</label><input type="time" style={{...S.inp,width:"100%",boxSizing:"border-box"}} value={f.weddingTime} onChange={e=>setF({...f,weddingTime:e.target.value})}/></div>
      <div style={{display:"flex",gap:12,marginTop:12}}>
        <button style={S.btn1} onClick={save}>{saved?"✓ 저장!":"저장"}</button>
        <button style={{padding:"12px 20px",background:"#EFEBE9",color:"#D84315",border:"none",borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}} onClick={()=>{if(confirm("초기화할까요?"))setData({...DEFAULT_DATA});}}>초기화</button>
      </div>
    </div>
  </div>);
}

/* ───── Main ───── */
const TABS=[{id:"dashboard",label:"홈",icon:"🏡"},{id:"checklist",label:"체크리스트",icon:"🌿"},{id:"budget",label:"예산",icon:"🌻"},{id:"vendors",label:"업체",icon:"📇"},{id:"email",label:"이메일",icon:"📧"},{id:"settings",label:"설정",icon:"⚙️"}];

export default function App(){
  const[data,setRaw]=useState(DEFAULT_DATA);const[tab,setTab]=useState("dashboard");const[loaded,setLoaded]=useState(false);

  useEffect(()=>{
    const saved=storage.get(STORAGE_KEY);
    if(saved&&saved.value){try{setRaw(JSON.parse(saved.value));}catch(e){}}
    setLoaded(true);
  },[]);

  const setData=useCallback(nd=>{
    setRaw(nd);
    storage.set(STORAGE_KEY,JSON.stringify(nd));
  },[]);

  if(!loaded)return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:FONT,background:"#FFFDE7"}}><div style={{fontSize:48}}>🌿</div><div style={{color:"#A1887F",marginTop:12}}>불러오는 중...</div></div>;
  if(!data.isSetup)return<SetupScreen data={data} setData={setData}/>;

  return(<div style={S.app}>
    <nav style={S.side}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 12px 10px"}}><span style={{fontSize:22}}>🌿</span><span style={{fontSize:17,fontWeight:700,color:"#4E7D3A"}}>Wedding</span></div>
      <div style={{fontSize:12,color:"#A1887F",padding:"0 14px 14px",borderBottom:"1px solid #E8E0D8",marginBottom:8}}>{data.groomName} ♥ {data.brideName}</div>
      {TABS.map(t=><button key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",border:"none",borderRadius:12,fontSize:14,cursor:"pointer",fontFamily:FONT,background:tab===t.id?"#F1F8E9":"transparent",color:tab===t.id?"#4E7D3A":"#8D6E63",fontWeight:tab===t.id?700:400,transition:"all 0.15s"}} onClick={()=>setTab(t.id)}><span>{t.icon}</span><span>{t.label}</span></button>)}
    </nav>
    <nav style={S.mob}>{TABS.map(t=><button key={t.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:"none",border:"none",padding:"6px 6px",cursor:"pointer",fontFamily:FONT,color:tab===t.id?"#4E7D3A":"#BCAAA4",fontWeight:tab===t.id?700:400}} onClick={()=>setTab(t.id)}><span style={{fontSize:17}}>{t.icon}</span><span style={{fontSize:9}}>{t.label}</span></button>)}</nav>
    <main style={S.main}>
      {tab==="dashboard"&&<Dashboard data={data} setTab={setTab}/>}
      {tab==="checklist"&&<ChecklistTab data={data} setData={setData}/>}
      {tab==="budget"&&<BudgetTab data={data} setData={setData}/>}
      {tab==="vendors"&&<VendorTab data={data} setData={setData}/>}
      {tab==="email"&&<EmailTab data={data} setData={setData}/>}
      {tab==="settings"&&<SettingsTab data={data} setData={setData}/>}
    </main>
  </div>);
}

/* ───── Styles ───── */
const S={
  setupWrap:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(150deg,#FFFDE7 0%,#FFF9C4 30%,#F1F8E9 60%,#E8F5E9 100%)",padding:16,fontFamily:FONT,position:"relative",overflow:"hidden"},
  setupCard:{background:"rgba(255,255,255,0.9)",borderRadius:24,padding:"40px 32px",maxWidth:440,width:"100%",boxShadow:"0 16px 48px rgba(76,111,55,0.1)",textAlign:"center",backdropFilter:"blur(12px)",position:"relative",zIndex:2,boxSizing:"border-box"},
  setupH1:{fontSize:26,fontWeight:700,color:"#3E2723",margin:"0 0 6px"},
  setupSub:{fontSize:14,color:"#A1887F",margin:"0 0 28px",lineHeight:1.8},
  lbl:{fontSize:13,fontWeight:700,color:"#6D4C41",display:"block",marginBottom:4},
  inp:{padding:"10px 12px",border:"1.5px solid #D7CCC8",borderRadius:10,fontSize:14,outline:"none",fontFamily:FONT,color:"#3E2723",background:"rgba(255,255,255,0.85)",transition:"border-color 0.2s",boxSizing:"border-box"},
  btn1:{padding:"12px 24px",background:"linear-gradient(135deg,#66BB6A,#81C784)",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:FONT,boxShadow:"0 4px 12px rgba(102,187,106,0.3)"},
  app:{display:"flex",minHeight:"100vh",background:"#FFFEF7",fontFamily:FONT},
  side:{width:200,background:"rgba(255,253,247,0.97)",borderRight:"1px solid #E8E0D8",padding:"24px 12px",display:"flex",flexDirection:"column",gap:3,position:"fixed",top:0,left:0,bottom:0,zIndex:10},
  mob:{display:"none",position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,253,247,0.97)",borderTop:"1px solid #E8E0D8",zIndex:10,justifyContent:"space-around",padding:"5px 0 env(safe-area-inset-bottom,5px)"},
  main:{flex:1,marginLeft:200,padding:"28px 32px 80px",minHeight:"100vh",overflowY:"auto"},
  ddayCard:{background:"linear-gradient(135deg,#FFFDE7 0%,#FFF9C4 30%,#F1F8E9 60%,#E8F5E9 100%)",borderRadius:24,padding:"44px 28px",textAlign:"center",border:"1px solid rgba(165,214,167,0.3)",position:"relative",overflow:"hidden"},
  ddayCouple:{fontSize:20,fontWeight:700,color:"#4E7D3A",marginBottom:10,letterSpacing:"1px"},
  ddayNum:{fontSize:56,fontWeight:700,color:"#33691E",lineHeight:1.1,letterSpacing:"-2px"},
  ddayDate:{fontSize:15,color:"#689F38",marginTop:10},
  card:{background:"#fff",borderRadius:18,padding:"22px 20px",border:"1px solid #E8E0D8",boxShadow:"0 2px 8px rgba(62,39,35,0.03)"},
  cardLbl:{fontSize:13,fontWeight:700,color:"#A1887F",marginBottom:10},
  barOut:{height:8,background:"#F1F8E9",borderRadius:4,overflow:"hidden"},
  barIn:{height:"100%",background:"linear-gradient(90deg,#FDD835,#81C784)",borderRadius:4,transition:"width 0.5s ease"},
  todoRow:{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:10,background:"#FAFAF5",marginBottom:4,flexWrap:"wrap"},
  linkBtn:{background:"none",border:"none",color:"#66BB6A",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FONT,padding:0},
  tab:{maxWidth:800},tabH:{fontSize:24,fontWeight:700,color:"#3E2723",margin:"0 0 6px"},tabSub:{fontSize:14,color:"#A1887F",margin:"0 0 24px"},
  phaseCard:{background:"#fff",borderRadius:16,padding:"20px 20px 16px",border:"1px solid #E8E0D8"},
  phHead:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8},
  dot:{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0},
  nowTag:{padding:"3px 10px",borderRadius:8,fontSize:11,fontWeight:700,background:"#FFF8E1",color:"#F9A825"},
  chkRow:{display:"flex",gap:12,alignItems:"flex-start",padding:"9px 12px",borderRadius:10,cursor:"pointer",background:"#FAFAF5"},
  chk:{width:22,height:22,borderRadius:7,border:"2px solid",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0,marginTop:1},
  badge:{padding:"2px 8px",borderRadius:7,fontSize:11,fontWeight:700,flexShrink:0},
  addRow:{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20,alignItems:"flex-end"},
  addBtn:{padding:"10px 18px",background:"#66BB6A",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"},
  delBtn:{background:"none",border:"none",color:"#D7CCC8",fontSize:16,cursor:"pointer",padding:"2px 6px"},
  editBtn:{background:"#F5F0EB",border:"none",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,color:"#8D6E63",cursor:"pointer",fontFamily:FONT},
  sumBox:{flex:1,minWidth:130,background:"#fff",borderRadius:14,padding:"16px 18px",border:"1px solid #E8E0D8"},
  sumLbl:{display:"block",fontSize:12,color:"#A1887F",fontWeight:600,marginBottom:4},
  budgetCard:{background:"#fff",borderRadius:14,padding:"16px 18px",border:"1px solid #E8E0D8"},
  bBar:{height:6,background:"#F1F8E9",borderRadius:3,overflow:"hidden",marginBottom:8},
  bBarIn:{height:"100%",background:"linear-gradient(90deg,#FDD835,#66BB6A)",borderRadius:3,transition:"width 0.3s"},
  vendorCard:{background:"#fff",borderRadius:16,padding:"16px 18px 18px",border:"1px solid #E8E0D8"},
  section:{background:"#fff",borderRadius:16,padding:24,border:"1px solid #E8E0D8"},
  secH:{fontSize:16,fontWeight:700,color:"#3E2723",margin:"0 0 8px"},
  preview:{background:"#FFFEF7",borderRadius:12,padding:20,border:"1px solid #E8E0D8",maxHeight:280,overflow:"auto"},
  empty:{textAlign:"center",padding:"40px 20px",color:"#A1887F",fontSize:14,gridColumn:"1 / -1"},
};

/* ── global styles ── */
const fontLink=document.createElement("link");fontLink.rel="stylesheet";fontLink.href="https://fonts.googleapis.com/css2?family=Maru+Buri:wght@300;400;700&display=swap";document.head.appendChild(fontLink);
const styleEl=document.createElement("style");styleEl.textContent="@media(max-width:768px){nav[style*=\"width: 200\"]{display:none !important;}nav[style*=\"display: none\"]{display:flex !important;}main[style*=\"margin-left: 200\"]{margin-left:0 !important;padding:20px 16px 100px !important;}}input:focus,select:focus{border-color:#81C784 !important;box-shadow:0 0 0 3px rgba(129,199,132,0.15) !important;}button:hover{opacity:0.88;}*{-webkit-font-smoothing:antialiased;box-sizing:border-box;}";document.head.appendChild(styleEl);
