import { useState, useEffect, useCallback, useRef } from "react";

const FONT="'Pretendard',-apple-system,'Noto Sans KR',sans-serif";
const SB_URL="https://jzahuisvtglzzkmgjcnr.supabase.co";
const SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YWh1aXN2dGdsenprbWdqY25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4MDgsImV4cCI6MjA5MDUwNzgwOH0.WWpeegaxxxJR6lROjBJLQDEofsRoKn9YxBgaoeqndJM";
const HD={"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Content-Type":"application/json"};
async function dbLoad(k){try{const r=await fetch(SB_URL+"/rest/v1/couples?couple_key=eq."+encodeURIComponent(k)+"&select=data",{headers:HD});const d=await r.json();return d?.[0]?.data||null;}catch{return null;}}
async function dbSave(k,d){try{await fetch(SB_URL+"/rest/v1/couples",{method:"POST",headers:{...HD,"Prefer":"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({couple_key:k,data:d,updated_at:new Date().toISOString()})});}catch(e){console.error(e);}}
function dlCSV(fn,hd,rows){const B="\uFEFF",esc=c=>'"'+String(c==null?"":c).replace(/"/g,'""')+'"';const csv=B+[hd.map(esc).join(","),...rows.map(r=>r.map(esc).join(","))].join("\n");const b=new Blob([csv],{type:"text/csv;charset=utf-8;"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=fn+".csv";a.click();}

const P={green:"#B5D580",greenDk:"#7BA23A",greenLt:"#E8F2D6",greenBg:"#F4F9EC",blue:"#6EC8E4",blueDk:"#3A8EB0",blueLt:"#D6EEF6",blueBg:"#EDF7FB",peri:"#92ADD8",periDk:"#5B7EAE",periLt:"#DDE6F2",periBg:"#EEF2F8",lav:"#B0A0CC",lavDk:"#7B6B9E",lavLt:"#E4DFF0",lavBg:"#F2F0F7",text:"#3A3A50",textSub:"#7A7A8E",textMuted:"#A8A8BC",bg:"#F6F9F2",border:"#E2EAD8"};

function Fl1({s}){return<svg viewBox="0 0 120 120" style={{position:"absolute",opacity:0.15,pointerEvents:"none",...s}} xmlns="http://www.w3.org/2000/svg"><defs><filter id="a"><feGaussianBlur stdDeviation="2.5"/></filter></defs><g filter="url(#a)">{[0,72,144,216,288].map((r,i)=><ellipse key={i} cx="60" cy="35" rx="22" ry="28" fill={i%2?P.blue:P.peri} transform={`rotate(${r} 60 60)`}/>)}<circle cx="60" cy="60" r="12" fill={P.lav}/></g></svg>;}
function Fl2({s}){return<svg viewBox="0 0 100 60" style={{position:"absolute",opacity:0.13,pointerEvents:"none",...s}} xmlns="http://www.w3.org/2000/svg"><defs><filter id="b"><feGaussianBlur stdDeviation="1.5"/></filter></defs><g filter="url(#b)"><path d="M50 55Q30 30 15 40Q0 50 20 55Z" fill={P.green}/><path d="M50 55Q70 30 85 40Q100 50 80 55Z" fill={P.greenLt}/><path d="M50 55Q40 15 50 5Q60 15 50 55Z" fill={P.greenDk}/></g></svg>;}
function Fl3({s}){return<svg viewBox="0 0 90 90" style={{position:"absolute",opacity:0.12,pointerEvents:"none",...s}} xmlns="http://www.w3.org/2000/svg"><defs><filter id="c"><feGaussianBlur stdDeviation="2"/></filter></defs><g filter="url(#c)">{[0,60,120,180,240,300].map((r,i)=><ellipse key={i} cx="45" cy="25" rx="16" ry="22" fill={i%2?P.lav:P.peri} transform={`rotate(${r} 45 45)`}/>)}<circle cx="45" cy="45" r="8" fill={P.blueLt}/></g></svg>;}

const CL=[
  {period:"2026-02/2026-04",label:"준비 시작",emoji:"🌱",items:[{id:"s01",text:"플래너 결정",cat:"planner"},{id:"s02",text:"웨딩홀 투어 후 결정",cat:"venue"},{id:"s03",text:"스튜디오 예약",cat:"photo"},{id:"s04",text:"드레스샵 결정",cat:"dress"},{id:"s05",text:"혼주 메이크업 예약",cat:"makeup"},{id:"s06",text:"본식 스냅/DVD 결정",cat:"photo",note:"웨딩홀 연계 확인"},{id:"s07",text:"허니문 예약",cat:"honeymoon"},{id:"s08",text:"결혼반지(예물) 준비",cat:"shopping"},{id:"s09",text:"예복(턱시도) 알아보기",cat:"shopping"}]},
  {period:"2026-04/2026-05",label:"드레스투어 & 혼수",emoji:"👗",items:[{id:"d01",text:"드레스투어 후 샵 결정",cat:"dress",note:"샵당 1시간/4벌, 5.5만원"},{id:"d02",text:"혼수품목 준비 시작",cat:"shopping"},{id:"d03",text:"예복 가봉",cat:"shopping"},{id:"d04",text:"예물 디자인 셀렉·제작",cat:"shopping"},{id:"d05",text:"한복 셀렉/가봉",cat:"shopping"}]},
  {period:"2026-06/2026-07",label:"촬영 준비",emoji:"📸",items:[{id:"p01",text:"촬영가봉 (드레스 셀렉)",cat:"dress",note:"5~6벌 중 3~4벌"},{id:"p02",text:"촬영 소품·컨셉 준비",cat:"photo"},{id:"p03",text:"생화부케 예약",cat:"flower"},{id:"p04",text:"신랑 예복 디자인",cat:"shopping"}]},
  {period:"2026-09/2026-10",label:"스튜디오 촬영",emoji:"💛",items:[{id:"ph01",text:"스튜디오 웨딩 촬영",cat:"photo",note:"4~4.5시간"},{id:"ph02",text:"헬퍼이모님 확인",cat:"photo",note:"1회 25만원"}]},
  {period:"2026-11/2026-12",label:"셀렉 & 청첩장",emoji:"🖼️",items:[{id:"sl01",text:"앨범/액자 사진 셀렉",cat:"photo",note:"2~3시간"},{id:"sl02",text:"모바일 청첩장",cat:"etc"}]},
  {period:"2026-11/2027-01",label:"막바지 준비",emoji:"🏡",items:[{id:"f01",text:"신혼집 구하기",cat:"etc"},{id:"f02",text:"가전·가구 준비",cat:"shopping"},{id:"f03",text:"주례/사회/축가",cat:"ceremony"},{id:"f04",text:"접수대 섭외",cat:"ceremony"},{id:"f05",text:"폐백 여부 결정",cat:"ceremony"},{id:"f06",text:"2부 의상 준비",cat:"dress"},{id:"f07",text:"혼주 한복·정장",cat:"family"}]},
  {period:"2027-01/2027-03",label:"본식 가봉 & 마무리",emoji:"✨",items:[{id:"b01",text:"본식 드레스 셀렉",cat:"dress",note:"4벌 중 1벌"},{id:"b02",text:"원본사진 수령·셀렉",cat:"photo"},{id:"b03",text:"종이 청첩장",cat:"etc"},{id:"b04",text:"수정본 수령",cat:"photo"},{id:"b05",text:"액자 수령",cat:"photo"},{id:"b06",text:"혼주 확인/예단",cat:"family"},{id:"b07",text:"식순 준비",cat:"ceremony"},{id:"b08",text:"부케 셀렉",cat:"flower",note:"부케+부토니아+코사지6"},{id:"b09",text:"식순 체크",cat:"ceremony"},{id:"b10",text:"MR·연주",cat:"ceremony"},{id:"b11",text:"식전영상",cat:"ceremony"},{id:"b12",text:"식권 도장",cat:"ceremony"},{id:"b13",text:"포토테이블",cat:"ceremony"}]},
  {period:"2027-04/2027-05",label:"웨딩데이",emoji:"💍",items:[{id:"w01",text:"웨딩데이 ♥",cat:"ceremony"}]},
];
const CAT={venue:{bg:"#FFF8E1",fg:"#D4A017",n:"웨딩홀",ic:"🏛️"},planner:{bg:P.lavLt,fg:P.lavDk,n:"플래너",ic:"📋"},dress:{bg:"#FCE4EC",fg:"#C62860",n:"드레스",ic:"👗"},makeup:{bg:"#FDF2F8",fg:"#B0408A",n:"메이크업",ic:"💄"},photo:{bg:P.greenLt,fg:P.greenDk,n:"촬영",ic:"📷"},shopping:{bg:"#FFF8E1",fg:"#C8960A",n:"혼수",ic:"🛍️"},honeymoon:{bg:P.blueLt,fg:P.blueDk,n:"신혼여행",ic:"✈️"},ceremony:{bg:P.periLt,fg:P.periDk,n:"예식",ic:"💒"},flower:{bg:"#FCE4EC",fg:"#C62850",n:"부케·꽃",ic:"💐"},family:{bg:P.greenLt,fg:"#5D6E3A",n:"혼주",ic:"👨‍👩‍👧"},etc:{bg:"#F0F0F0",fg:"#707080",n:"기타",ic:"📌"}};
const TIPS={"2026-02/2026-04":["💡 웨딩홀은 견적서를 서면으로 꼭 받아오세요","💡 스드메 3곳 이상 비교하면 가성비 파악에 좋아요","💡 예물 반지는 금값이 오르니 빨리 결정이 유리해요","💡 상견례 전 양가와 날짜·예산을 미리 조율해두세요"],"2026-04/2026-05":["💡 드레스 투어 시 메모 준비하세요","💡 드레스 지정이 투어보다 20~40만원 저렴할 수 있어요","💡 평일 방문하면 더 다양한 드레스를 볼 수 있어요"],"2026-06/2026-07":["💡 촬영가봉 때 악세서리도 함께 매칭해보세요","💡 신랑 예복 맞춤은 촬영 3개월 전까지!"],"2026-09/2026-10":["💡 촬영 전날 충분히 수면, 야식 피하세요","💡 촬영 당일 누드톤 속옷 준비하세요"],"2026-11/2026-12":["💡 앨범 페이지 추가 3.3만원/장","💡 모바일 청첩장은 결혼 6~8주 전 발송"],"2026-11/2027-01":["💡 신혼집 입주와 결혼식 일정을 맞춰 계획하세요","💡 축가는 최소 2개월 전에 미리 부탁하세요"],"2027-01/2027-03":["💡 본식 가봉은 플래너 동행이 중요!","💡 식순표 사회자와 공유, MR USB 준비"],"2027-04/2027-05":["💍 결혼 전날 편지를 교환해보세요","💍 비상키트: 바늘, 테이프, 진통제, 여분 스타킹"]};

function fresh(){return{groomName:"",brideName:"",weddingDate:"",weddingTime:"12:00",email:"",checklist:JSON.parse(JSON.stringify(CL)).map(p=>({...p,items:p.items.map(i=>({...i,done:false,memo:""}))})),budget:[],vendors:[],keyDates:[],sdm:[]};}
function getDday(d){if(!d)return null;const t=new Date();t.setHours(0,0,0,0);const w=new Date(d);w.setHours(0,0,0,0);return Math.ceil((w-t)/864e5);}
function fmtDate(d){if(!d)return"";const o=new Date(d),w=["일","월","화","수","목","금","토"];return o.getFullYear()+"년 "+(o.getMonth()+1)+"월 "+o.getDate()+"일 ("+w[o.getDay()]+")";}
function fmtW(n){return n.toLocaleString("ko-KR")+"원";}
function pSt(p){const n=new Date(),x=p.split("/"),s=x[0].split("-").map(Number),e=x[1].split("-").map(Number);return n<new Date(s[0],s[1]-1,1)?"upcoming":n>new Date(e[0],e[1],0)?"past":"current";}
function pLbl(p){const x=p.split("/"),s=x[0].split("-").map(Number),e=x[1].split("-").map(Number);return(s[0]%100)+"년 "+s[1]+"~"+e[1]+"월";}
function mB(p,wd){if(!wd)return"";const e=p.split("/")[1].split("-").map(Number),d=new Date(wd),diff=(d.getFullYear()-e[0])*12+(d.getMonth()-(e[1]-1));return diff<=0?"결혼 당월":"결혼 "+diff+"개월 전";}
function dln(p){const e=p.split("/")[1].split("-").map(Number),d=new Date(e[0],e[1],0),w=["일","월","화","수","목","금","토"];return d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate()+"("+w[d.getDay()]+")";}
function cTips(cl){const c=cl.find(p=>pSt(p.period)==="current")||cl.find(p=>pSt(p.period)==="upcoming");if(!c)return["🎉 모든 준비 완료!"];return TIPS[c.period]||["💡 차근차근 준비해보세요!"];}
function Bg({cat,customName}){const c=CAT[cat];if(c)return<span style={{padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:600,background:c.bg,color:c.fg,whiteSpace:"nowrap"}}>{c.ic} {c.n}</span>;return<span style={{padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:600,background:P.blueLt,color:P.blueDk,whiteSpace:"nowrap"}}>✏️ {customName||"직접추가"}</span>;}

function Modal({title,open,onClose,children}){if(!open)return null;return<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(40,50,70,0.3)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={onClose}><div className="modal-inner" style={{background:"#fff",borderRadius:24,padding:"32px 28px",maxWidth:520,width:"100%",boxShadow:"0 24px 64px rgba(60,80,120,0.12)",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h3 style={{fontSize:20,fontWeight:700,color:P.text,margin:0}}>{title}</h3><button onClick={onClose} style={{background:P.periLt,border:"none",width:40,height:40,borderRadius:12,fontSize:18,color:P.periDk,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div>{children}</div></div>;}
const MI={padding:"14px 16px",border:"1.5px solid "+P.border,borderRadius:12,fontSize:16,outline:"none",fontFamily:FONT,color:P.text,background:"#FAFCF8",boxSizing:"border-box",width:"100%"};
function DlB({onClick}){return<button onClick={onClick} style={{padding:"10px 16px",background:P.periLt,border:"none",borderRadius:10,fontSize:13,fontWeight:600,color:P.periDk,cursor:"pointer",fontFamily:FONT}}>📥 엑셀</button>;}
function Toast({msg,show}){return<div style={{position:"fixed",bottom:show?30:-60,left:"50%",transform:"translateX(-50%)",background:P.periDk,color:"#fff",padding:"12px 28px",borderRadius:14,fontSize:14,fontWeight:600,fontFamily:FONT,boxShadow:"0 8px 24px rgba(91,126,174,0.2)",transition:"bottom 0.3s",zIndex:200}}>{msg}</div>;}

/* ═══ LOGIN ═══ */
function LoginScreen({onLogin}){
  const[key,setKey]=useState("");const[isNew,setIsNew]=useState(false);const[err,setErr]=useState("");const[busy,setBusy]=useState(false);
  const tryLogin=async()=>{if(!key.trim()){setErr("키를 입력해주세요");return;}setBusy(true);const d=await dbLoad(key.trim());setBusy(false);if(d){onLogin(key.trim(),d);return;}setIsNew(true);setErr("");};
  const createNew=async()=>{setBusy(true);const d={...fresh(),isSetup:false};await dbSave(key.trim(),d);setBusy(false);onLogin(key.trim(),d);};
  return<div style={S.wrap}><Fl1 s={{width:150,top:-30,left:-30}}/><Fl3 s={{width:120,top:10,right:-15}}/><Fl2 s={{width:130,bottom:20,left:10}}/>
    <div style={S.lc}><div style={{fontSize:52,marginBottom:10}}>💍</div><h1 style={{fontSize:28,fontWeight:700,color:P.periDk,margin:"0 0 6px"}}>Wedding Planner</h1><p style={{fontSize:15,color:P.textSub,margin:"0 0 32px",lineHeight:1.8}}>커플 키를 입력하면<br/>우리만의 결혼 준비 공간이 열려요</p>
      <div style={{textAlign:"left",maxWidth:340,margin:"0 auto"}}><label style={S.lbl}>커플 키</label><input style={{...MI,fontSize:17,padding:"16px 18px"}} placeholder="예: jm-sk-2027" value={key} onChange={e=>{setKey(e.target.value);setIsNew(false);setErr("");}} onKeyDown={e=>{if(e.key==="Enter")tryLogin();}}/>
        <p style={{fontSize:13,color:P.textMuted,margin:"10px 0 0",lineHeight:1.7}}>처음이면 원하는 키를 만드세요. 어디서든 같은 키면 기록이 있어요.</p>
        {err&&<p style={{color:"#D32F2F",fontSize:14,margin:"8px 0 0"}}>{err}</p>}
        {isNew?<div style={{marginTop:24,padding:24,background:`linear-gradient(135deg,${P.greenBg},${P.blueBg})`,borderRadius:18,textAlign:"center"}}><p style={{fontSize:16,color:P.text,margin:"0 0 16px"}}>✨ <b>"{key}"</b>는 새로운 키예요!</p><button style={{...S.btn,width:"100%"}} onClick={createNew} disabled={busy}>{busy?"생성 중...":"새로 시작하기 🌷"}</button></div>:<button style={{...S.btn,width:"100%",marginTop:24}} onClick={tryLogin} disabled={busy}>{busy?"확인 중...":"들어가기 →"}</button>}
      </div></div></div>;
}
function SetupScreen({data,setData}){
  const[f,setF]=useState({groomName:"",brideName:"",weddingDate:"",weddingTime:"12:00",email:""});
  const go=()=>{if(!f.groomName||!f.brideName||!f.weddingDate)return;setData({...data,...f,isSetup:true});};const ok=f.groomName&&f.brideName&&f.weddingDate;
  return<div style={S.wrap}><Fl1 s={{width:130,top:-20,left:-20}}/><Fl3 s={{width:95,top:15,right:5}}/>
    <div style={{...S.lc,maxWidth:480}}><div style={{fontSize:48,marginBottom:8}}>💐</div><h1 style={{fontSize:26,fontWeight:700,color:P.periDk,margin:"0 0 28px"}}>두 사람의 정보</h1>
      <div style={{display:"flex",flexDirection:"column",gap:18,textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{flex:1,minWidth:0}}><label style={S.lbl}>신랑 🌿</label><input style={MI} value={f.groomName} onChange={e=>setF({...f,groomName:e.target.value})} placeholder="이름"/></div><div style={{fontSize:24,color:P.peri,flexShrink:0,paddingTop:22}}>♥</div><div style={{flex:1,minWidth:0}}><label style={S.lbl}>신부 🌻</label><input style={MI} value={f.brideName} onChange={e=>setF({...f,brideName:e.target.value})} placeholder="이름"/></div></div>
        <div style={{display:"flex",gap:12}}><div style={{flex:1,minWidth:0}}><label style={S.lbl}>결혼 예정일</label><input type="date" style={MI} value={f.weddingDate} onChange={e=>setF({...f,weddingDate:e.target.value})}/></div><div style={{flex:1,minWidth:0}}><label style={S.lbl}>예식 시간</label><input type="time" style={MI} value={f.weddingTime} onChange={e=>setF({...f,weddingTime:e.target.value})}/></div></div>
        <button style={{...S.btn,width:"100%",opacity:ok?1:0.4}} onClick={go} disabled={!ok}>시작하기 🌷</button>
      </div></div></div>;
}

/* ═══ DASHBOARD ═══ */
function Dash({data,setTab}){
  const dd=getDday(data.weddingDate),tot=data.checklist.reduce((s,p)=>s+p.items.length,0),dn=data.checklist.reduce((s,p)=>s+p.items.filter(i=>i.done).length,0),pct=tot>0?Math.round(dn/tot*100):0;
  const bT=data.budget.reduce((s,b)=>s+(b.unitPrice||0)*(b.qty||0),0),bP=data.budget.reduce((s,b)=>s+(b.paid||0),0);
  const cur=data.checklist.find(p=>pSt(p.period)==="current")||data.checklist.find(p=>pSt(p.period)==="upcoming");
  const todo=cur?cur.items.filter(i=>!i.done):[];const tips=cTips(data.checklist);
  const upcoming=(data.keyDates||[]).filter(d=>new Date(d.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3);
  return<div style={{display:"flex",flexDirection:"column",gap:22}}>
    <div style={S.dday}><Fl1 s={{width:160,top:-35,left:-25}}/><Fl3 s={{width:120,top:0,right:-15}}/><Fl2 s={{width:140,bottom:-20,right:40}}/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{fontSize:12,fontWeight:600,color:P.periDk,letterSpacing:3,marginBottom:14,opacity:0.5}}>OUR WEDDING</div>
        <div className="couple-names" style={{display:"flex",justifyContent:"center",gap:32,marginBottom:16}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:12,color:P.blueDk,fontWeight:600,marginBottom:4}}>신랑</div><div style={{fontSize:22,fontWeight:700,color:P.periDk}}>{data.groomName}</div></div>
          <div style={{fontSize:28,color:P.lav,alignSelf:"center"}}>♥</div>
          <div style={{textAlign:"center"}}><div style={{fontSize:12,color:P.blueDk,fontWeight:600,marginBottom:4}}>신부</div><div style={{fontSize:22,fontWeight:700,color:P.periDk}}>{data.brideName}</div></div>
        </div>
        <div className="dday-num" style={{fontSize:72,fontWeight:800,color:P.periDk,lineHeight:1,opacity:0.8}}>{dd>0?"D-"+dd:dd===0?"D-Day 🎉":"D+"+Math.abs(dd)}</div>
        <div style={{fontSize:16,color:P.blueDk,marginTop:14,fontWeight:500}}>{fmtDate(data.weddingDate)} {data.weddingTime}</div>
      </div></div>
    <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <div style={{...S.card,background:`linear-gradient(135deg,${P.greenBg},${P.greenLt})`}}><div style={{fontSize:13,fontWeight:700,color:P.greenDk,marginBottom:14}}>📊 진행률</div><div style={{height:12,background:"rgba(255,255,255,0.6)",borderRadius:6,overflow:"hidden",marginBottom:14}}><div style={{height:"100%",background:`linear-gradient(90deg,${P.green},${P.blue})`,borderRadius:6,width:pct+"%",transition:"width 0.5s"}}/></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:36,fontWeight:800,color:P.greenDk}}>{pct}%</span><span style={{fontSize:15,color:P.greenDk,opacity:0.7,alignSelf:"flex-end"}}>{dn}/{tot}</span></div></div>
      <div style={{...S.card,background:`linear-gradient(135deg,${P.lavBg},${P.lavLt})`}}><div style={{fontSize:13,fontWeight:700,color:P.lavDk,marginBottom:14}}>💰 예산</div><div style={{fontSize:28,fontWeight:800,color:P.lavDk,marginBottom:6}}>{fmtW(bT)}</div><div style={{fontSize:15,color:P.lav}}>지출 {fmtW(bP)}</div><div style={{fontSize:15,color:P.greenDk,fontWeight:700}}>잔여 {fmtW(bT-bP)}</div></div>
    </div>
    <div style={{...S.card,background:`linear-gradient(135deg,${P.blueBg},${P.blueLt})`,border:"1px solid "+P.blue+"40"}}><div style={{fontSize:13,fontWeight:700,color:P.blueDk,marginBottom:14}}>🤖 결혼 준비 Tip</div>{tips.map((t,i)=><div key={i} style={{fontSize:15,color:P.text,lineHeight:1.9,padding:"5px 0"}}>{t}</div>)}</div>
    {upcoming.length>0&&<div style={S.card}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div style={{fontSize:13,fontWeight:700,color:P.periDk}}>📌 다가오는 일정</div><button style={S.lnk} onClick={()=>setTab("dates")}>전체 →</button></div>{upcoming.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:P.greenBg,borderRadius:14,marginBottom:8}}><span style={{fontWeight:600,fontSize:15,color:P.text}}>{d.name}</span><span style={{fontSize:14,color:P.periDk,fontWeight:600}}>{fmtDate(d.date)}</span></div>)}</div>}
    <div style={S.card}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:13,fontWeight:700,color:P.periDk}}>{cur?(cur.emoji+" 지금 할 일 — "+cur.label):"완료!"}</div>{cur&&<button style={S.lnk} onClick={()=>setTab("checklist")}>전체 →</button>}</div>{cur&&<div style={{fontSize:14,color:P.textSub,marginBottom:16}}>📅 {pLbl(cur.period)} · {mB(cur.period,data.weddingDate)}</div>}{todo.slice(0,6).map(item=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:P.greenBg,borderRadius:14,marginBottom:8,flexWrap:"wrap"}}><Bg cat={item.cat} customName={item.customCatName}/><span style={{fontSize:15,color:P.text}}>{item.text}</span></div>)}{todo.length>6&&<div style={{fontSize:14,color:P.textMuted,textAlign:"center"}}>외 {todo.length-6}개</div>}</div>
  </div>;
}

/* ═══ CALENDAR ═══ */
function CalTab({data}){
  const[year,setYear]=useState(()=>new Date().getFullYear());const[month,setMonth]=useState(()=>new Date().getMonth());
  const prev=()=>{if(month===0){setMonth(11);setYear(year-1);}else setMonth(month-1);};
  const next=()=>{if(month===11){setMonth(0);setYear(year+1);}else setMonth(month+1);};
  const today=new Date();today.setHours(0,0,0,0);const firstDay=new Date(year,month,1).getDay();const dim=new Date(year,month+1,0).getDate();
  const days=[];for(let i=0;i<firstDay;i++)days.push(null);for(let i=1;i<=dim;i++)days.push(i);
  const events={};
  (data.keyDates||[]).forEach(d=>{const dt=new Date(d.date);if(dt.getFullYear()===year&&dt.getMonth()===month){const day=dt.getDate();if(!events[day])events[day]=[];events[day].push({name:d.name,color:P.periDk});}});
  data.checklist.forEach(ph=>{const e=ph.period.split("/")[1].split("-").map(Number);const end=new Date(e[0],e[1],0);if(end.getFullYear()===year&&end.getMonth()===month){const day=end.getDate();if(!events[day])events[day]=[];events[day].push({name:ph.emoji+" "+ph.label+" 마감",color:P.blueDk});}});
  if(data.weddingDate){const wd=new Date(data.weddingDate);if(wd.getFullYear()===year&&wd.getMonth()===month){const day=wd.getDate();if(!events[day])events[day]=[];events[day].unshift({name:"💍 결혼식",color:"#E91E63"});}}
  const mn=["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  const dn2=["일","월","화","수","목","금","토"];
  return<div style={S.tab}><h2 style={S.th}>📅 캘린더</h2>
    <div style={S.card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><button onClick={prev} style={S.calNav}>◀</button><div style={{fontSize:20,fontWeight:700,color:P.periDk}}>{year}년 {mn[month]}</div><button onClick={next} style={S.calNav}>▶</button></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>{dn2.map((d,i)=><div key={d} style={{textAlign:"center",fontSize:13,fontWeight:700,color:i===0?"#E57373":i===6?P.blueDk:P.textSub,padding:"8px 0"}}>{d}</div>)}{days.map((d,i)=>{const ev=d?events[d]:null;const td=d&&today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;return<div key={i} style={{minHeight:68,padding:4,borderRadius:12,background:td?P.periLt:ev?"#FAFCF8":"transparent",border:td?"2px solid "+P.peri:"1px solid transparent"}}>{d&&<div style={{fontSize:14,fontWeight:td?700:500,color:td?P.periDk:i%7===0?"#E57373":P.text,textAlign:"center",marginBottom:2}}>{d}</div>}{ev&&ev.slice(0,2).map((e,j)=><div key={j} style={{fontSize:10,fontWeight:600,color:"#fff",background:e.color,borderRadius:6,padding:"2px 4px",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</div>)}{ev&&ev.length>2&&<div style={{fontSize:9,color:P.textMuted,textAlign:"center"}}>+{ev.length-2}</div>}</div>;})}
      </div></div>
    <div style={{...S.card,marginTop:16}}><div style={{fontSize:13,fontWeight:700,color:P.periDk,marginBottom:10}}>이번 달 일정</div>{Object.keys(events).length===0&&<div style={{fontSize:14,color:P.textMuted}}>이번 달에는 일정이 없어요</div>}{Object.entries(events).sort((a,b)=>Number(a[0])-Number(b[0])).map(([day,evs])=>evs.map((e,j)=><div key={day+"-"+j} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid "+P.border+"60"}}><div style={{width:8,height:8,borderRadius:4,background:e.color,flexShrink:0}}/><span style={{fontSize:14,color:P.textSub,fontWeight:600,minWidth:40}}>{month+1}/{day}</span><span style={{fontSize:14,color:P.text}}>{e.name}</span></div>))}</div>
  </div>;
}

/* ═══ CHECKLIST ═══ */
function CLTab({data,setData}){
  const[memoId,setMemoId]=useState(null);const[memoTxt,setMemoTxt]=useState("");
  const[addPi,setAddPi]=useState(null);const[addF,setAddF]=useState({text:"",cat:"etc",customCatName:"",note:""});
  const toggle=(pi,id)=>{const nc=data.checklist.map((p,i)=>i!==pi?p:{...p,items:p.items.map(it=>it.id===id?{...it,done:!it.done}:it)});setData({...data,checklist:nc});};
  const openMemo=(pi,item)=>{setMemoId({pi,id:item.id});setMemoTxt(item.memo||"");};
  const saveMemo=()=>{if(!memoId)return;const nc=data.checklist.map((p,i)=>i!==memoId.pi?p:{...p,items:p.items.map(it=>it.id===memoId.id?{...it,memo:memoTxt}:it)});setData({...data,checklist:nc});setMemoId(null);};
  const addItem=()=>{if(!addF.text||addPi===null)return;const isCustomCat=addF.cat==="__custom__";const nc=data.checklist.map((p,i)=>i!==addPi?p:{...p,items:[...p.items,{id:"c"+Date.now(),text:addF.text,cat:isCustomCat?"__custom__":addF.cat,customCatName:isCustomCat?addF.customCatName:"",note:addF.note,done:false,memo:"",custom:true}]});setData({...data,checklist:nc});setAddPi(null);setAddF({text:"",cat:"etc",customCatName:"",note:""});};
  const rmItem=(pi,id)=>{if(!confirm("삭제할까요?"))return;const nc=data.checklist.map((p,i)=>i!==pi?p:{...p,items:p.items.filter(it=>it.id!==id)});setData({...data,checklist:nc});};
  const dlCL=()=>{const rows=[];data.checklist.forEach(ph=>{ph.items.forEach(i=>{const cn=CAT[i.cat]?CAT[i.cat].n:(i.customCatName||"직접추가");rows.push([ph.label,pLbl(ph.period),cn,i.text,i.done?"완료":"미완료",i.note||"",i.memo||""]);});});dlCSV("체크리스트",["단계","시기","카테고리","항목","상태","메모1","메모2"],rows);};

  return<div style={S.tab}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:8}}><h2 style={{...S.th,margin:0}}>🌿 체크리스트</h2><DlB onClick={dlCL}/></div>
    <Modal title="메모 작성" open={memoId!==null} onClose={()=>setMemoId(null)}>
      <div style={{marginBottom:20}}><label style={S.lbl}>메모</label><textarea style={{...MI,minHeight:120,resize:"vertical",lineHeight:1.7}} placeholder="자유롭게 적어주세요..." value={memoTxt} onChange={e=>setMemoTxt(e.target.value)}/></div>
      <button style={{...S.btn,width:"100%"}} onClick={saveMemo}>저장하기</button>
    </Modal>
    <Modal title="항목 추가" open={addPi!==null} onClose={()=>setAddPi(null)}>
      <div style={{marginBottom:20}}><label style={S.lbl}>할 일</label><input style={MI} placeholder="예: 피부관리 시작" value={addF.text} onChange={e=>setAddF({...addF,text:e.target.value})}/></div>
      <div style={{marginBottom:20}}><label style={S.lbl}>카테고리</label><select style={MI} value={addF.cat} onChange={e=>setAddF({...addF,cat:e.target.value})}>{Object.entries(CAT).map(([k,c])=><option key={k} value={k}>{c.ic} {c.n}</option>)}<option value="__custom__">✏️ 직접 입력</option></select></div>
      {addF.cat==="__custom__"&&<div style={{marginBottom:20}}><label style={S.lbl}>카테고리명 입력</label><input style={MI} placeholder="예: 피부관리, 다이어트" value={addF.customCatName} onChange={e=>setAddF({...addF,customCatName:e.target.value})}/></div>}
      <div style={{marginBottom:20}}><label style={S.lbl}>참고사항 (선택)</label><input style={MI} placeholder="메모" value={addF.note} onChange={e=>setAddF({...addF,note:e.target.value})}/></div>
      <button style={{...S.btn,width:"100%"}} onClick={addItem}>추가하기</button>
    </Modal>
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {data.checklist.map((ph,pi)=>{const st=pSt(ph.period),allD=ph.items.every(i=>i.done),dc=ph.items.filter(i=>i.done).length;
        const cg={};ph.items.forEach(it=>{const key=it.cat==="__custom__"?(it.customCatName||"직접추가"):it.cat;if(!cg[key])cg[key]={cat:it.cat,customCatName:it.customCatName,items:[]};cg[key].items.push(it);});
        return<div key={pi} style={{...S.card,borderLeft:"4px solid "+(st==="current"?P.blue:st==="past"?P.blueLt:"#E0E0E0"),padding:"24px 22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",background:allD?P.green:st==="current"?P.blue:"#E0E0E0"}}>{allD?"✓":""}</span><span style={{fontSize:18,fontWeight:700,color:P.text}}>{ph.emoji} {ph.label}</span><span style={{fontSize:14,color:P.textMuted}}>{dc}/{ph.items.length}</span></div>
            <div style={{display:"flex",gap:8}}>{st==="current"&&<span style={{padding:"5px 14px",borderRadius:10,fontSize:12,fontWeight:700,background:P.blueLt,color:P.blueDk}}>현재</span>}<button style={{...S.ebtn,fontSize:12,padding:"5px 12px"}} onClick={()=>{setAddF({text:"",cat:"etc",customCatName:"",note:""});setAddPi(pi);}}>+ 추가</button></div>
          </div>
          <div style={{fontSize:13,color:P.textSub,marginBottom:18,paddingLeft:38}}>📅 {pLbl(ph.period)} · {mB(ph.period,data.weddingDate)} · 기한 {dln(ph.period)}</div>
          {Object.entries(cg).map(([key,group])=>{const c=CAT[group.cat];const label=c?`${c.ic} ${c.n}`:`✏️ ${group.customCatName||key}`;const clr=c?c.fg:P.blueDk;return<div key={key} style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:clr,marginBottom:8,paddingLeft:4}}>{label}</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {group.items.map(item=><div key={item.id} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",borderRadius:14,background:item.done?"#F8F8F8":P.greenBg,opacity:item.done?0.4:1,border:"1px solid "+(item.done?"#F0F0F0":P.border)}}>
                <div style={{width:26,height:26,borderRadius:8,border:"2px solid "+(item.done?P.green:P.peri),background:item.done?P.green:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0,cursor:"pointer"}} onClick={()=>toggle(pi,item.id)}>{item.done?"✓":""}</div>
                <div style={{flex:1,cursor:"pointer",minWidth:0}} onClick={()=>openMemo(pi,item)}>
                  <span style={{textDecoration:item.done?"line-through":"none",fontSize:15,color:P.text}}>{item.text}</span>
                  {item.note&&<div style={{fontSize:13,color:P.textMuted,marginTop:4}}>💡 {item.note}</div>}
                  {item.memo&&<div style={{fontSize:13,color:P.periDk,marginTop:4,background:P.periLt,padding:"6px 10px",borderRadius:8}}>📝 {item.memo}</div>}
                  {!item.memo&&!item.done&&<div style={{fontSize:12,color:"#D0D0D8",marginTop:4}}>클릭하여 메모 추가</div>}
                </div>
                {item.custom&&<button style={{...S.dbtn,fontSize:16}} onClick={()=>rmItem(pi,item.id)}>✕</button>}
              </div>)}
            </div>
          </div>;})}
        </div>;})}
    </div>
  </div>;
}

/* ═══ 스드메 비교 ═══ */
const SDM_TYPES=[{id:"studio",label:"📷 스튜디오",color:P.greenDk},{id:"dress",label:"👗 드레스",color:"#C62860"},{id:"makeup",label:"💄 메이크업",color:"#B0408A"}];

function SdmTab({data,setData}){
  const[show,setShow]=useState(false);const[editId,setEditId]=useState(null);const[viewPhotos,setViewPhotos]=useState(null);
  const[f,setF]=useState({name:"",type:"studio",price:"",insta:"",website:"",memo:"",photos:[]});
  const[ef,setEf]=useState({name:"",type:"studio",price:"",insta:"",website:"",memo:"",photos:[]});
  const sdm=data.sdm||[];

  const handlePhoto=(setter,vals)=>async(e)=>{const files=Array.from(e.target.files);const newPhotos=[...vals.photos];for(const file of files.slice(0,10-newPhotos.length)){const reader=new FileReader();const b64=await new Promise(r=>{reader.onload=()=>r(reader.result);reader.readAsDataURL(file);});
    // Compress
    const img=new Image();const compressed=await new Promise(r=>{img.onload=()=>{const canvas=document.createElement("canvas");const max=400;let w=img.width,h=img.height;if(w>max){h=h*(max/w);w=max;}if(h>max){w=w*(max/h);h=max;}canvas.width=w;canvas.height=h;canvas.getContext("2d").drawImage(img,0,0,w,h);r(canvas.toDataURL("image/jpeg",0.6));};img.src=b64;});
    newPhotos.push(compressed);}setter({...vals,photos:newPhotos});e.target.value="";};
  const rmPhoto=(setter,vals,idx)=>{const np=[...vals.photos];np.splice(idx,1);setter({...vals,photos:np});};

  const add=()=>{if(!f.name)return;setData({...data,sdm:[...sdm,{id:Date.now().toString(),...f}]});setF({name:"",type:"studio",price:"",insta:"",website:"",memo:"",photos:[]});setShow(false);};
  const rm=id=>{if(confirm("삭제할까요?"))setData({...data,sdm:sdm.filter(v=>v.id!==id)});};
  const openEd=item=>{setEditId(item.id);setEf({name:item.name,type:item.type,price:item.price||"",insta:item.insta||"",website:item.website||"",memo:item.memo||"",photos:item.photos||[]});};
  const saveEd=()=>{setData({...data,sdm:sdm.map(v=>v.id===editId?{...v,...ef}:v)});setEditId(null);};

  const sdmFields=(v,sv)=><>
    <div style={{marginBottom:20}}><label style={S.lbl}>업체명</label><input style={MI} placeholder="예: 보네르스포사" value={v.name} onChange={e=>sv({...v,name:e.target.value})}/></div>
    <div style={{marginBottom:20}}><label style={S.lbl}>분류</label><select style={MI} value={v.type} onChange={e=>sv({...v,type:e.target.value})}>{SDM_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
    <div style={{marginBottom:20}}><label style={S.lbl}>가격대</label><input style={MI} placeholder="예: 180~250만원" value={v.price} onChange={e=>sv({...v,price:e.target.value})}/></div>
    <div style={{marginBottom:20}}><label style={S.lbl}>인스타그램 (선택)</label><input style={MI} placeholder="https://instagram.com/..." value={v.insta} onChange={e=>sv({...v,insta:e.target.value})}/></div>
    <div style={{marginBottom:20}}><label style={S.lbl}>홈페이지 (선택)</label><input style={MI} placeholder="https://..." value={v.website} onChange={e=>sv({...v,website:e.target.value})}/></div>
    <div style={{marginBottom:20}}><label style={S.lbl}>메모</label><textarea style={{...MI,minHeight:80,resize:"vertical"}} placeholder="분위기, 장단점, 특이사항 등" value={v.memo} onChange={e=>sv({...v,memo:e.target.value})}/></div>
    <div style={{marginBottom:20}}><label style={S.lbl}>사진 첨부 (최대 10장)</label><input type="file" accept="image/*" multiple onChange={handlePhoto(sv,v)} style={{fontSize:14,fontFamily:FONT}}/>
      {v.photos.length>0&&<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>{v.photos.map((p,i)=><div key={i} style={{position:"relative",width:80,height:80,borderRadius:10,overflow:"hidden",border:"1px solid "+P.border}}><img src={p} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/><button onClick={()=>rmPhoto(sv,v,i)} style={{position:"absolute",top:2,right:2,background:"rgba(0,0,0,0.5)",color:"#fff",border:"none",borderRadius:6,width:20,height:20,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button></div>)}</div>}
    </div>
  </>;

  return<div style={S.tab}><h2 style={S.th}>💐 스드메 비교</h2>
    <button style={{...S.btn,width:"100%",marginBottom:22}} onClick={()=>{setF({name:"",type:"studio",price:"",insta:"",website:"",memo:"",photos:[]});setShow(true);}}>+ 업체 추가</button>
    <Modal title="스드메 업체 추가" open={show} onClose={()=>setShow(false)}>{sdmFields(f,setF)}<button style={{...S.btn,width:"100%"}} onClick={add}>추가하기</button></Modal>
    <Modal title="스드메 업체 수정" open={editId!==null} onClose={()=>setEditId(null)}>{sdmFields(ef,setEf)}<button style={{...S.btn,width:"100%"}} onClick={saveEd}>저장하기</button></Modal>
    {/* Photo viewer */}
    <Modal title="사진 보기" open={viewPhotos!==null} onClose={()=>setViewPhotos(null)}>
      {viewPhotos&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>{viewPhotos.map((p,i)=><img key={i} src={p} style={{width:"100%",borderRadius:12,border:"1px solid "+P.border}} alt=""/>)}</div>}
    </Modal>

    {SDM_TYPES.map(type=>{const items=sdm.filter(v=>v.type===type.id);return<div key={type.id} style={{marginBottom:28}}>
      <div style={{fontSize:18,fontWeight:700,color:type.color,marginBottom:14}}>{type.label}</div>
      {items.length===0&&<div style={{...S.card,textAlign:"center",padding:"32px 20px",color:P.textMuted,fontSize:15}}>아직 등록된 업체가 없어요</div>}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {items.map(item=><div key={item.id} style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div><div style={{fontSize:18,fontWeight:700,color:P.text,marginBottom:4}}>{item.name}</div>{item.price&&<div style={{fontSize:15,color:P.periDk,fontWeight:600}}>💰 {item.price}</div>}</div>
            <div style={{display:"flex",gap:8,flexShrink:0}}><button style={S.ebtn} onClick={()=>openEd(item)}>수정</button><button style={S.dbtn} onClick={()=>rm(item.id)}>✕</button></div>
          </div>
          {/* Search buttons */}
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            <a href={"https://www.instagram.com/explore/tags/"+encodeURIComponent(item.name)} target="_blank" rel="noopener" style={{padding:"8px 14px",background:"linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,textDecoration:"none"}}>📸 인스타 검색</a>
            <a href={"https://search.naver.com/search.naver?query="+encodeURIComponent(item.name+" 웨딩 후기")} target="_blank" rel="noopener" style={{padding:"8px 14px",background:"#03C75A",color:"#fff",borderRadius:10,fontSize:13,fontWeight:600,textDecoration:"none"}}>🔍 네이버 검색</a>
            {item.insta&&<a href={item.insta} target="_blank" rel="noopener" style={{padding:"8px 14px",background:P.periLt,color:P.periDk,borderRadius:10,fontSize:13,fontWeight:600,textDecoration:"none"}}>인스타 바로가기</a>}
            {item.website&&<a href={item.website} target="_blank" rel="noopener" style={{padding:"8px 14px",background:P.greenLt,color:P.greenDk,borderRadius:10,fontSize:13,fontWeight:600,textDecoration:"none"}}>홈페이지</a>}
          </div>
          {item.memo&&<div style={{fontSize:14,color:P.textSub,marginBottom:12,lineHeight:1.7}}>📝 {item.memo}</div>}
          {/* Photos */}
          {item.photos&&item.photos.length>0&&<div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",cursor:"pointer"}} onClick={()=>setViewPhotos(item.photos)}>
              {item.photos.slice(0,4).map((p,i)=><div key={i} style={{width:80,height:80,borderRadius:10,overflow:"hidden",border:"1px solid "+P.border,position:"relative"}}><img src={p} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>{i===3&&item.photos.length>4&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:16,fontWeight:700}}>+{item.photos.length-4}</div>}</div>)}
            </div>
            <div style={{fontSize:12,color:P.textMuted,marginTop:4}}>클릭하면 크게 볼 수 있어요</div>
          </div>}
        </div>)}
      </div>
    </div>;})}
  </div>;
}

/* ═══ BUDGET / DATES / VENDORS / SETTINGS (compact) ═══ */
function BudTab({data,setData}){
  const[show,setShow]=useState(false);const[editId,setEditId]=useState(null);
  const[f,setF]=useState({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});const[ef,setEf]=useState({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});
  const add=()=>{if(!f.name||!f.unitPrice)return;const u=parseInt(f.unitPrice)||0,q=parseInt(f.qty)||1;setData({...data,budget:[...data.budget,{id:Date.now().toString(),name:f.name,category:f.category,unitPrice:u,qty:q,amount:u*q,paid:parseInt(f.paid)||0}]});setF({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});setShow(false);};
  const rm=id=>{if(confirm("삭제?"))setData({...data,budget:data.budget.filter(b=>b.id!==id)});};
  const openEd=item=>{setEditId(item.id);setEf({name:item.name,category:item.category,unitPrice:String(item.unitPrice),qty:String(item.qty),paid:String(item.paid)});};
  const saveEd=()=>{const u=parseInt(ef.unitPrice)||0,q=parseInt(ef.qty)||1;setData({...data,budget:data.budget.map(b=>b.id===editId?{...b,name:ef.name,category:ef.category,unitPrice:u,qty:q,amount:u*q,paid:parseInt(ef.paid)||0}:b)});setEditId(null);};
  const t=data.budget.reduce((s,b)=>s+b.amount,0),tp=data.budget.reduce((s,b)=>s+b.paid,0);
  const gr={};data.budget.forEach(b=>{if(!gr[b.category])gr[b.category]={t:0,p:0};gr[b.category].t+=b.amount;gr[b.category].p+=b.paid;});
  const dlB=()=>{dlCSV("예산",["카테고리","항목","단가","수량","견적","지출","잔여"],data.budget.map(b=>[(CAT[b.category]||CAT.etc).n,b.name,b.unitPrice,b.qty,b.amount,b.paid,b.amount-b.paid]));};
  const addAmt=(parseInt(f.unitPrice)||0)*(parseInt(f.qty)||1);const edAmt=(parseInt(ef.unitPrice)||0)*(parseInt(ef.qty)||1);
  const budF=(v,sv,amt)=><><div style={{marginBottom:20}}><label style={S.lbl}>항목명</label><input style={MI} placeholder="예: 웨딩홀 대관료" value={v.name} onChange={e=>sv({...v,name:e.target.value})}/></div><div style={{marginBottom:20}}><label style={S.lbl}>카테고리</label><select style={MI} value={v.category} onChange={e=>sv({...v,category:e.target.value})}>{Object.entries(CAT).map(([k,c])=><option key={k} value={k}>{c.ic} {c.n}</option>)}</select></div><div style={{display:"flex",gap:12,marginBottom:20}}><div style={{flex:1}}><label style={S.lbl}>단가</label><input style={MI} type="number" placeholder="0" value={v.unitPrice} onChange={e=>sv({...v,unitPrice:e.target.value})}/></div><div style={{width:30,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:16,fontSize:20,color:P.textMuted}}>×</div><div style={{flex:1}}><label style={S.lbl}>수량</label><input style={MI} type="number" placeholder="1" value={v.qty} onChange={e=>sv({...v,qty:e.target.value})}/></div></div><div style={{background:`linear-gradient(135deg,${P.blueBg},${P.lavBg})`,borderRadius:16,padding:"18px 22px",marginBottom:20,textAlign:"center"}}><div style={{fontSize:13,color:P.periDk,fontWeight:600,marginBottom:4}}>견적 금액</div><div style={{fontSize:30,fontWeight:800,color:P.periDk}}>{fmtW(amt)}</div></div><div style={{marginBottom:20}}><label style={S.lbl}>지출액</label><input style={MI} type="number" placeholder="0" value={v.paid} onChange={e=>sv({...v,paid:e.target.value})}/></div></>;
  return<div style={S.tab}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:8}}><h2 style={{...S.th,margin:0}}>🌻 예산</h2><DlB onClick={dlB}/></div>
    <div className="budget-summary" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
      <div style={{...S.card,textAlign:"center",background:`linear-gradient(135deg,${P.blueBg},${P.blueLt})`}}><div style={{fontSize:13,color:P.blueDk,fontWeight:700,marginBottom:8}}>총 예산</div><div className="budget-num" style={{fontSize:28,fontWeight:800,color:P.blueDk}}>{fmtW(t)}</div></div>
      <div style={{...S.card,textAlign:"center",background:`linear-gradient(135deg,${P.lavBg},${P.lavLt})`}}><div style={{fontSize:13,color:P.lavDk,fontWeight:700,marginBottom:8}}>지출</div><div className="budget-num" style={{fontSize:28,fontWeight:800,color:P.lavDk}}>{fmtW(tp)}</div></div>
      <div style={{...S.card,textAlign:"center",background:`linear-gradient(135deg,${P.greenBg},${P.greenLt})`}}><div style={{fontSize:13,color:P.greenDk,fontWeight:700,marginBottom:8}}>잔여</div><div className="budget-num" style={{fontSize:28,fontWeight:800,color:P.greenDk}}>{fmtW(t-tp)}</div></div>
    </div>
    {Object.keys(gr).length>0&&<div style={{...S.card,marginBottom:22}}><div style={{fontSize:13,fontWeight:700,color:P.periDk,marginBottom:14}}>카테고리별</div>{Object.entries(gr).map(([k,g])=>{const c=CAT[k]||CAT.etc,pc=g.t>0?Math.round(g.p/g.t*100):0;return<div key={k} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><Bg cat={k}/><span style={{fontSize:14,color:P.text}}>{fmtW(g.p)} / {fmtW(g.t)}</span></div><div style={{height:10,background:P.greenBg,borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",background:c.fg,borderRadius:5,width:pc+"%",opacity:0.45}}/></div></div>;})}</div>}
    <button style={{...S.btn,width:"100%",marginBottom:22}} onClick={()=>{setF({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});setShow(true);}}>+ 예산 추가</button>
    <Modal title="예산 추가" open={show} onClose={()=>setShow(false)}>{budF(f,setF,addAmt)}<button style={{...S.btn,width:"100%"}} onClick={add}>추가</button></Modal>
    <Modal title="예산 수정" open={editId!==null} onClose={()=>setEditId(null)}>{budF(ef,setEf,edAmt)}<button style={{...S.btn,width:"100%"}} onClick={saveEd}>저장</button></Modal>
    {data.budget.length===0&&<div style={S.empty}>예산 항목을 추가해보세요 🌻</div>}
    {data.budget.map(item=>{const pp=item.amount>0?Math.round(item.paid/item.amount*100):0;return<div key={item.id} style={{...S.card,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:6}}><div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}><Bg cat={item.category}/><span style={{fontWeight:700,fontSize:16,color:P.text}}>{item.name}</span></div><div style={{display:"flex",gap:8}}><button style={S.ebtn} onClick={()=>openEd(item)}>수정</button><button style={S.dbtn} onClick={()=>rm(item.id)}>✕</button></div></div>
      <div style={{fontSize:15,color:P.textSub,marginBottom:10}}>{fmtW(item.unitPrice)} × {item.qty} = <b style={{color:P.text}}>{fmtW(item.amount)}</b></div>
      <div style={{height:10,background:P.greenBg,borderRadius:5,overflow:"hidden",marginBottom:10}}><div style={{height:"100%",background:`linear-gradient(90deg,${P.green},${P.blue})`,borderRadius:5,width:Math.min(pp,100)+"%"}}/></div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:14}}><span style={{color:P.lavDk}}>지출 {fmtW(item.paid)}</span><span style={{color:P.greenDk,fontWeight:700}}>잔여 {fmtW(item.amount-item.paid)}</span></div>
    </div>;})}
  </div>;
}

function DatesTab({data,setData}){
  const[show,setShow]=useState(false);const[editId,setEditId]=useState(null);const[f,setF]=useState({name:"",date:"",memo:""});const[ef,setEf]=useState({name:"",date:"",memo:""});
  const add=()=>{if(!f.name||!f.date)return;setData({...data,keyDates:[...(data.keyDates||[]),{id:Date.now().toString(),...f}]});setF({name:"",date:"",memo:""});setShow(false);};const rm=id=>{if(confirm("삭제?"))setData({...data,keyDates:(data.keyDates||[]).filter(d=>d.id!==id)});};const openEd=d=>{setEditId(d.id);setEf({name:d.name,date:d.date,memo:d.memo||""});};const saveEd=()=>{setData({...data,keyDates:(data.keyDates||[]).map(d=>d.id===editId?{...d,...ef}:d)});setEditId(null);};
  const sorted=[...(data.keyDates||[])].sort((a,b)=>new Date(a.date)-new Date(b.date));const today=new Date();today.setHours(0,0,0,0);
  const dlD=()=>{dlCSV("일정",["일정명","날짜","D-day","메모"],sorted.map(d=>[d.name,d.date,getDday(d.date),d.memo||""]));};
  const dtF=(v,sv)=><><div style={{marginBottom:20}}><label style={S.lbl}>일정명</label><input style={MI} placeholder="예: 상견례" value={v.name} onChange={e=>sv({...v,name:e.target.value})}/></div><div style={{marginBottom:20}}><label style={S.lbl}>날짜</label><input type="date" style={MI} value={v.date} onChange={e=>sv({...v,date:e.target.value})}/></div><div style={{marginBottom:20}}><label style={S.lbl}>메모</label><input style={MI} placeholder="장소 등" value={v.memo} onChange={e=>sv({...v,memo:e.target.value})}/></div></>;
  return<div style={S.tab}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:8}}><h2 style={{...S.th,margin:0}}>📌 일정</h2><DlB onClick={dlD}/></div>
    <button style={{...S.btn,width:"100%",marginBottom:22}} onClick={()=>{setF({name:"",date:"",memo:""});setShow(true);}}>+ 일정 추가</button>
    <Modal title="일정 추가" open={show} onClose={()=>setShow(false)}>{dtF(f,setF)}<button style={{...S.btn,width:"100%"}} onClick={add}>추가</button></Modal>
    <Modal title="일정 수정" open={editId!==null} onClose={()=>setEditId(null)}>{dtF(ef,setEf)}<button style={{...S.btn,width:"100%"}} onClick={saveEd}>저장</button></Modal>
    {sorted.length===0&&<div style={S.empty}>일정을 추가해보세요 📌</div>}
    {sorted.map(d=>{const dd=getDday(d.date);return<div key={d.id} style={{...S.card,marginBottom:12,opacity:new Date(d.date)<today?0.45:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{flex:1,cursor:"pointer"}} onClick={()=>openEd(d)}><div style={{fontSize:17,fontWeight:700,color:P.text}}>{d.name}</div><div style={{fontSize:15,color:P.periDk,marginTop:4}}>{fmtDate(d.date)} {dd>0?"(D-"+dd+")":dd===0?"(오늘!)":"(지남)"}</div>{d.memo&&<div style={{fontSize:14,color:P.textSub,marginTop:4}}>📝 {d.memo}</div>}</div><div style={{display:"flex",gap:8,flexShrink:0}}><button style={S.ebtn} onClick={()=>openEd(d)}>수정</button><button style={S.dbtn} onClick={()=>rm(d.id)}>✕</button></div></div>;})}
  </div>;
}

function VenTab({data,setData}){
  const[show,setShow]=useState(false);const[editId,setEditId]=useState(null);const[f,setF]=useState({name:"",category:"venue",phone:"",memo:""});const[ef,setEf]=useState({name:"",category:"venue",phone:"",memo:""});
  const add=()=>{if(!f.name)return;setData({...data,vendors:[...data.vendors,{id:Date.now().toString(),...f}]});setF({name:"",category:"venue",phone:"",memo:""});setShow(false);};const rm=id=>{if(confirm("삭제?"))setData({...data,vendors:data.vendors.filter(v=>v.id!==id)});};const openEd=v=>{setEditId(v.id);setEf({name:v.name,category:v.category,phone:v.phone||"",memo:v.memo||""});};const saveEd=()=>{setData({...data,vendors:data.vendors.map(v=>v.id===editId?{...v,...ef}:v)});setEditId(null);};
  const dlV=()=>{dlCSV("업체",["카테고리","업체명","연락처","메모"],data.vendors.map(v=>[(CAT[v.category]||CAT.etc).n,v.name,v.phone||"",v.memo||""]));};
  const vnF=(v,sv)=><><div style={{marginBottom:20}}><label style={S.lbl}>업체명</label><input style={MI} placeholder="업체명" value={v.name} onChange={e=>sv({...v,name:e.target.value})}/></div><div style={{marginBottom:20}}><label style={S.lbl}>카테고리</label><select style={MI} value={v.category} onChange={e=>sv({...v,category:e.target.value})}>{Object.entries(CAT).map(([k,c])=><option key={k} value={k}>{c.ic} {c.n}</option>)}</select></div><div style={{marginBottom:20}}><label style={S.lbl}>연락처</label><input style={MI} placeholder="010-0000-0000" value={v.phone} onChange={e=>sv({...v,phone:e.target.value})}/></div><div style={{marginBottom:20}}><label style={S.lbl}>메모</label><input style={MI} placeholder="담당자 등" value={v.memo} onChange={e=>sv({...v,memo:e.target.value})}/></div></>;
  return<div style={S.tab}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:8}}><h2 style={{...S.th,margin:0}}>📇 업체</h2><DlB onClick={dlV}/></div>
    <button style={{...S.btn,width:"100%",marginBottom:22}} onClick={()=>{setF({name:"",category:"venue",phone:"",memo:""});setShow(true);}}>+ 업체 추가</button>
    <Modal title="업체 추가" open={show} onClose={()=>setShow(false)}>{vnF(f,setF)}<button style={{...S.btn,width:"100%"}} onClick={add}>추가</button></Modal>
    <Modal title="업체 수정" open={editId!==null} onClose={()=>setEditId(null)}>{vnF(ef,setEf)}<button style={{...S.btn,width:"100%"}} onClick={saveEd}>저장</button></Modal>
    <div className="vendor-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
      {data.vendors.length===0&&<div style={S.empty}>업체를 추가해보세요 📇</div>}
      {data.vendors.map(v=><div key={v.id} style={{...S.card,background:P.greenBg}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><Bg cat={v.category}/><div style={{display:"flex",gap:6}}><button style={S.ebtn} onClick={()=>openEd(v)}>수정</button><button style={S.dbtn} onClick={()=>rm(v.id)}>✕</button></div></div><div style={{fontWeight:700,fontSize:17,color:P.text,marginBottom:6}}>{v.name}</div>{v.phone&&<div style={{fontSize:15,color:P.blueDk}}>📞 {v.phone}</div>}{v.memo&&<div style={{fontSize:14,color:P.textSub,marginTop:6}}>📝 {v.memo}</div>}</div>)}
    </div>
  </div>;
}

function SetTab({data,setData,coupleKey,onLogout,onRefresh}){
  const[f,setF]=useState({groomName:data.groomName,brideName:data.brideName,weddingDate:data.weddingDate,weddingTime:data.weddingTime});const[saved,setSaved]=useState(false);
  const save=()=>{const m={};data.checklist.forEach(p=>p.items.forEach(i=>{m[i.id]={done:i.done,memo:i.memo||"",custom:i.custom,text:i.text,cat:i.cat,customCatName:i.customCatName,note:i.note};}));const nc=JSON.parse(JSON.stringify(CL)).map(p=>({...p,items:p.items.map(i=>({...i,done:m[i.id]?.done||false,memo:m[i.id]?.memo||""}))}));data.checklist.forEach((p,pi)=>{p.items.forEach(i=>{if(i.custom&&nc[pi])nc[pi].items.push(i);});});setData({...data,...f,checklist:nc});setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return<div style={S.tab}><h2 style={S.th}>⚙️ 설정</h2><div style={S.card}><div style={{fontSize:15,color:P.textSub,marginBottom:22}}>커플 키: <b style={{color:P.periDk}}>{coupleKey}</b> · ☁️ 클라우드</div>
    <div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:480}}>
      <div><label style={S.lbl}>신랑</label><input style={MI} value={f.groomName} onChange={e=>setF({...f,groomName:e.target.value})}/></div>
      <div><label style={S.lbl}>신부</label><input style={MI} value={f.brideName} onChange={e=>setF({...f,brideName:e.target.value})}/></div>
      <div><label style={S.lbl}>결혼 예정일</label><input type="date" style={MI} value={f.weddingDate} onChange={e=>setF({...f,weddingDate:e.target.value})}/></div>
      <div><label style={S.lbl}>예식 시간</label><input type="time" style={MI} value={f.weddingTime} onChange={e=>setF({...f,weddingTime:e.target.value})}/></div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:4}}><button style={S.btn} onClick={save}>{saved?"✓ 저장!":"저장"}</button><button style={{padding:"14px 20px",background:P.blueLt,color:P.blueDk,border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FONT}} onClick={onRefresh}>🔄 새로고침</button><button style={{padding:"14px 20px",background:"#F0F0F0",color:P.textSub,border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FONT}} onClick={onLogout}>로그아웃</button></div>
    </div></div></div>;
}

/* ═══ MAIN ═══ */
const TABS=[{id:"dashboard",l:"홈",i:"🏡"},{id:"checklist",l:"체크리스트",i:"🌿"},{id:"sdm",l:"스드메",i:"💐"},{id:"budget",l:"예산",i:"🌻"},{id:"calendar",l:"캘린더",i:"📅"},{id:"dates",l:"일정",i:"📌"},{id:"vendors",l:"업체",i:"📇"},{id:"settings",l:"설정",i:"⚙️"}];

export default function App(){
  const[ck,setCk]=useState(null);const[data,setDR]=useState(null);const[tab,setTab]=useState("dashboard");const[loading,setLoading]=useState(true);const[toast,setToast]=useState({msg:"",show:false});
  const timerRef=useRef(null);const showT=msg=>{setToast({msg,show:true});setTimeout(()=>setToast({msg:"",show:false}),2000);};
  useEffect(()=>{const k=localStorage.getItem("wp_ck");if(k){dbLoad(k).then(d=>{if(d){setCk(k);setDR(d);}setLoading(false);});}else setLoading(false);},[]);
  const onLogin=(key,d)=>{setCk(key);setDR(d);localStorage.setItem("wp_ck",key);};const onLogout=()=>{localStorage.removeItem("wp_ck");setCk(null);setDR(null);setTab("dashboard");};
  const onRefresh=async()=>{if(!ck)return;setLoading(true);const d=await dbLoad(ck);if(d){setDR(d);showT("최신 데이터 불러옴");}setLoading(false);};
  const setData=useCallback(nd=>{setDR(nd);try{localStorage.setItem("wp_bk_"+(ck||""),JSON.stringify(nd));}catch{}if(timerRef.current)clearTimeout(timerRef.current);timerRef.current=setTimeout(()=>{if(ck)dbSave(ck,nd).then(()=>showT("☁️ 저장 완료"));},600);},[ck]);

  if(loading)return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:FONT,background:P.bg}}><div style={{fontSize:48}}>💍</div><div style={{color:P.peri,marginTop:12}}>불러오는 중...</div></div>;
  if(!ck||!data)return<><LoginScreen onLogin={onLogin}/><Toast {...toast}/></>;
  if(!data.isSetup)return<><SetupScreen data={data} setData={setData}/><Toast {...toast}/></>;

  return<><div style={S.app}>
    <nav style={S.side}><div style={{display:"flex",alignItems:"center",gap:8,padding:"0 12px 10px"}}><span style={{fontSize:22}}>💍</span><span style={{fontSize:17,fontWeight:700,color:P.periDk}}>Wedding</span></div><div style={{fontSize:13,color:P.textSub,padding:"0 14px 14px",borderBottom:"1px solid "+P.border,marginBottom:10}}>{data.groomName} ♥ {data.brideName}</div>{TABS.map(t=><button key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:"none",borderRadius:12,fontSize:14,cursor:"pointer",fontFamily:FONT,background:tab===t.id?P.periLt:"transparent",color:tab===t.id?P.periDk:P.textSub,fontWeight:tab===t.id?700:400}} onClick={()=>setTab(t.id)}><span>{t.i}</span><span>{t.l}</span></button>)}</nav>
    <nav style={S.mob}>{TABS.map(t=><button key={t.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",padding:"6px 2px",cursor:"pointer",fontFamily:FONT,color:tab===t.id?P.periDk:P.textMuted,fontWeight:tab===t.id?700:400,minWidth:0}} onClick={()=>setTab(t.id)}><span style={{fontSize:18}}>{t.i}</span><span style={{fontSize:9}}>{t.l}</span></button>)}</nav>
    <main style={S.main}>
      {tab==="dashboard"&&<Dash data={data} setTab={setTab}/>}
      {tab==="checklist"&&<CLTab data={data} setData={setData}/>}
      {tab==="sdm"&&<SdmTab data={data} setData={setData}/>}
      {tab==="budget"&&<BudTab data={data} setData={setData}/>}
      {tab==="calendar"&&<CalTab data={data}/>}
      {tab==="dates"&&<DatesTab data={data} setData={setData}/>}
      {tab==="vendors"&&<VenTab data={data} setData={setData}/>}
      {tab==="settings"&&<SetTab data={data} setData={setData} coupleKey={ck} onLogout={onLogout} onRefresh={onRefresh}/>}
    </main>
  </div><Toast {...toast}/></>;
}

const S={
  wrap:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(150deg,${P.greenBg} 0%,${P.blueBg} 30%,${P.periBg} 60%,${P.lavBg} 100%)`,padding:16,fontFamily:FONT,position:"relative",overflow:"hidden"},
  lc:{background:"rgba(255,255,255,0.92)",borderRadius:28,padding:"44px 36px",maxWidth:440,width:"100%",boxShadow:"0 24px 64px rgba(91,126,174,0.08)",textAlign:"center",backdropFilter:"blur(12px)",position:"relative",zIndex:2},
  lbl:{fontSize:14,fontWeight:600,color:"#4A4A5A",display:"block",marginBottom:6},
  btn:{padding:"14px 28px",background:`linear-gradient(135deg,${P.peri},${P.blue})`,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:FONT,boxShadow:"0 4px 14px rgba(110,200,228,0.2)"},
  app:{display:"flex",minHeight:"100vh",background:P.bg,fontFamily:FONT},
  side:{width:210,background:"rgba(246,249,242,0.98)",borderRight:"1px solid "+P.border,padding:"24px 12px",display:"flex",flexDirection:"column",gap:2,position:"fixed",top:0,left:0,bottom:0,zIndex:10,overflowY:"auto"},
  mob:{display:"none",position:"fixed",bottom:0,left:0,right:0,background:"rgba(246,249,242,0.98)",borderTop:"1px solid "+P.border,zIndex:10,justifyContent:"space-around",padding:"6px 0 env(safe-area-inset-bottom,6px)"},
  main:{flex:1,marginLeft:210,padding:"32px 48px 80px",minHeight:"100vh",overflowY:"auto"},
  dday:{background:`linear-gradient(135deg,${P.greenBg} 0%,${P.blueBg} 30%,${P.periBg} 60%,${P.lavBg} 100%)`,borderRadius:28,padding:"56px 36px",textAlign:"center",border:"1px solid "+P.border,position:"relative",overflow:"hidden"},
  card:{background:"#fff",borderRadius:20,padding:"24px 22px",border:"1px solid "+P.border,boxShadow:"0 2px 10px rgba(91,126,174,0.03)"},
  lnk:{background:"none",border:"none",color:P.periDk,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FONT,padding:0},
  tab:{},th:{fontSize:26,fontWeight:700,color:P.periDk,margin:"0 0 22px"},
  ebtn:{background:P.periLt,border:"none",borderRadius:10,padding:"8px 16px",fontSize:14,fontWeight:600,color:P.periDk,cursor:"pointer",fontFamily:FONT},
  dbtn:{background:"none",border:"none",color:P.textMuted,fontSize:20,cursor:"pointer",padding:"2px 8px"},
  empty:{textAlign:"center",padding:"56px 20px",color:P.textMuted,fontSize:16,gridColumn:"1 / -1"},
  calNav:{background:P.periLt,border:"none",borderRadius:12,width:44,height:44,fontSize:16,color:P.periDk,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},
};
const fl=document.createElement("link");fl.rel="stylesheet";fl.href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css";document.head.appendChild(fl);
const se=document.createElement("style");se.textContent=`@media(max-width:768px){nav[style*="width: 210"]{display:none !important;}nav[style*="display: none"]{display:flex !important;}main[style*="margin-left: 210"]{margin-left:0 !important;padding:16px 16px 100px !important;}.dday-num{font-size:56px !important;}.couple-names>div>div:last-child{font-size:18px !important;}.stat-grid{grid-template-columns:1fr !important;}.budget-summary{grid-template-columns:1fr !important;}.budget-num{font-size:22px !important;}.vendor-grid{grid-template-columns:1fr !important;}.modal-inner{padding:28px 20px !important;margin:8px;border-radius:20px !important;}}input:focus,select:focus,textarea:focus{border-color:${P.peri} !important;box-shadow:0 0 0 3px rgba(146,173,216,0.15) !important;}button:hover{opacity:0.88;}*{-webkit-font-smoothing:antialiased;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}button{min-height:44px;}`;document.head.appendChild(se);
