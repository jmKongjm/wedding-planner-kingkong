import { useState, useEffect, useCallback, useRef } from "react";

const FONT = "'MaruBuri', Georgia, serif";
const SB_URL = "https://jzahuisvtglzzkmgjcnr.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6YWh1aXN2dGdsenprbWdqY25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE4MDgsImV4cCI6MjA5MDUwNzgwOH0.WWpeegaxxxJR6lROjBJLQDEofsRoKn9YxBgaoeqndJM";
const HD = { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Content-Type": "application/json" };

async function dbLoad(key) { try { const r = await fetch(SB_URL + "/rest/v1/couples?couple_key=eq." + encodeURIComponent(key) + "&select=data", { headers: HD }); const rows = await r.json(); return rows?.[0]?.data || null; } catch { return null; } }
async function dbSave(key, data) { try { await fetch(SB_URL + "/rest/v1/couples", { method: "POST", headers: { ...HD, "Prefer": "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ couple_key: key, data, updated_at: new Date().toISOString() }) }); } catch (e) { console.error(e); } }

/* ── CSV download (Excel compatible) ── */
function downloadCSV(filename, headers, rows) {
  const BOM = "\uFEFF";
  const esc = c => '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"';
  const csv = BOM + [headers.map(esc).join(","), ...rows.map(r => r.map(esc).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename + ".csv"; a.click();
}

/* ── Flowers ── */
function Fl1({s}){return <svg viewBox="0 0 120 120" style={{position:"absolute",opacity:0.2,pointerEvents:"none",...s}} xmlns="http://www.w3.org/2000/svg"><defs><filter id="a"><feGaussianBlur stdDeviation="2.5"/></filter></defs><g filter="url(#a)">{[0,72,144,216,288].map((r,i)=><ellipse key={i} cx="60" cy="35" rx="22" ry="28" fill={i%2?"#FFEE58":"#FDD835"} transform={`rotate(${r} 60 60)`}/>)}<circle cx="60" cy="60" r="12" fill="#FFB300"/></g></svg>;}
function Fl2({s}){return <svg viewBox="0 0 100 60" style={{position:"absolute",opacity:0.16,pointerEvents:"none",...s}} xmlns="http://www.w3.org/2000/svg"><defs><filter id="b"><feGaussianBlur stdDeviation="1.5"/></filter></defs><g filter="url(#b)"><path d="M50 55Q30 30 15 40Q0 50 20 55Z" fill="#81C784"/><path d="M50 55Q70 30 85 40Q100 50 80 55Z" fill="#A5D6A7"/><path d="M50 55Q40 15 50 5Q60 15 50 55Z" fill="#66BB6A"/></g></svg>;}
function Fl3({s}){return <svg viewBox="0 0 90 90" style={{position:"absolute",opacity:0.13,pointerEvents:"none",...s}} xmlns="http://www.w3.org/2000/svg"><defs><filter id="c"><feGaussianBlur stdDeviation="2"/></filter></defs><g filter="url(#c)">{[0,60,120,180,240,300].map((r,i)=><ellipse key={i} cx="45" cy="25" rx="16" ry="22" fill={i%2?"#F48FB1":"#F8BBD0"} transform={`rotate(${r} 45 45)`}/>)}<circle cx="45" cy="45" r="8" fill="#FFE0B2"/></g></svg>;}

/* ── Data ── */
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
const CAT={venue:{bg:"#FFF8E1",fg:"#F9A825",n:"웨딩홀"},planner:{bg:"#F3E8FF",fg:"#7C3AED",n:"플래너"},dress:{bg:"#FFF1F2",fg:"#E11D48",n:"드레스"},makeup:{bg:"#FDF2F8",fg:"#DB2777",n:"메이크업"},photo:{bg:"#E8F5E9",fg:"#388E3C",n:"촬영"},shopping:{bg:"#FFF8E1",fg:"#E6A817",n:"혼수"},honeymoon:{bg:"#E0F7FA",fg:"#00838F",n:"신혼여행"},ceremony:{bg:"#FFF3E0",fg:"#E65100",n:"예식"},flower:{bg:"#FCE4EC",fg:"#C62828",n:"부케·꽃"},family:{bg:"#FFF8E1",fg:"#A16207",n:"혼주"},etc:{bg:"#F1F5F9",fg:"#546E7A",n:"기타"}};
const TIPS={"2026-02/2026-04":["💡 웨딩홀 상담 시 견적서를 서면으로 꼭 받아오세요","💡 스드메는 3곳 이상 비교하면 가성비 파악에 좋아요","💡 예물 반지는 금값이 오르니 빨리 결정할수록 유리해요"],"2026-04/2026-05":["💡 드레스 투어 시 사진이 안 되는 곳이 많으니 메모를 준비하세요","💡 드레스 지정이 투어보다 20~40만원 저렴할 수 있어요"],"2026-06/2026-07":["💡 촬영가봉 때 악세서리도 함께 매칭해보세요","💡 신랑 예복 맞춤은 촬영 3개월 전까지 하셔야 해요"],"2026-09/2026-10":["💡 촬영 전날 충분히 수면하고 야식은 피하세요","💡 촬영 당일 누드톤 속옷을 준비하세요"],"2026-11/2026-12":["💡 앨범 페이지 추가는 3.3만원/장이에요","💡 모바일 청첩장은 결혼 6~8주 전에 발송하세요"],"2026-11/2027-01":["💡 신혼집 입주와 결혼식을 맞춰 계획하면 좋아요","💡 폐백은 요즘 생략 추세, 양가 의견을 먼저 확인하세요"],"2027-01/2027-03":["💡 본식 가봉은 그날 바로 결정해야 해요","💡 식순표는 사회자와 공유, MR은 USB로 준비하세요"],"2027-04/2027-05":["💍 결혼 전날 편지를 교환해보세요","💍 비상 키트: 바늘, 테이프, 진통제, 여분 스타킹"]};

function freshData(){return{groomName:"",brideName:"",weddingDate:"",weddingTime:"12:00",email:"",checklist:JSON.parse(JSON.stringify(CL)).map(p=>({...p,items:p.items.map(i=>({...i,done:false}))})),budget:[],vendors:[],keyDates:[]};}
function getDday(d){if(!d)return null;const t=new Date();t.setHours(0,0,0,0);const w=new Date(d);w.setHours(0,0,0,0);return Math.ceil((w-t)/864e5);}
function fmtDate(d){if(!d)return"";const o=new Date(d),w=["일","월","화","수","목","금","토"];return o.getFullYear()+"년 "+(o.getMonth()+1)+"월 "+o.getDate()+"일 ("+w[o.getDay()]+")";}
function fmtWon(n){return n.toLocaleString("ko-KR")+"원";}
function pStat(p){const n=new Date(),x=p.split("/"),s=x[0].split("-").map(Number),e=x[1].split("-").map(Number);return n<new Date(s[0],s[1]-1,1)?"upcoming":n>new Date(e[0],e[1],0)?"past":"current";}
function pLabel(p){const x=p.split("/"),s=x[0].split("-").map(Number),e=x[1].split("-").map(Number);return(s[0]%100)+"년 "+s[1]+"~"+e[1]+"월";}
function mBefore(p,wd){if(!wd)return"";const e=p.split("/")[1].split("-").map(Number),d=new Date(wd),diff=(d.getFullYear()-e[0])*12+(d.getMonth()-(e[1]-1));return diff<=0?"결혼 당월":"결혼 "+diff+"개월 전";}
function deadln(p){const e=p.split("/")[1].split("-").map(Number),d=new Date(e[0],e[1],0),w=["일","월","화","수","목","금","토"];return d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate()+"("+w[d.getDay()]+")";}
function curTips(cl){const c=cl.find(p=>pStat(p.period)==="current")||cl.find(p=>pStat(p.period)==="upcoming");if(!c)return["🎉 모든 준비 완료!"];return TIPS[c.period]||["💡 차근차근 준비해보세요!"];}
function Badge({cat}){const c=CAT[cat]||CAT.etc;return <span style={{padding:"3px 10px",borderRadius:8,fontSize:12,fontWeight:700,background:c.bg,color:c.fg,whiteSpace:"nowrap"}}>{c.n}</span>;}

/* ── Modal ── */
function Modal({title,open,onClose,children}){if(!open)return null;return(<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.35)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}><div style={{background:"#fff",borderRadius:24,padding:"32px 28px",maxWidth:520,width:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.15)",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h3 style={{fontSize:20,fontWeight:700,color:"#33691E",margin:0}}>{title}</h3><button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:"#BCAAA4",cursor:"pointer",padding:"4px 8px"}}>✕</button></div>{children}</div></div>);}
function MF({label,children}){return<div style={{marginBottom:18}}><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>{label}</label>{children}</div>;}
const MI={padding:"14px 16px",border:"1.5px solid #D7CCC8",borderRadius:12,fontSize:16,outline:"none",fontFamily:FONT,color:"#3E2723",background:"#FAFAF5",boxSizing:"border-box",width:"100%"};
function DlBtn({onClick,label}){return <button onClick={onClick} style={{padding:"8px 16px",background:"#F5F0EB",border:"none",borderRadius:10,fontSize:13,fontWeight:600,color:"#8D6E63",cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",gap:4}}>📥 {label||"엑셀 다운로드"}</button>;}

/* ═══ LOGIN ═══ */
function LoginScreen({onLogin}){
  const[key,setKey]=useState("");const[isNew,setIsNew]=useState(false);const[err,setErr]=useState("");const[busy,setBusy]=useState(false);
  const tryLogin=async()=>{if(!key.trim()){setErr("키를 입력해주세요");return;}setBusy(true);const d=await dbLoad(key.trim());setBusy(false);if(d){onLogin(key.trim(),d);return;}setIsNew(true);setErr("");};
  const createNew=async()=>{setBusy(true);const d={...freshData(),isSetup:false};await dbSave(key.trim(),d);setBusy(false);onLogin(key.trim(),d);};
  return(<div style={S.wrap}><Fl1 s={{width:150,top:-30,left:-30}}/><Fl3 s={{width:110,top:10,right:-10}}/><Fl2 s={{width:130,bottom:20,left:10}}/><Fl1 s={{width:100,bottom:-10,right:10}}/>
    <div style={S.loginCard}><div style={{fontSize:56,marginBottom:8}}>🌿</div><h1 style={{fontSize:28,fontWeight:700,color:"#33691E",margin:"0 0 8px"}}>Wedding Planner</h1><p style={{fontSize:16,color:"#8D6E63",margin:"0 0 32px",lineHeight:1.8}}>커플 키를 입력하면<br/>우리만의 결혼 준비 공간이 열려요</p>
      <div style={{textAlign:"left",maxWidth:340,margin:"0 auto"}}><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>커플 키</label><input style={{...MI,fontSize:18,padding:"16px"}} placeholder="예: jm-sk-2027" value={key} onChange={e=>{setKey(e.target.value);setIsNew(false);setErr("");}} onKeyDown={e=>{if(e.key==="Enter")tryLogin();}}/><p style={{fontSize:13,color:"#A1887F",margin:"10px 0 0",lineHeight:1.6}}>처음이면 원하는 키를 만드세요. 어떤 브라우저·기기에서든 같은 키면 기록이 있어요.</p>
        {err&&<p style={{color:"#C62828",fontSize:14,margin:"8px 0 0"}}>{err}</p>}
        {isNew?(<div style={{marginTop:20,padding:20,background:"#FFF8E1",borderRadius:16,textAlign:"center"}}><p style={{fontSize:16,color:"#5D4037",margin:"0 0 14px"}}>✨ <b>"{key}"</b>는 새로운 키예요!</p><button style={{...S.btn1,width:"100%"}} onClick={createNew} disabled={busy}>{busy?"생성 중...":"새로 시작하기 🌷"}</button></div>):(<button style={{...S.btn1,width:"100%",marginTop:20}} onClick={tryLogin} disabled={busy}>{busy?"확인 중...":"들어가기 →"}</button>)}
      </div>
    </div>
  </div>);
}

/* ═══ SETUP ═══ */
function SetupScreen({data,setData}){
  const[f,setF]=useState({groomName:"",brideName:"",weddingDate:"",weddingTime:"12:00",email:""});
  const go=()=>{if(!f.groomName||!f.brideName||!f.weddingDate)return;setData({...data,...f,isSetup:true});};const ok=f.groomName&&f.brideName&&f.weddingDate;
  return(<div style={S.wrap}><Fl1 s={{width:130,top:-20,left:-20}}/><Fl3 s={{width:95,top:15,right:5}}/><Fl2 s={{width:110,bottom:30,left:15}}/>
    <div style={{...S.loginCard,maxWidth:480}}><div style={{fontSize:48,marginBottom:6}}>💐</div><h1 style={{fontSize:26,fontWeight:700,color:"#33691E",margin:"0 0 6px"}}>두 사람의 정보</h1><p style={{fontSize:15,color:"#A1887F",margin:"0 0 28px",lineHeight:1.7}}>이름과 예정일을 입력해주세요</p>
      <div style={{display:"flex",flexDirection:"column",gap:18,textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,minWidth:0}}><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>신랑 🌿</label><input style={MI} value={f.groomName} onChange={e=>setF({...f,groomName:e.target.value})} placeholder="이름"/></div>
          <div style={{fontSize:24,color:"#81C784",flexShrink:0,paddingTop:22}}>♥</div>
          <div style={{flex:1,minWidth:0}}><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>신부 🌻</label><input style={MI} value={f.brideName} onChange={e=>setF({...f,brideName:e.target.value})} placeholder="이름"/></div>
        </div>
        <div style={{display:"flex",gap:12}}><div style={{flex:1,minWidth:0}}><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>결혼 예정일</label><input type="date" style={MI} value={f.weddingDate} onChange={e=>setF({...f,weddingDate:e.target.value})}/></div><div style={{flex:1,minWidth:0}}><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>예식 시간</label><input type="time" style={MI} value={f.weddingTime} onChange={e=>setF({...f,weddingTime:e.target.value})}/></div></div>
        <div><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>이메일 (선택)</label><input type="email" style={MI} placeholder="example@gmail.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
        <button style={{...S.btn1,width:"100%",opacity:ok?1:0.4}} onClick={go} disabled={!ok}>시작하기 🌷</button>
      </div>
    </div>
  </div>);
}

/* ═══ DASHBOARD ═══ */
function Dash({data,setTab}){
  const dd=getDday(data.weddingDate),tot=data.checklist.reduce((s,p)=>s+p.items.length,0),dn=data.checklist.reduce((s,p)=>s+p.items.filter(i=>i.done).length,0),pct=tot>0?Math.round(dn/tot*100):0;
  const bT=data.budget.reduce((s,b)=>s+(b.unitPrice||0)*(b.qty||0),0),bP=data.budget.reduce((s,b)=>s+(b.paid||0),0);
  const cur=data.checklist.find(p=>pStat(p.period)==="current")||data.checklist.find(p=>pStat(p.period)==="upcoming");
  const todo=cur?cur.items.filter(i=>!i.done):[];const tips=curTips(data.checklist);
  const upcoming=(data.keyDates||[]).filter(d=>new Date(d.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3);
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}>
    <div style={S.dday}><Fl1 s={{width:160,top:-35,left:-25}}/><Fl3 s={{width:110,top:5,right:-10}}/><Fl2 s={{width:130,bottom:-20,right:40}}/><Fl1 s={{width:100,bottom:5,left:5}}/><div style={{position:"relative",zIndex:1}}><div style={{fontSize:13,fontWeight:600,color:"#7B6B5D",letterSpacing:3,marginBottom:10,opacity:0.5}}>OUR WEDDING</div><div style={{fontSize:26,fontWeight:700,color:"#4E7D3A",marginBottom:14}}>{data.groomName} 🌿 ♥ 🌻 {data.brideName}</div><div style={{fontSize:72,fontWeight:700,color:"#33691E",lineHeight:1}}>{dd>0?"D-"+dd:dd===0?"D-Day 🎉":"D+"+Math.abs(dd)}</div><div style={{fontSize:17,color:"#689F38",marginTop:14}}>{fmtDate(data.weddingDate)} {data.weddingTime}</div></div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}><div style={S.card}><div style={S.cl}>준비 진행률</div><div style={{height:12,background:"#F1F8E9",borderRadius:6,overflow:"hidden",marginBottom:14}}><div style={{height:"100%",background:"linear-gradient(90deg,#FDD835,#66BB6A)",borderRadius:6,width:pct+"%",transition:"width 0.5s"}}/></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:36,fontWeight:700,color:"#4E7D3A"}}>{pct}%</span><span style={{fontSize:16,color:"#8D6E63",alignSelf:"flex-end"}}>{dn}/{tot}</span></div></div><div style={S.card}><div style={S.cl}>예산 현황</div><div style={{fontSize:28,fontWeight:700,color:"#4E7D3A",marginBottom:6}}>{fmtWon(bT)}</div><div style={{fontSize:15,color:"#8D6E63"}}>지출 {fmtWon(bP)}</div><div style={{fontSize:15,color:"#2E7D32",fontWeight:600}}>잔여 {fmtWon(bT-bP)}</div></div></div>
    <div style={{...S.card,background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"1px solid #FFF176"}}><div style={{...S.cl,color:"#F9A825"}}>🤖 결혼 준비 Tip</div>{tips.map((t,i)=><div key={i} style={{fontSize:16,color:"#5D4037",lineHeight:1.9,padding:"4px 0"}}>{t}</div>)}</div>
    {upcoming.length>0&&<div style={S.card}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div style={S.cl}>📌 다가오는 일정</div><button style={S.lnk} onClick={()=>setTab("dates")}>전체 →</button></div>{upcoming.map((d,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"#FAFAF5",borderRadius:14,marginBottom:8}}><span style={{fontWeight:700,fontSize:16,color:"#3E2723"}}>{d.name}</span><span style={{fontSize:15,color:"#689F38",fontWeight:600}}>{fmtDate(d.date)}</span></div>)}</div>}
    <div style={S.card}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={S.cl}>{cur?(cur.emoji+" 지금 할 일 — "+cur.label):"모든 준비 완료!"}</div>{cur&&<button style={S.lnk} onClick={()=>setTab("checklist")}>전체 →</button>}</div>{cur&&<div style={{fontSize:15,color:"#8D6E63",marginBottom:16}}>📅 {pLabel(cur.period)} · {mBefore(cur.period,data.weddingDate)} · 기한 {deadln(cur.period)}</div>}{todo.slice(0,6).map(item=><div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#FAFAF5",borderRadius:14,marginBottom:8,flexWrap:"wrap"}}><Badge cat={item.cat}/><span style={{fontSize:16,color:"#3E2723"}}>{item.text}</span></div>)}{todo.length>6&&<div style={{fontSize:15,color:"#A1887F",textAlign:"center",marginTop:8}}>외 {todo.length-6}개</div>}</div>
  </div>);
}

/* ═══ CHECKLIST ═══ */
function CLTab({data,setData}){
  const toggle=(pi,id)=>{const nc=data.checklist.map((p,i)=>i!==pi?p:{...p,items:p.items.map(it=>it.id===id?{...it,done:!it.done}:it)});setData({...data,checklist:nc});};
  const dlCL=()=>{const rows=[];data.checklist.forEach(ph=>{ph.items.forEach(i=>{rows.push([ph.label,pLabel(ph.period),mBefore(ph.period,data.weddingDate),deadln(ph.period),(CAT[i.cat]||CAT.etc).n,i.text,i.done?"완료":"미완료",i.note||""]);});});downloadCSV("체크리스트",["단계","시기","결혼전","기한","카테고리","항목","상태","메모"],rows);};
  return(<div style={S.tab}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><h2 style={{...S.th,margin:0}}>🌿 체크리스트</h2><DlBtn onClick={dlCL}/></div>
    <div style={{display:"flex",flexDirection:"column",gap:22}}>
      {data.checklist.map((ph,pi)=>{const st=pStat(ph.period),allD=ph.items.every(i=>i.done),dc=ph.items.filter(i=>i.done).length;return(
        <div key={pi} style={{...S.card,borderLeft:"4px solid "+(st==="current"?"#81C784":st==="past"?"#C8E6C9":"#E0E0E0")}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",background:allD?"#66BB6A":st==="current"?"#FDD835":"#E0E0E0"}}>{allD?"✓":""}</span><span style={{fontSize:18,fontWeight:700,color:"#3E2723"}}>{ph.emoji} {ph.label}</span><span style={{fontSize:15,color:"#A1887F"}}>{dc}/{ph.items.length}</span></div>{st==="current"&&<span style={{padding:"5px 14px",borderRadius:8,fontSize:13,fontWeight:700,background:"#FFF8E1",color:"#F9A825"}}>지금</span>}</div>
          <div style={{fontSize:15,color:"#8D6E63",marginBottom:16,paddingLeft:38}}>📅 {pLabel(ph.period)} · {mBefore(ph.period,data.weddingDate)} · 기한 {deadln(ph.period)}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>{ph.items.map(item=><div key={item.id} style={{display:"flex",gap:14,alignItems:"flex-start",padding:"12px 16px",borderRadius:14,cursor:"pointer",background:"#FAFAF5",opacity:item.done?0.4:1}} onClick={()=>toggle(pi,item.id)}><div style={{width:26,height:26,borderRadius:8,border:"2px solid "+(item.done?"#66BB6A":"#D7CCC8"),background:item.done?"#66BB6A":"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff",flexShrink:0}}>{item.done?"✓":""}</div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><Badge cat={item.cat}/><span style={{textDecoration:item.done?"line-through":"none",fontSize:16,color:"#3E2723"}}>{item.text}</span></div>{item.note&&<div style={{fontSize:14,color:"#A1887F",marginTop:5}}>💡 {item.note}</div>}</div></div>)}</div>
        </div>);})}
    </div>
  </div>);
}

/* ═══ BUDGET ═══ */
function BudTab({data,setData}){
  const[show,setShow]=useState(false);const[f,setF]=useState({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});
  const[editId,setEditId]=useState(null);const[ef,setEf]=useState({});
  const resetF=()=>setF({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});
  const add=()=>{if(!f.name||!f.unitPrice)return;const u=parseInt(f.unitPrice)||0,q=parseInt(f.qty)||1;setData({...data,budget:[...data.budget,{id:Date.now().toString(),name:f.name,category:f.category,unitPrice:u,qty:q,amount:u*q,paid:parseInt(f.paid)||0}]});resetF();setShow(false);};
  const rm=id=>{if(confirm("삭제할까요?"))setData({...data,budget:data.budget.filter(b=>b.id!==id)});};
  const openEdit=item=>{setEditId(item.id);setEf({name:item.name,category:item.category,unitPrice:String(item.unitPrice),qty:String(item.qty),paid:String(item.paid)});};
  const saveEdit=()=>{const u=parseInt(ef.unitPrice)||0,q=parseInt(ef.qty)||1;setData({...data,budget:data.budget.map(b=>b.id===editId?{...b,name:ef.name,category:ef.category,unitPrice:u,qty:q,amount:u*q,paid:parseInt(ef.paid)||0}:b)});setEditId(null);};
  const t=data.budget.reduce((s,b)=>s+b.amount,0),tp=data.budget.reduce((s,b)=>s+b.paid,0);
  const gr={};data.budget.forEach(b=>{if(!gr[b.category])gr[b.category]={t:0,p:0};gr[b.category].t+=b.amount;gr[b.category].p+=b.paid;});
  const dlBud=()=>{downloadCSV("예산",["카테고리","항목명","단가","수량","견적금액","지출액","잔여액"],data.budget.map(b=>[(CAT[b.category]||CAT.etc).n,b.name,b.unitPrice,b.qty,b.amount,b.paid,b.amount-b.paid]));};

  const BudModal=({title,open,onClose,vals,setVals,onSave})=>{const amt=(parseInt(vals.unitPrice)||0)*(parseInt(vals.qty)||1);return<Modal title={title} open={open} onClose={onClose}>
    <MF label="항목명"><input style={MI} placeholder="예: 웨딩홀 대관료" value={vals.name} onChange={e=>setVals({...vals,name:e.target.value})}/></MF>
    <MF label="카테고리"><select style={MI} value={vals.category} onChange={e=>setVals({...vals,category:e.target.value})}>{Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v.n}</option>)}</select></MF>
    <div style={{display:"flex",gap:12,marginBottom:18}}><div style={{flex:1}}><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>단가</label><input style={MI} type="number" placeholder="0" value={vals.unitPrice} onChange={e=>setVals({...vals,unitPrice:e.target.value})}/></div><div style={{width:30,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:14,fontSize:20,color:"#A1887F"}}>×</div><div style={{flex:1}}><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>수량</label><input style={MI} type="number" placeholder="1" value={vals.qty} onChange={e=>setVals({...vals,qty:e.target.value})}/></div></div>
    <div style={{background:"#F1F8E9",borderRadius:14,padding:"16px 20px",marginBottom:18,textAlign:"center"}}><div style={{fontSize:14,color:"#689F38",fontWeight:600,marginBottom:4}}>견적 금액</div><div style={{fontSize:28,fontWeight:700,color:"#33691E"}}>{fmtWon(amt)}</div></div>
    <MF label="지출액 (이미 지급한 금액)"><input style={MI} type="number" placeholder="0" value={vals.paid} onChange={e=>setVals({...vals,paid:e.target.value})}/></MF>
    <button style={{...S.btn1,width:"100%"}} onClick={onSave}>저장하기</button>
  </Modal>;};

  return(<div style={S.tab}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><h2 style={{...S.th,margin:0}}>🌻 예산 관리</h2><DlBtn onClick={dlBud}/></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
      <div style={{...S.card,textAlign:"center",background:"linear-gradient(135deg,#F1F8E9,#E8F5E9)"}}><div style={{fontSize:14,color:"#689F38",fontWeight:700,marginBottom:8}}>총 예산</div><div style={{fontSize:28,fontWeight:700,color:"#33691E"}}>{fmtWon(t)}</div></div>
      <div style={{...S.card,textAlign:"center",background:"linear-gradient(135deg,#FFF3E0,#FFE0B2)"}}><div style={{fontSize:14,color:"#E65100",fontWeight:700,marginBottom:8}}>지출</div><div style={{fontSize:28,fontWeight:700,color:"#BF360C"}}>{fmtWon(tp)}</div></div>
      <div style={{...S.card,textAlign:"center",background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}><div style={{fontSize:14,color:"#F9A825",fontWeight:700,marginBottom:8}}>잔여</div><div style={{fontSize:28,fontWeight:700,color:"#F57F17"}}>{fmtWon(t-tp)}</div></div>
    </div>
    {Object.keys(gr).length>0&&<div style={{...S.card,marginBottom:22}}><div style={S.cl}>카테고리별</div>{Object.entries(gr).map(([k,g])=>{const c=CAT[k]||CAT.etc,pc=g.t>0?Math.round(g.p/g.t*100):0;return<div key={k} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><Badge cat={k}/><span style={{fontSize:15,color:"#5D4037"}}>{fmtWon(g.p)} / {fmtWon(g.t)}</span></div><div style={{height:10,background:"#F5F0EB",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",background:c.fg,borderRadius:5,width:pc+"%",opacity:0.7}}/></div></div>;})}</div>}
    <button style={{...S.btn1,width:"100%",marginBottom:22}} onClick={()=>{resetF();setShow(true);}}>+ 예산 항목 추가</button>
    <BudModal title="예산 항목 추가" open={show} onClose={()=>setShow(false)} vals={f} setVals={setF} onSave={add}/>
    <BudModal title="예산 항목 수정" open={editId!==null} onClose={()=>setEditId(null)} vals={ef} setVals={setEf} onSave={saveEdit}/>
    {data.budget.length===0&&<div style={S.empty}>예산 항목을 추가해보세요 🌻</div>}
    {data.budget.map(item=>{const pp=item.amount>0?Math.round(item.paid/item.amount*100):0;return(
      <div key={item.id} style={{...S.card,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}><Badge cat={item.category}/><span style={{fontWeight:700,fontSize:17,color:"#3E2723"}}>{item.name}</span></div><div style={{display:"flex",gap:8}}><button style={S.ebtn} onClick={()=>openEdit(item)}>수정</button><button style={S.dbtn} onClick={()=>rm(item.id)}>✕</button></div></div>
        <div style={{fontSize:15,color:"#8D6E63",marginBottom:10}}>{fmtWon(item.unitPrice)} × {item.qty} = <b style={{color:"#3E2723",fontSize:17}}>{fmtWon(item.amount)}</b></div>
        <div style={{height:10,background:"#F5F0EB",borderRadius:5,overflow:"hidden",marginBottom:10}}><div style={{height:"100%",background:"linear-gradient(90deg,#FDD835,#66BB6A)",borderRadius:5,width:Math.min(pp,100)+"%"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:15}}><span style={{color:"#E65100"}}>지출 {fmtWon(item.paid)}</span><span style={{color:"#2E7D32",fontWeight:600}}>잔여 {fmtWon(item.amount-item.paid)}</span></div>
      </div>);})}
  </div>);
}

/* ═══ KEY DATES ═══ */
function DatesTab({data,setData}){
  const[show,setShow]=useState(false);const[f,setF]=useState({name:"",date:"",memo:""});
  const[editId,setEditId]=useState(null);const[ef,setEf]=useState({});
  const add=()=>{if(!f.name||!f.date)return;setData({...data,keyDates:[...(data.keyDates||[]),{id:Date.now().toString(),...f}]});setF({name:"",date:"",memo:""});setShow(false);};
  const rm=id=>{if(confirm("삭제할까요?"))setData({...data,keyDates:(data.keyDates||[]).filter(d=>d.id!==id)});};
  const openEdit=d=>{setEditId(d.id);setEf({name:d.name,date:d.date,memo:d.memo||""});};
  const saveEdit=()=>{setData({...data,keyDates:(data.keyDates||[]).map(d=>d.id===editId?{...d,...ef}:d)});setEditId(null);};
  const sorted=[...(data.keyDates||[])].sort((a,b)=>new Date(a.date)-new Date(b.date));const today=new Date();today.setHours(0,0,0,0);
  const dlDates=()=>{downloadCSV("주요일정",["일정명","날짜","D-day","메모"],sorted.map(d=>[d.name,d.date,getDday(d.date),d.memo||""]));};

  const DateModal=({title,open,onClose,vals,setVals,onSave})=><Modal title={title} open={open} onClose={onClose}>
    <MF label="일정명"><input style={MI} placeholder="예: 상견례, 스튜디오 촬영" value={vals.name} onChange={e=>setVals({...vals,name:e.target.value})}/></MF>
    <MF label="날짜"><input type="date" style={MI} value={vals.date} onChange={e=>setVals({...vals,date:e.target.value})}/></MF>
    <MF label="메모 (선택)"><input style={MI} placeholder="장소, 시간 등" value={vals.memo} onChange={e=>setVals({...vals,memo:e.target.value})}/></MF>
    <button style={{...S.btn1,width:"100%"}} onClick={onSave}>저장하기</button>
  </Modal>;

  return(<div style={S.tab}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><h2 style={{...S.th,margin:0}}>📌 주요 일정</h2><DlBtn onClick={dlDates}/></div>
    <button style={{...S.btn1,width:"100%",marginBottom:22}} onClick={()=>{setF({name:"",date:"",memo:""});setShow(true);}}>+ 일정 추가</button>
    <DateModal title="일정 추가" open={show} onClose={()=>setShow(false)} vals={f} setVals={setF} onSave={add}/>
    <DateModal title="일정 수정" open={editId!==null} onClose={()=>setEditId(null)} vals={ef} setVals={setEf} onSave={saveEdit}/>
    {sorted.length===0&&<div style={S.empty}>주요 일정을 추가해보세요 📌</div>}
    {sorted.map(d=>{const dd=getDday(d.date);const past=new Date(d.date)<today;return<div key={d.id} style={{...S.card,marginBottom:12,opacity:past?0.5:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{flex:1,cursor:"pointer"}} onClick={()=>openEdit(d)}><div style={{fontSize:18,fontWeight:700,color:"#3E2723"}}>{d.name}</div><div style={{fontSize:15,color:"#689F38",marginTop:4}}>{fmtDate(d.date)} {dd>0?"(D-"+dd+")":dd===0?"(오늘!)":"(지남)"}</div>{d.memo&&<div style={{fontSize:14,color:"#A1887F",marginTop:4}}>📝 {d.memo}</div>}</div>
      <div style={{display:"flex",gap:8,flexShrink:0}}><button style={S.ebtn} onClick={()=>openEdit(d)}>수정</button><button style={S.dbtn} onClick={()=>rm(d.id)}>✕</button></div>
    </div>;})}
  </div>);
}

/* ═══ VENDORS ═══ */
function VenTab({data,setData}){
  const[show,setShow]=useState(false);const[f,setF]=useState({name:"",category:"venue",phone:"",memo:""});
  const[editId,setEditId]=useState(null);const[ef,setEf]=useState({});
  const add=()=>{if(!f.name)return;setData({...data,vendors:[...data.vendors,{id:Date.now().toString(),...f}]});setF({name:"",category:"venue",phone:"",memo:""});setShow(false);};
  const rm=id=>{if(confirm("삭제할까요?"))setData({...data,vendors:data.vendors.filter(v=>v.id!==id)});};
  const openEdit=v=>{setEditId(v.id);setEf({name:v.name,category:v.category,phone:v.phone||"",memo:v.memo||""});};
  const saveEdit=()=>{setData({...data,vendors:data.vendors.map(v=>v.id===editId?{...v,...ef}:v)});setEditId(null);};
  const dlVen=()=>{downloadCSV("업체연락처",["카테고리","업체명","연락처","메모"],data.vendors.map(v=>[(CAT[v.category]||CAT.etc).n,v.name,v.phone||"",v.memo||""]));};

  const VenModal=({title,open,onClose,vals,setVals,onSave})=><Modal title={title} open={open} onClose={onClose}>
    <MF label="업체명"><input style={MI} placeholder="예: 보네르스포사" value={vals.name} onChange={e=>setVals({...vals,name:e.target.value})}/></MF>
    <MF label="카테고리"><select style={MI} value={vals.category} onChange={e=>setVals({...vals,category:e.target.value})}>{Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v.n}</option>)}</select></MF>
    <MF label="연락처"><input style={MI} placeholder="010-0000-0000" value={vals.phone} onChange={e=>setVals({...vals,phone:e.target.value})}/></MF>
    <MF label="메모 (선택)"><input style={MI} placeholder="담당자, 특이사항 등" value={vals.memo} onChange={e=>setVals({...vals,memo:e.target.value})}/></MF>
    <button style={{...S.btn1,width:"100%"}} onClick={onSave}>저장하기</button>
  </Modal>;

  return(<div style={S.tab}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><h2 style={{...S.th,margin:0}}>📇 업체 연락처</h2><DlBtn onClick={dlVen}/></div>
    <button style={{...S.btn1,width:"100%",marginBottom:22}} onClick={()=>{setF({name:"",category:"venue",phone:"",memo:""});setShow(true);}}>+ 업체 추가</button>
    <VenModal title="업체 추가" open={show} onClose={()=>setShow(false)} vals={f} setVals={setF} onSave={add}/>
    <VenModal title="업체 수정" open={editId!==null} onClose={()=>setEditId(null)} vals={ef} setVals={setEf} onSave={saveEdit}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
      {data.vendors.length===0&&<div style={S.empty}>업체 정보를 추가해보세요 🌻</div>}
      {data.vendors.map(v=><div key={v.id} style={S.card}><div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><Badge cat={v.category}/><div style={{display:"flex",gap:8}}><button style={S.ebtn} onClick={()=>openEdit(v)}>수정</button><button style={S.dbtn} onClick={()=>rm(v.id)}>✕</button></div></div><div style={{fontWeight:700,fontSize:18,color:"#3E2723",marginBottom:6}}>{v.name}</div>{v.phone&&<div style={{fontSize:16,color:"#558B2F"}}>📞 {v.phone}</div>}{v.memo&&<div style={{fontSize:15,color:"#8D6E63",marginTop:6}}>📝 {v.memo}</div>}</div>)}
    </div>
  </div>);
}

/* ═══ SETTINGS ═══ */
function SetTab({data,setData,coupleKey,onLogout,onRefresh}){
  const[f,setF]=useState({groomName:data.groomName,brideName:data.brideName,weddingDate:data.weddingDate,weddingTime:data.weddingTime});const[saved,setSaved]=useState(false);
  const save=()=>{const m={};data.checklist.forEach(p=>p.items.forEach(i=>{m[i.id]=i.done;}));const nc=JSON.parse(JSON.stringify(CL)).map(p=>({...p,items:p.items.map(i=>({...i,done:m[i.id]||false}))}));setData({...data,...f,checklist:nc});setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return(<div style={S.tab}><h2 style={S.th}>⚙️ 설정</h2>
    <div style={S.card}>
      <div style={{fontSize:15,color:"#8D6E63",marginBottom:20}}>커플 키: <b style={{color:"#4E7D3A"}}>{coupleKey}</b> · ☁️ 클라우드 저장</div>
      <div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:480}}>
        <div><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>신랑</label><input style={MI} value={f.groomName} onChange={e=>setF({...f,groomName:e.target.value})}/></div>
        <div><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>신부</label><input style={MI} value={f.brideName} onChange={e=>setF({...f,brideName:e.target.value})}/></div>
        <div><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>결혼 예정일</label><input type="date" style={MI} value={f.weddingDate} onChange={e=>setF({...f,weddingDate:e.target.value})}/></div>
        <div><label style={{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:6}}>예식 시간</label><input type="time" style={MI} value={f.weddingTime} onChange={e=>setF({...f,weddingTime:e.target.value})}/></div>
        <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap"}}>
          <button style={S.btn1} onClick={save}>{saved?"✓ 저장!":"저장"}</button>
          <button style={{padding:"14px 22px",background:"#E8F5E9",color:"#4E7D3A",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FONT}} onClick={onRefresh}>🔄 새로고침</button>
          <button style={{padding:"14px 22px",background:"#EFEBE9",color:"#8D6E63",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:FONT}} onClick={onLogout}>로그아웃</button>
        </div>
        <p style={{fontSize:13,color:"#A1887F",lineHeight:1.6,margin:0}}>💡 다른 기기에서 수정한 내용이 안 보이면 "새로고침"을 눌러 최신 데이터를 불러오세요.</p>
      </div>
    </div>
  </div>);
}

/* ═══ MAIN ═══ */
const TABS=[{id:"dashboard",l:"홈",i:"🏡"},{id:"checklist",l:"체크리스트",i:"🌿"},{id:"budget",l:"예산",i:"🌻"},{id:"dates",l:"일정",i:"📌"},{id:"vendors",l:"업체",i:"📇"},{id:"settings",l:"설정",i:"⚙️"}];

export default function App(){
  const[ck,setCk]=useState(null);const[data,setDR]=useState(null);const[tab,setTab]=useState("dashboard");const[loading,setLoading]=useState(true);const[saving,setSaving]=useState(false);
  const timerRef=useRef(null);

  useEffect(()=>{const k=localStorage.getItem("wp_ck");if(k){dbLoad(k).then(d=>{if(d){setCk(k);setDR(d);}setLoading(false);});}else setLoading(false);},[]);

  const onLogin=async(key,d)=>{setCk(key);setDR(d);localStorage.setItem("wp_ck",key);};
  const onLogout=()=>{localStorage.removeItem("wp_ck");setCk(null);setDR(null);setTab("dashboard");};
  const onRefresh=async()=>{if(!ck)return;setLoading(true);const d=await dbLoad(ck);if(d)setDR(d);setLoading(false);};

  const setData=useCallback(nd=>{
    setDR(nd);
    // Also save to localStorage as backup
    try{localStorage.setItem("wp_backup_"+ck,JSON.stringify(nd));}catch{}
    if(timerRef.current)clearTimeout(timerRef.current);
    timerRef.current=setTimeout(()=>{if(ck){setSaving(true);dbSave(ck,nd).then(()=>setSaving(false));}},600);
  },[ck]);

  if(loading)return<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:FONT,background:"#FFFDE7"}}><div style={{fontSize:48}}>🌿</div><div style={{color:"#A1887F",marginTop:12}}>불러오는 중...</div></div>;
  if(!ck||!data)return<LoginScreen onLogin={onLogin}/>;
  if(!data.isSetup)return<SetupScreen data={data} setData={setData}/>;

  return(<div style={S.app}>
    <nav style={S.side}><div style={{display:"flex",alignItems:"center",gap:8,padding:"0 12px 10px"}}><span style={{fontSize:24}}>🌿</span><span style={{fontSize:18,fontWeight:700,color:"#33691E"}}>Wedding</span></div><div style={{fontSize:13,color:"#8D6E63",padding:"0 14px 14px",borderBottom:"1px solid #E8E0D8",marginBottom:10}}>{data.groomName} ♥ {data.brideName}{saving&&<span style={{fontSize:11,color:"#A5D6A7",marginLeft:6}}>☁️</span>}</div>{TABS.map(t=><button key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:"none",borderRadius:12,fontSize:15,cursor:"pointer",fontFamily:FONT,background:tab===t.id?"#F1F8E9":"transparent",color:tab===t.id?"#33691E":"#8D6E63",fontWeight:tab===t.id?700:400}} onClick={()=>setTab(t.id)}><span>{t.i}</span><span>{t.l}</span></button>)}</nav>
    <nav style={S.mob}>{TABS.map(t=><button key={t.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:"none",border:"none",padding:"6px 4px",cursor:"pointer",fontFamily:FONT,color:tab===t.id?"#33691E":"#BCAAA4",fontWeight:tab===t.id?700:400}} onClick={()=>setTab(t.id)}><span style={{fontSize:18}}>{t.i}</span><span style={{fontSize:9}}>{t.l}</span></button>)}</nav>
    <main style={S.main}>
      {tab==="dashboard"&&<Dash data={data} setTab={setTab}/>}
      {tab==="checklist"&&<CLTab data={data} setData={setData}/>}
      {tab==="budget"&&<BudTab data={data} setData={setData}/>}
      {tab==="dates"&&<DatesTab data={data} setData={setData}/>}
      {tab==="vendors"&&<VenTab data={data} setData={setData}/>}
      {tab==="settings"&&<SetTab data={data} setData={setData} coupleKey={ck} onLogout={onLogout} onRefresh={onRefresh}/>}
    </main>
  </div>);
}

const S={
  wrap:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(150deg,#FFFDE7 0%,#FFF9C4 25%,#F1F8E9 55%,#E8F5E9 100%)",padding:16,fontFamily:FONT,position:"relative",overflow:"hidden"},
  loginCard:{background:"rgba(255,255,255,0.92)",borderRadius:28,padding:"44px 36px",maxWidth:440,width:"100%",boxShadow:"0 20px 60px rgba(76,111,55,0.1)",textAlign:"center",backdropFilter:"blur(12px)",position:"relative",zIndex:2},
  btn1:{padding:"14px 28px",background:"linear-gradient(135deg,#66BB6A,#81C784)",color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:FONT,boxShadow:"0 4px 14px rgba(102,187,106,0.3)"},
  app:{display:"flex",minHeight:"100vh",background:"#FFFEF7",fontFamily:FONT},
  side:{width:210,background:"rgba(255,253,247,0.98)",borderRight:"1px solid #E8E0D8",padding:"24px 12px",display:"flex",flexDirection:"column",gap:3,position:"fixed",top:0,left:0,bottom:0,zIndex:10},
  mob:{display:"none",position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,253,247,0.98)",borderTop:"1px solid #E8E0D8",zIndex:10,justifyContent:"space-around",padding:"5px 0 env(safe-area-inset-bottom,5px)"},
  main:{flex:1,marginLeft:210,padding:"32px 48px 80px",minHeight:"100vh",overflowY:"auto"},
  dday:{background:"linear-gradient(135deg,#FFFDE7 0%,#FFF9C4 25%,#F1F8E9 55%,#E8F5E9 100%)",borderRadius:28,padding:"52px 36px",textAlign:"center",border:"1px solid rgba(165,214,167,0.3)",position:"relative",overflow:"hidden"},
  card:{background:"#fff",borderRadius:20,padding:"24px 24px",border:"1px solid #E8E0D8",boxShadow:"0 2px 8px rgba(62,39,35,0.03)"},
  cl:{fontSize:15,fontWeight:700,color:"#A1887F",marginBottom:12},
  lnk:{background:"none",border:"none",color:"#66BB6A",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:FONT,padding:0},
  tab:{},th:{fontSize:26,fontWeight:700,color:"#33691E",margin:"0 0 22px"},
  ebtn:{background:"#F5F0EB",border:"none",borderRadius:10,padding:"8px 16px",fontSize:14,fontWeight:600,color:"#8D6E63",cursor:"pointer",fontFamily:FONT},
  dbtn:{background:"none",border:"none",color:"#D7CCC8",fontSize:20,cursor:"pointer",padding:"2px 8px"},
  empty:{textAlign:"center",padding:"48px 20px",color:"#A1887F",fontSize:17,gridColumn:"1 / -1"},
};
const fl=document.createElement("link");fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Maru+Buri:wght@300;400;700&display=swap";document.head.appendChild(fl);
const se=document.createElement("style");se.textContent='@media(max-width:768px){nav[style*="width: 210"]{display:none !important;}nav[style*="display: none"]{display:flex !important;}main[style*="margin-left: 210"]{margin-left:0 !important;padding:20px 16px 100px !important;}}input:focus,select:focus{border-color:#81C784 !important;box-shadow:0 0 0 3px rgba(129,199,132,0.15) !important;}button:hover{opacity:0.88;}*{-webkit-font-smoothing:antialiased;box-sizing:border-box;}';document.head.appendChild(se);
