import { useState, useEffect, useCallback } from "react";

const FONT = "'MaruBuri', Georgia, serif";

/* ── Storage with couple key ── */
function loadData(key) {
  try { const v = localStorage.getItem("wp_" + key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function saveData(key, data) {
  try { localStorage.setItem("wp_" + key, JSON.stringify(data)); } catch {}
}

/* ── Flowers ── */
function Fl1({s}){return <svg viewBox="0 0 120 120" style={{position:"absolute",opacity:0.2,pointerEvents:"none",...s}} xmlns="http://www.w3.org/2000/svg"><defs><filter id="a"><feGaussianBlur stdDeviation="2.5"/></filter></defs><g filter="url(#a)">{[0,72,144,216,288].map((r,i)=><ellipse key={i} cx="60" cy="35" rx="22" ry="28" fill={i%2?"#FFEE58":"#FDD835"} transform={`rotate(${r} 60 60)`}/>)}<circle cx="60" cy="60" r="12" fill="#FFB300"/></g></svg>;}
function Fl2({s}){return <svg viewBox="0 0 100 60" style={{position:"absolute",opacity:0.16,pointerEvents:"none",...s}} xmlns="http://www.w3.org/2000/svg"><defs><filter id="b"><feGaussianBlur stdDeviation="1.5"/></filter></defs><g filter="url(#b)"><path d="M50 55Q30 30 15 40Q0 50 20 55Z" fill="#81C784"/><path d="M50 55Q70 30 85 40Q100 50 80 55Z" fill="#A5D6A7"/><path d="M50 55Q40 15 50 5Q60 15 50 55Z" fill="#66BB6A"/></g></svg>;}
function Fl3({s}){return <svg viewBox="0 0 90 90" style={{position:"absolute",opacity:0.13,pointerEvents:"none",...s}} xmlns="http://www.w3.org/2000/svg"><defs><filter id="c"><feGaussianBlur stdDeviation="2"/></filter></defs><g filter="url(#c)">{[0,60,120,180,240,300].map((r,i)=><ellipse key={i} cx="45" cy="25" rx="16" ry="22" fill={i%2?"#F48FB1":"#F8BBD0"} transform={`rotate(${r} 45 45)`}/>)}<circle cx="45" cy="45" r="8" fill="#FFE0B2"/></g></svg>;}

/* ── Checklist ── */
const CL=[
  {period:"2026-02/2026-04",label:"준비 시작",emoji:"🌱",items:[
    {id:"s01",text:"플래너 결정",cat:"planner"},{id:"s02",text:"웨딩홀 투어 후 결정",cat:"venue"},{id:"s03",text:"스튜디오 예약",cat:"photo"},{id:"s04",text:"드레스샵 결정",cat:"dress"},{id:"s05",text:"혼주 메이크업 예약",cat:"makeup"},{id:"s06",text:"본식 스냅/DVD 결정",cat:"photo",note:"웨딩홀 연계 확인"},{id:"s07",text:"허니문 예약",cat:"honeymoon"},{id:"s08",text:"결혼반지(예물) 준비",cat:"shopping"},{id:"s09",text:"예복(턱시도) 알아보기",cat:"shopping"},
  ]},
  {period:"2026-04/2026-05",label:"드레스투어 & 혼수",emoji:"👗",items:[
    {id:"d01",text:"드레스투어 후 샵 결정",cat:"dress",note:"샵당 1시간/4벌, 5.5만원"},{id:"d02",text:"혼수품목 준비 시작",cat:"shopping"},{id:"d03",text:"예복 가봉",cat:"shopping"},{id:"d04",text:"예물 디자인 셀렉·제작",cat:"shopping"},{id:"d05",text:"한복 셀렉/가봉",cat:"shopping"},
  ]},
  {period:"2026-06/2026-07",label:"촬영 준비",emoji:"📸",items:[
    {id:"p01",text:"촬영가봉 (드레스 셀렉)",cat:"dress",note:"5~6벌 중 3~4벌"},{id:"p02",text:"촬영 소품·컨셉 준비",cat:"photo"},{id:"p03",text:"생화부케 예약",cat:"flower"},{id:"p04",text:"신랑 예복 디자인",cat:"shopping"},
  ]},
  {period:"2026-09/2026-10",label:"스튜디오 촬영",emoji:"💛",items:[
    {id:"ph01",text:"스튜디오 웨딩 촬영",cat:"photo",note:"4~4.5시간"},{id:"ph02",text:"헬퍼이모님 확인",cat:"photo",note:"1회 25만원"},
  ]},
  {period:"2026-11/2026-12",label:"셀렉 & 청첩장",emoji:"🖼️",items:[
    {id:"sl01",text:"앨범/액자 사진 셀렉",cat:"photo",note:"2~3시간"},{id:"sl02",text:"모바일 청첩장",cat:"etc"},
  ]},
  {period:"2026-11/2027-01",label:"막바지 준비",emoji:"🏡",items:[
    {id:"f01",text:"신혼집 구하기",cat:"etc"},{id:"f02",text:"가전·가구 준비",cat:"shopping"},{id:"f03",text:"주례/사회/축가",cat:"ceremony"},{id:"f04",text:"접수대 섭외",cat:"ceremony"},{id:"f05",text:"폐백 여부 결정",cat:"ceremony"},{id:"f06",text:"2부 의상 준비",cat:"dress"},{id:"f07",text:"혼주 한복·정장",cat:"family"},
  ]},
  {period:"2027-01/2027-03",label:"본식 가봉 & 마무리",emoji:"✨",items:[
    {id:"b01",text:"본식 드레스 셀렉",cat:"dress",note:"4벌 중 1벌"},{id:"b02",text:"원본사진 수령·셀렉",cat:"photo"},{id:"b03",text:"종이 청첩장",cat:"etc"},{id:"b04",text:"수정본 수령",cat:"photo"},{id:"b05",text:"액자 수령",cat:"photo"},{id:"b06",text:"혼주 확인/예단",cat:"family"},{id:"b07",text:"식순 준비",cat:"ceremony"},{id:"b08",text:"부케 셀렉",cat:"flower",note:"부케+부토니아+코사지6"},{id:"b09",text:"식순 체크",cat:"ceremony"},{id:"b10",text:"MR·연주",cat:"ceremony"},{id:"b11",text:"식전영상",cat:"ceremony"},{id:"b12",text:"식권 도장",cat:"ceremony"},{id:"b13",text:"포토테이블",cat:"ceremony"},
  ]},
  {period:"2027-04/2027-05",label:"웨딩데이",emoji:"💍",items:[{id:"w01",text:"웨딩데이 ♥",cat:"ceremony"}]},
];

const CAT={venue:{bg:"#FFF8E1",fg:"#F9A825",n:"웨딩홀"},planner:{bg:"#F3E8FF",fg:"#7C3AED",n:"플래너"},dress:{bg:"#FFF1F2",fg:"#E11D48",n:"드레스"},makeup:{bg:"#FDF2F8",fg:"#DB2777",n:"메이크업"},photo:{bg:"#E8F5E9",fg:"#388E3C",n:"촬영"},shopping:{bg:"#FFF8E1",fg:"#E6A817",n:"혼수"},honeymoon:{bg:"#E0F7FA",fg:"#00838F",n:"신혼여행"},ceremony:{bg:"#FFF3E0",fg:"#E65100",n:"예식"},flower:{bg:"#FCE4EC",fg:"#C62828",n:"부케·꽃"},family:{bg:"#FFF8E1",fg:"#A16207",n:"혼주"},etc:{bg:"#F1F5F9",fg:"#546E7A",n:"기타"}};

/* ── AI Tips ── */
const TIPS={
  "2026-02/2026-04":[
    "💡 웨딩홀 상담 시 항목별 견적서를 서면으로 꼭 받아오세요",
    "💡 스드메는 3곳 이상 비교해보면 가성비를 파악하기 좋아요",
    "💡 예물 반지는 금값이 계속 오르는 추세라 빨리 결정할수록 유리해요",
    "💡 플래너 계약 시 동행 횟수와 포함 서비스를 반드시 확인하세요",
  ],
  "2026-04/2026-05":[
    "💡 드레스 투어 시 사진 촬영이 안 되는 곳이 많으니 메모나 스케치를 준비하세요",
    "💡 드레스 지정이 투어보다 20~40만원 저렴할 수 있어요",
    "💡 한복은 맞춤 시 최소 2~3개월이 필요해요. 대여는 1개월 전이면 충분해요",
  ],
  "2026-06/2026-07":[
    "💡 촬영가봉 때 악세서리(귀걸이, 목걸이)도 함께 매칭해보세요",
    "💡 신랑 예복 맞춤은 촬영 3개월 전까지, 대여는 1~2개월 전에 하면 돼요",
    "💡 촬영 부케는 생화 vs 조화 장단점을 비교해보세요",
  ],
  "2026-09/2026-10":[
    "💡 촬영 전날 충분히 수면하고, 얼굴이 붓지 않게 야식은 피하세요",
    "💡 촬영 당일 누드톤 속옷을 준비하세요",
    "💡 헤어변형 선생님을 부르면 드레스마다 헤어를 바꿀 수 있어요",
  ],
  "2026-11/2026-12":[
    "💡 앨범 셀렉 시 페이지 추가는 3.3만원/장이니 예산을 미리 계산하세요",
    "💡 모바일 청첩장은 결혼 6~8주 전에 발송하는 게 적당해요",
  ],
  "2026-11/2027-01":[
    "💡 신혼집 입주 시기와 결혼식 날짜를 맞춰 계획하면 이사 스트레스가 줄어요",
    "💡 폐백은 요즘 생략하는 추세지만, 양가 부모님 의견을 먼저 확인하세요",
    "💡 축가는 하객 중 노래 잘하는 분에게 미리 2개월 전에 부탁하세요",
  ],
  "2027-01/2027-03":[
    "💡 본식 가봉은 플래너님 동행이 중요해요. 그날 바로 결정해야 합니다",
    "💡 식순표는 사회자와 미리 공유하고, MR 음원을 USB로 준비하세요",
    "💡 포토테이블 사진은 어린 시절 ~ 연애 시절 다양하게 준비하면 좋아요",
  ],
  "2027-04/2027-05":[
    "💍 결혼 전날 두 분이 함께 편지를 써서 당일에 교환해보세요",
    "💍 당일 비상 키트: 바늘, 테이프, 진통제, 여분 스타킹, 밴드",
  ],
};

function getDefaultData(){return{groomName:"",brideName:"",weddingDate:"",weddingTime:"12:00",email:"",smtpEmail:"",smtpAppPassword:"",serverUrl:"http://localhost:5000",checklist:JSON.parse(JSON.stringify(CL)).map(p=>({...p,items:p.items.map(i=>({...i,done:false}))})),budget:[],vendors:[],keyDates:[],emailLog:[]};}

/* ── Utils ── */
function getDday(d){if(!d)return null;const t=new Date();t.setHours(0,0,0,0);const w=new Date(d);w.setHours(0,0,0,0);return Math.ceil((w-t)/864e5);}
function fmtDate(d){if(!d)return"";const o=new Date(d),w=["일","월","화","수","목","금","토"];return o.getFullYear()+"년 "+(o.getMonth()+1)+"월 "+o.getDate()+"일 ("+w[o.getDay()]+")";}
function fmtWon(n){return n.toLocaleString("ko-KR")+"원";}
function pStat(p){const n=new Date(),x=p.split("/"),s=x[0].split("-").map(Number),e=x[1].split("-").map(Number);return n<new Date(s[0],s[1]-1,1)?"upcoming":n>new Date(e[0],e[1],0)?"past":"current";}
function pLabel(p){const x=p.split("/"),s=x[0].split("-").map(Number),e=x[1].split("-").map(Number);return(s[0]%100)+"년 "+s[1]+"~"+e[1]+"월";}
function mBefore(p,wd){if(!wd)return"";const e=p.split("/")[1].split("-").map(Number),d=new Date(wd),diff=(d.getFullYear()-e[0])*12+(d.getMonth()-(e[1]-1));return diff<=0?"결혼 당월":"결혼 "+diff+"개월 전";}
function deadline(p){const e=p.split("/")[1].split("-").map(Number),d=new Date(e[0],e[1],0),w=["일","월","화","수","목","금","토"];return d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate()+"("+w[d.getDay()]+")";}

function getCurrentTips(checklist){
  const cur=checklist.find(p=>pStat(p.period)==="current")||checklist.find(p=>pStat(p.period)==="upcoming");
  if(!cur)return["🎉 모든 준비가 끝났어요! 행복한 결혼식 되세요!"];
  return TIPS[cur.period]||["💡 이 시기의 준비를 차근차근 진행해보세요!"];
}

/* ── Badge ── */
function Badge({cat}){const c=CAT[cat]||CAT.etc;return <span style={{padding:"3px 10px",borderRadius:8,fontSize:12,fontWeight:700,background:c.bg,color:c.fg,whiteSpace:"nowrap"}}>{c.n}</span>;}

/* ═══════ LOGIN SCREEN ═══════ */
function LoginScreen({onLogin}){
  const[key,setKey]=useState("");
  const[isNew,setIsNew]=useState(false);
  const[err,setErr]=useState("");

  const tryLogin=()=>{
    if(!key.trim()){setErr("키를 입력해주세요");return;}
    const saved=loadData(key.trim());
    if(saved){onLogin(key.trim(),saved);return;}
    setIsNew(true);setErr("");
  };
  const createNew=()=>{
    if(!key.trim())return;
    const d=getDefaultData();
    saveData(key.trim(),{...d,isSetup:false});
    onLogin(key.trim(),{...d,isSetup:false});
  };

  return(
    <div style={S.loginWrap}>
      <Fl1 s={{width:150,top:-30,left:-30}}/><Fl3 s={{width:110,top:10,right:-10}}/><Fl2 s={{width:130,bottom:20,left:10}}/><Fl1 s={{width:100,bottom:-10,right:10}}/>
      <div style={S.loginCard}>
        <div style={{fontSize:56,marginBottom:8}}>🌿</div>
        <h1 style={{fontSize:28,fontWeight:700,color:"#33691E",margin:"0 0 8px"}}>Wedding Planner</h1>
        <p style={{fontSize:16,color:"#8D6E63",margin:"0 0 32px",lineHeight:1.8}}>커플 키를 입력하면<br/>우리만의 결혼 준비 공간이 열려요</p>
        <div style={{textAlign:"left",maxWidth:320,margin:"0 auto"}}>
          <label style={S.lbl}>커플 키 (영문/숫자 조합)</label>
          <input style={{...S.inp,width:"100%",fontSize:16,padding:"14px 16px"}} placeholder="예: jm-sk-2027" value={key} onChange={e=>{setKey(e.target.value);setIsNew(false);setErr("");}} onKeyDown={e=>{if(e.key==="Enter")tryLogin();}}/>
          <p style={{fontSize:13,color:"#A1887F",margin:"8px 0 0",lineHeight:1.6}}>처음이라면 원하는 키를 만들어주세요.<br/>다음에 같은 키로 들어오면 기록이 그대로 있어요.</p>
          {err&&<p style={{color:"#C62828",fontSize:14,margin:"8px 0 0"}}>{err}</p>}
          {isNew?(
            <div style={{marginTop:20,padding:20,background:"#FFF8E1",borderRadius:16,textAlign:"center"}}>
              <p style={{fontSize:15,color:"#5D4037",margin:"0 0 12px"}}>✨ <b>"{key}"</b>는 새로운 키예요!</p>
              <button style={{...S.btn1,width:"100%"}} onClick={createNew}>새로 시작하기 🌷</button>
            </div>
          ):(
            <button style={{...S.btn1,width:"100%",marginTop:20}} onClick={tryLogin}>들어가기 →</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════ SETUP ═══════ */
function SetupScreen({data,setData}){
  const[f,setF]=useState({groomName:"",brideName:"",weddingDate:"",weddingTime:"12:00",email:""});
  const go=()=>{if(!f.groomName||!f.brideName||!f.weddingDate)return;setData({...data,...f,isSetup:true});};
  const ok=f.groomName&&f.brideName&&f.weddingDate;
  return(
    <div style={S.loginWrap}>
      <Fl1 s={{width:130,top:-20,left:-20}}/><Fl3 s={{width:95,top:15,right:5}}/><Fl2 s={{width:110,bottom:30,left:15}}/>
      <div style={{...S.loginCard,maxWidth:460}}>
        <div style={{fontSize:48,marginBottom:6}}>💐</div>
        <h1 style={{fontSize:26,fontWeight:700,color:"#33691E",margin:"0 0 6px"}}>두 사람의 정보</h1>
        <p style={{fontSize:15,color:"#A1887F",margin:"0 0 28px",lineHeight:1.7}}>이름과 예정일을 입력하면 맞춤 체크리스트가 시작돼요</p>
        <div style={{display:"flex",flexDirection:"column",gap:16,textAlign:"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,minWidth:0}}><label style={S.lbl}>신랑 🌿</label><input style={{...S.inp,width:"100%"}} value={f.groomName} onChange={e=>setF({...f,groomName:e.target.value})} placeholder="이름"/></div>
            <div style={{fontSize:22,color:"#81C784",flexShrink:0,paddingTop:20}}>♥</div>
            <div style={{flex:1,minWidth:0}}><label style={S.lbl}>신부 🌻</label><input style={{...S.inp,width:"100%"}} value={f.brideName} onChange={e=>setF({...f,brideName:e.target.value})} placeholder="이름"/></div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1,minWidth:0}}><label style={S.lbl}>결혼 예정일</label><input type="date" style={{...S.inp,width:"100%"}} value={f.weddingDate} onChange={e=>setF({...f,weddingDate:e.target.value})}/></div>
            <div style={{flex:1,minWidth:0}}><label style={S.lbl}>예식 시간</label><input type="time" style={{...S.inp,width:"100%"}} value={f.weddingTime} onChange={e=>setF({...f,weddingTime:e.target.value})}/></div>
          </div>
          <div><label style={S.lbl}>이메일 (선택)</label><input type="email" style={{...S.inp,width:"100%"}} placeholder="example@gmail.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
          <button style={{...S.btn1,width:"100%",opacity:ok?1:0.4,cursor:ok?"pointer":"not-allowed"}} onClick={go} disabled={!ok}>시작하기 🌷</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════ DASHBOARD ═══════ */
function Dashboard({data,setTab}){
  const dd=getDday(data.weddingDate);
  const total=data.checklist.reduce((s,p)=>s+p.items.length,0);
  const done=data.checklist.reduce((s,p)=>s+p.items.filter(i=>i.done).length,0);
  const pct=total>0?Math.round(done/total*100):0;
  const bT=data.budget.reduce((s,b)=>s+(b.unitPrice||0)*(b.qty||0),0);
  const bP=data.budget.reduce((s,b)=>s+(b.paid||0),0);
  const cur=data.checklist.find(p=>pStat(p.period)==="current")||data.checklist.find(p=>pStat(p.period)==="upcoming");
  const todo=cur?cur.items.filter(i=>!i.done):[];
  const tips=getCurrentTips(data.checklist);
  const upcoming=(data.keyDates||[]).filter(d=>new Date(d.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3);

  return(<div style={{display:"flex",flexDirection:"column",gap:20}}>
    {/* D-day */}
    <div style={S.ddayCard}>
      <Fl1 s={{width:140,top:-35,left:-25}}/><Fl3 s={{width:100,top:5,right:-10}}/><Fl2 s={{width:120,bottom:-20,right:30}}/><Fl1 s={{width:90,bottom:5,left:5}}/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{fontSize:13,fontWeight:600,color:"#7B6B5D",letterSpacing:3,marginBottom:10,opacity:0.5}}>OUR WEDDING</div>
        <div style={{fontSize:24,fontWeight:700,color:"#4E7D3A",marginBottom:12}}>{data.groomName} 🌿 ♥ 🌻 {data.brideName}</div>
        <div style={{fontSize:64,fontWeight:700,color:"#33691E",lineHeight:1}}>{dd>0?"D-"+dd:dd===0?"D-Day 🎉":"D+"+Math.abs(dd)}</div>
        <div style={{fontSize:16,color:"#689F38",marginTop:12}}>{fmtDate(data.weddingDate)} {data.weddingTime}</div>
      </div>
    </div>

    {/* Stats row */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div style={S.card}>
        <div style={S.cardLbl}>준비 진행률</div>
        <div style={{height:10,background:"#F1F8E9",borderRadius:5,overflow:"hidden",marginBottom:12}}><div style={{height:"100%",background:"linear-gradient(90deg,#FDD835,#66BB6A)",borderRadius:5,width:pct+"%",transition:"width 0.5s"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
          <span style={{fontSize:32,fontWeight:700,color:"#4E7D3A"}}>{pct}%</span>
          <span style={{fontSize:15,color:"#8D6E63"}}>{done} / {total} 완료</span>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardLbl}>예산 현황</div>
        <div style={{fontSize:24,fontWeight:700,color:"#4E7D3A",marginBottom:4}}>{fmtWon(bT)}</div>
        <div style={{fontSize:14,color:"#8D6E63"}}>지출 {fmtWon(bP)}</div>
        <div style={{fontSize:14,color:"#2E7D32",fontWeight:600}}>잔여 {fmtWon(bT-bP)}</div>
      </div>
    </div>

    {/* AI Tips */}
    <div style={{...S.card,background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)",border:"1px solid #FFF176"}}>
      <div style={{...S.cardLbl,color:"#F9A825"}}>🤖 결혼 준비 Tip</div>
      {tips.map((t,i)=><div key={i} style={{fontSize:15,color:"#5D4037",lineHeight:1.8,padding:"4px 0"}}>{t}</div>)}
    </div>

    {/* 주요 일정 */}
    {upcoming.length>0&&(
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={S.cardLbl}>📌 다가오는 주요 일정</div>
          <button style={S.linkBtn} onClick={()=>setTab("dates")}>전체 →</button>
        </div>
        {upcoming.map((d,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#FAFAF5",borderRadius:12,marginBottom:6}}>
            <div><span style={{fontWeight:700,fontSize:15,color:"#3E2723"}}>{d.name}</span>{d.memo&&<span style={{fontSize:13,color:"#A1887F",marginLeft:8}}>— {d.memo}</span>}</div>
            <div style={{fontSize:14,color:"#689F38",fontWeight:600,whiteSpace:"nowrap"}}>{fmtDate(d.date)}</div>
          </div>
        ))}
      </div>
    )}

    {/* 지금 할 일 */}
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={S.cardLbl}>{cur?(cur.emoji+" 지금 할 일 — "+cur.label):"모든 준비 완료! 🎉"}</div>
        {cur&&<button style={S.linkBtn} onClick={()=>setTab("checklist")}>전체 보기 →</button>}
      </div>
      {cur&&<div style={{fontSize:14,color:"#8D6E63",marginBottom:14}}>📅 {pLabel(cur.period)} · {mBefore(cur.period,data.weddingDate)} · 기한 {deadline(cur.period)}</div>}
      {todo.length===0&&<div style={{color:"#A1887F",fontSize:15,padding:"10px 0"}}>이 시기의 모든 항목 완료! 🌟</div>}
      {todo.slice(0,6).map(item=>(
        <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#FAFAF5",borderRadius:12,marginBottom:6,flexWrap:"wrap"}}>
          <Badge cat={item.cat}/><span style={{fontSize:15,color:"#3E2723"}}>{item.text}</span>
          {item.note&&<span style={{fontSize:12,color:"#A1887F"}}>· {item.note}</span>}
        </div>
      ))}
      {todo.length>6&&<div style={{fontSize:14,color:"#A1887F",marginTop:6,textAlign:"center"}}>외 {todo.length-6}개 더</div>}
    </div>
  </div>);
}

/* ═══════ CHECKLIST ═══════ */
function ChecklistTab({data,setData}){
  const toggle=(pi,id)=>{const nc=data.checklist.map((p,i)=>i!==pi?p:{...p,items:p.items.map(it=>it.id===id?{...it,done:!it.done}:it)});setData({...data,checklist:nc});};
  return(<div style={S.tab}>
    <h2 style={S.tabH}>🌿 체크리스트</h2>
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {data.checklist.map((ph,pi)=>{const st=pStat(ph.period),allD=ph.items.every(i=>i.done),dc=ph.items.filter(i=>i.done).length;return(
        <div key={pi} style={{...S.phaseCard,borderLeft:"4px solid "+(st==="current"?"#81C784":st==="past"?"#C8E6C9":"#E0E0E0")}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",background:allD?"#66BB6A":st==="current"?"#FDD835":"#E0E0E0"}}>{allD?"✓":""}</span>
              <span style={{fontSize:17,fontWeight:700,color:"#3E2723"}}>{ph.emoji} {ph.label}</span>
              <span style={{fontSize:14,color:"#A1887F"}}>{dc}/{ph.items.length}</span>
            </div>
            {st==="current"&&<span style={{padding:"4px 12px",borderRadius:8,fontSize:12,fontWeight:700,background:"#FFF8E1",color:"#F9A825"}}>지금</span>}
          </div>
          <div style={{fontSize:14,color:"#8D6E63",marginBottom:14,paddingLeft:36}}>📅 {pLabel(ph.period)} · {mBefore(ph.period,data.weddingDate)} · 기한 {deadline(ph.period)}</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {ph.items.map(item=>(
              <div key={item.id} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 14px",borderRadius:12,cursor:"pointer",background:"#FAFAF5",opacity:item.done?0.45:1}} onClick={()=>toggle(pi,item.id)}>
                <div style={{width:24,height:24,borderRadius:8,border:"2px solid "+(item.done?"#66BB6A":"#D7CCC8"),background:item.done?"#66BB6A":"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0,marginTop:1}}>{item.done?"✓":""}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <Badge cat={item.cat}/>
                    <span style={{textDecoration:item.done?"line-through":"none",fontSize:15,color:"#3E2723"}}>{item.text}</span>
                  </div>
                  {item.note&&<div style={{fontSize:13,color:"#A1887F",marginTop:4}}>💡 {item.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );})}
    </div>
  </div>);
}

/* ═══════ BUDGET ═══════ */
function BudgetTab({data,setData}){
  const[f,setF]=useState({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});
  const[editing,setEditing]=useState(null);const[ef,setEf]=useState({});
  const add=()=>{if(!f.name||!f.unitPrice)return;const up=parseInt(f.unitPrice)||0,q=parseInt(f.qty)||1;setData({...data,budget:[...data.budget,{id:Date.now().toString(),name:f.name,category:f.category,unitPrice:up,qty:q,amount:up*q,paid:parseInt(f.paid)||0}]});setF({name:"",category:"venue",unitPrice:"",qty:"1",paid:""});};
  const rm=id=>setData({...data,budget:data.budget.filter(b=>b.id!==id)});
  const startEdit=item=>{setEditing(item.id);setEf({name:item.name,category:item.category,unitPrice:String(item.unitPrice),qty:String(item.qty),paid:String(item.paid)});};
  const saveEdit=id=>{const up=parseInt(ef.unitPrice)||0,q=parseInt(ef.qty)||1;setData({...data,budget:data.budget.map(b=>b.id===id?{...b,name:ef.name,category:ef.category,unitPrice:up,qty:q,amount:up*q,paid:parseInt(ef.paid)||0}:b)});setEditing(null);};
  const t=data.budget.reduce((s,b)=>s+b.amount,0),tp=data.budget.reduce((s,b)=>s+b.paid,0);

  // Group by category
  const groups={};data.budget.forEach(b=>{const k=b.category;if(!groups[k])groups[k]={items:[],total:0,paid:0};groups[k].items.push(b);groups[k].total+=b.amount;groups[k].paid+=b.paid;});

  return(<div style={S.tab}>
    <h2 style={S.tabH}>🌻 예산 관리</h2>
    {/* Summary */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
      <div style={{...S.card,textAlign:"center",background:"linear-gradient(135deg,#F1F8E9,#E8F5E9)"}}>
        <div style={{fontSize:13,color:"#689F38",fontWeight:700,marginBottom:6}}>총 예산</div>
        <div style={{fontSize:24,fontWeight:700,color:"#33691E"}}>{fmtWon(t)}</div>
      </div>
      <div style={{...S.card,textAlign:"center",background:"linear-gradient(135deg,#FFF3E0,#FFE0B2)"}}>
        <div style={{fontSize:13,color:"#E65100",fontWeight:700,marginBottom:6}}>지출</div>
        <div style={{fontSize:24,fontWeight:700,color:"#BF360C"}}>{fmtWon(tp)}</div>
      </div>
      <div style={{...S.card,textAlign:"center",background:"linear-gradient(135deg,#FFFDE7,#FFF9C4)"}}>
        <div style={{fontSize:13,color:"#F9A825",fontWeight:700,marginBottom:6}}>잔여</div>
        <div style={{fontSize:24,fontWeight:700,color:"#F57F17"}}>{fmtWon(t-tp)}</div>
      </div>
    </div>

    {/* Category breakdown */}
    {Object.keys(groups).length>0&&(
      <div style={{...S.card,marginBottom:20}}>
        <div style={S.cardLbl}>카테고리별 현황</div>
        {Object.entries(groups).map(([k,g])=>{const c=CAT[k]||CAT.etc;const pct=g.total>0?Math.round(g.paid/g.total*100):0;return(
          <div key={k} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <Badge cat={k}/>
              <span style={{fontSize:14,color:"#5D4037"}}>{fmtWon(g.paid)} / {fmtWon(g.total)}</span>
            </div>
            <div style={{height:8,background:"#F5F0EB",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",background:c.fg,borderRadius:4,width:pct+"%",opacity:0.7,transition:"width 0.3s"}}/></div>
          </div>
        );})}
      </div>
    )}

    {/* Add form */}
    <div style={{...S.card,marginBottom:20}}>
      <div style={{...S.cardLbl,marginBottom:12}}>항목 추가</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
        <input style={{...S.inp,flex:2,minWidth:100}} placeholder="항목명" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
        <select style={{...S.inp,flex:1,minWidth:70}} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v.n}</option>)}</select>
        <input style={{...S.inp,width:85}} type="number" placeholder="단가" value={f.unitPrice} onChange={e=>setF({...f,unitPrice:e.target.value})}/>
        <input style={{...S.inp,width:55}} type="number" placeholder="수량" value={f.qty} onChange={e=>setF({...f,qty:e.target.value})}/>
        <input style={{...S.inp,width:85}} type="number" placeholder="지출액" value={f.paid} onChange={e=>setF({...f,paid:e.target.value})}/>
        <button style={S.addBtn} onClick={add}>추가</button>
      </div>
    </div>

    {/* Items */}
    {data.budget.length===0&&<div style={S.empty}>예산 항목을 추가해보세요 🌻</div>}
    {data.budget.map(item=>{const c=CAT[item.category]||CAT.etc,pp=item.amount>0?Math.round(item.paid/item.amount*100):0;
      if(editing===item.id)return(
        <div key={item.id} style={{...S.card,marginBottom:10}}>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
            <input style={{...S.inp,flex:2,minWidth:80}} value={ef.name} onChange={e=>setEf({...ef,name:e.target.value})}/>
            <select style={{...S.inp,flex:1,minWidth:60}} value={ef.category} onChange={e=>setEf({...ef,category:e.target.value})}>{Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v.n}</option>)}</select>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:13,color:"#8D6E63"}}>단가</span><input style={{...S.inp,width:85}} type="number" value={ef.unitPrice} onChange={e=>setEf({...ef,unitPrice:e.target.value})}/>
            <span style={{color:"#A1887F"}}>×</span><span style={{fontSize:13,color:"#8D6E63"}}>수량</span><input style={{...S.inp,width:55}} type="number" value={ef.qty} onChange={e=>setEf({...ef,qty:e.target.value})}/>
            <span style={{fontSize:14,color:"#4E7D3A",fontWeight:700}}>= {fmtWon((parseInt(ef.unitPrice)||0)*(parseInt(ef.qty)||1))}</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:13,color:"#8D6E63"}}>지출</span><input style={{...S.inp,width:100}} type="number" value={ef.paid} onChange={e=>setEf({...ef,paid:e.target.value})}/><button style={S.addBtn} onClick={()=>saveEdit(item.id)}>저장</button><button style={S.editBtn} onClick={()=>setEditing(null)}>취소</button></div>
        </div>);
      return(
        <div key={item.id} style={{...S.card,marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><Badge cat={item.category}/><span style={{fontWeight:700,fontSize:16,color:"#3E2723"}}>{item.name}</span></div>
            <div style={{display:"flex",gap:6}}><button style={S.editBtn} onClick={()=>startEdit(item)}>수정</button><button style={S.delBtn} onClick={()=>rm(item.id)}>✕</button></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:14,color:"#8D6E63",marginBottom:8}}>
            <span>{fmtWon(item.unitPrice)} × {item.qty} = <b style={{color:"#3E2723"}}>{fmtWon(item.amount)}</b></span>
          </div>
          <div style={{height:8,background:"#F5F0EB",borderRadius:4,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",background:"linear-gradient(90deg,#FDD835,#66BB6A)",borderRadius:4,width:Math.min(pp,100)+"%",transition:"width 0.3s"}}/></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:14}}>
            <span style={{color:"#E65100"}}>지출 {fmtWon(item.paid)}</span>
            <span style={{color:"#2E7D32",fontWeight:600}}>잔여 {fmtWon(item.amount-item.paid)}</span>
          </div>
        </div>);
    })}
  </div>);
}

/* ═══════ KEY DATES ═══════ */
function KeyDatesTab({data,setData}){
  const[f,setF]=useState({name:"",date:"",memo:""});
  const add=()=>{if(!f.name||!f.date)return;setData({...data,keyDates:[...(data.keyDates||[]),{id:Date.now().toString(),...f}]});setF({name:"",date:"",memo:""});};
  const rm=id=>setData({...data,keyDates:(data.keyDates||[]).filter(d=>d.id!==id)});
  const sorted=[...(data.keyDates||[])].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const today=new Date();today.setHours(0,0,0,0);

  return(<div style={S.tab}>
    <h2 style={S.tabH}>📌 주요 일정</h2>
    <div style={{...S.card,marginBottom:20}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
        <input style={{...S.inp,flex:2,minWidth:120}} placeholder="일정명 (예: 상견례)" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
        <input type="date" style={{...S.inp,flex:1,minWidth:130}} value={f.date} onChange={e=>setF({...f,date:e.target.value})}/>
        <input style={{...S.inp,flex:2,minWidth:100}} placeholder="메모 (선택)" value={f.memo} onChange={e=>setF({...f,memo:e.target.value})}/>
        <button style={S.addBtn} onClick={add}>추가</button>
      </div>
    </div>
    {sorted.length===0&&<div style={S.empty}>주요 일정을 추가해보세요 📌</div>}
    {sorted.map(d=>{const dd=getDday(d.date);const past=new Date(d.date)<today;return(
      <div key={d.id} style={{...S.card,marginBottom:10,opacity:past?0.5:1,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:"#3E2723"}}>{d.name}</div>
          <div style={{fontSize:14,color:"#689F38",marginTop:2}}>{fmtDate(d.date)} {dd>0?"(D-"+dd+")":dd===0?"(오늘!)":"(지남)"}</div>
          {d.memo&&<div style={{fontSize:13,color:"#A1887F",marginTop:2}}>📝 {d.memo}</div>}
        </div>
        <button style={S.delBtn} onClick={()=>rm(d.id)}>✕</button>
      </div>
    );})}
  </div>);
}

/* ═══════ VENDORS ═══════ */
function VendorTab({data,setData}){
  const[f,setF]=useState({name:"",category:"venue",phone:"",memo:""});
  const add=()=>{if(!f.name)return;setData({...data,vendors:[...data.vendors,{id:Date.now().toString(),...f}]});setF({name:"",category:"venue",phone:"",memo:""});};
  const rm=id=>setData({...data,vendors:data.vendors.filter(v=>v.id!==id)});
  return(<div style={S.tab}>
    <h2 style={S.tabH}>📇 업체 연락처</h2>
    <div style={{...S.card,marginBottom:20}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
        <input style={{...S.inp,flex:2,minWidth:100}} placeholder="업체명" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
        <select style={{...S.inp,flex:1,minWidth:70}} value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v.n}</option>)}</select>
        <input style={{...S.inp,flex:1,minWidth:80}} placeholder="연락처" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
        <input style={{...S.inp,flex:2,minWidth:100}} placeholder="메모" value={f.memo} onChange={e=>setF({...f,memo:e.target.value})}/>
        <button style={S.addBtn} onClick={add}>추가</button>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
      {data.vendors.length===0&&<div style={S.empty}>업체 정보를 추가해보세요 🌻</div>}
      {data.vendors.map(v=>(
        <div key={v.id} style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><Badge cat={v.category}/><button style={S.delBtn} onClick={()=>rm(v.id)}>✕</button></div>
          <div style={{fontWeight:700,fontSize:17,color:"#3E2723",marginBottom:4}}>{v.name}</div>
          {v.phone&&<div style={{fontSize:15,color:"#558B2F"}}>📞 {v.phone}</div>}
          {v.memo&&<div style={{fontSize:14,color:"#8D6E63",marginTop:4}}>📝 {v.memo}</div>}
        </div>
      ))}
    </div>
  </div>);
}

/* ═══════ EMAIL ═══════ */
function EmailTab({data,setData}){
  const[sending,setSending]=useState(false);const[result,setResult]=useState(null);
  const[smtp,setSmtp]=useState({smtpEmail:data.smtpEmail||"",smtpAppPassword:data.smtpAppPassword||"",email:data.email||""});
  const[serverUrl,setServerUrl]=useState(data.serverUrl||"http://localhost:5000");
  const saveSm=()=>{setData({...data,...smtp,serverUrl});setResult({ok:true,msg:"저장!"});setTimeout(()=>setResult(null),2000);};
  const send=async()=>{setSending(true);setResult(null);try{const r=await fetch(serverUrl+"/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({smtp_email:smtp.smtpEmail,smtp_password:smtp.smtpAppPassword,to_email:smtp.email,subject:"Wedding Planner | D-"+getDday(data.weddingDate),body:data.groomName+" + "+data.brideName+" Wedding Alert"})});if(r.ok){setResult({ok:true,msg:"발송 완료!"});setData({...data,emailLog:[...(data.emailLog||[]),{date:new Date().toISOString()}]});}else{const e=await r.json();setResult({ok:false,msg:e.error||"Error"});}}catch{setResult({ok:false,msg:"서버 연결 불가. Python 서버를 실행해주세요."});}setSending(false);};
  return(<div style={S.tab}>
    <h2 style={S.tabH}>📧 이메일 알림</h2>
    <div style={S.card}>
      <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:480}}>
        <div><label style={S.lbl}>서버 주소</label><input style={{...S.inp,width:"100%"}} value={serverUrl} onChange={e=>setServerUrl(e.target.value)}/></div>
        <div><label style={S.lbl}>발신 Gmail</label><input type="email" style={{...S.inp,width:"100%"}} value={smtp.smtpEmail} onChange={e=>setSmtp({...smtp,smtpEmail:e.target.value})}/></div>
        <div><label style={S.lbl}>앱 비밀번호</label><input type="password" style={{...S.inp,width:"100%"}} value={smtp.smtpAppPassword} onChange={e=>setSmtp({...smtp,smtpAppPassword:e.target.value})}/></div>
        <div><label style={S.lbl}>수신 이메일</label><input type="email" style={{...S.inp,width:"100%"}} value={smtp.email} onChange={e=>setSmtp({...smtp,email:e.target.value})}/></div>
        <div style={{display:"flex",gap:10}}><button style={S.btn1} onClick={saveSm}>저장</button><button style={{...S.addBtn,background:"#558B2F"}} onClick={send} disabled={sending}>{sending?"발송 중...":"📨 발송"}</button></div>
        {result&&<div style={{padding:"10px 14px",borderRadius:12,fontSize:14,background:result.ok?"#E8F5E9":"#FBE9E7",color:result.ok?"#2E7D32":"#C62828"}}>{result.msg}</div>}
      </div>
    </div>
  </div>);
}

/* ═══════ SETTINGS ═══════ */
function SettingsTab({data,setData,coupleKey,onLogout}){
  const[f,setF]=useState({groomName:data.groomName,brideName:data.brideName,weddingDate:data.weddingDate,weddingTime:data.weddingTime});
  const[saved,setSaved]=useState(false);
  const save=()=>{const m={};data.checklist.forEach(p=>p.items.forEach(i=>{m[i.id]=i.done;}));const nc=JSON.parse(JSON.stringify(CL)).map(p=>({...p,items:p.items.map(i=>({...i,done:m[i.id]||false}))}));setData({...data,...f,checklist:nc});setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return(<div style={S.tab}>
    <h2 style={S.tabH}>⚙️ 설정</h2>
    <div style={{...S.card,marginBottom:20}}>
      <div style={{fontSize:14,color:"#8D6E63",marginBottom:16}}>커플 키: <b style={{color:"#4E7D3A"}}>{coupleKey}</b></div>
      <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:480}}>
        <div><label style={S.lbl}>신랑</label><input style={{...S.inp,width:"100%"}} value={f.groomName} onChange={e=>setF({...f,groomName:e.target.value})}/></div>
        <div><label style={S.lbl}>신부</label><input style={{...S.inp,width:"100%"}} value={f.brideName} onChange={e=>setF({...f,brideName:e.target.value})}/></div>
        <div><label style={S.lbl}>결혼 예정일</label><input type="date" style={{...S.inp,width:"100%"}} value={f.weddingDate} onChange={e=>setF({...f,weddingDate:e.target.value})}/></div>
        <div><label style={S.lbl}>예식 시간</label><input type="time" style={{...S.inp,width:"100%"}} value={f.weddingTime} onChange={e=>setF({...f,weddingTime:e.target.value})}/></div>
        <div style={{display:"flex",gap:12,marginTop:8}}>
          <button style={S.btn1} onClick={save}>{saved?"✓ 저장!":"저장"}</button>
          <button style={{padding:"12px 20px",background:"#EFEBE9",color:"#8D6E63",border:"none",borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:FONT}} onClick={onLogout}>로그아웃</button>
        </div>
      </div>
    </div>
  </div>);
}

/* ═══════ MAIN APP ═══════ */
const TABS=[{id:"dashboard",label:"홈",icon:"🏡"},{id:"checklist",label:"체크리스트",icon:"🌿"},{id:"budget",label:"예산",icon:"🌻"},{id:"dates",label:"일정",icon:"📌"},{id:"vendors",label:"업체",icon:"📇"},{id:"email",label:"이메일",icon:"📧"},{id:"settings",label:"설정",icon:"⚙️"}];

export default function App(){
  const[coupleKey,setCoupleKey]=useState(null);
  const[data,setDataRaw]=useState(null);
  const[tab,setTab]=useState("dashboard");

  // Check if already logged in
  useEffect(()=>{const k=localStorage.getItem("wp_current_key");if(k){const d=loadData(k);if(d){setCoupleKey(k);setDataRaw(d);}}},[] );

  const handleLogin=(key,d)=>{setCoupleKey(key);setDataRaw(d);localStorage.setItem("wp_current_key",key);};
  const handleLogout=()=>{localStorage.removeItem("wp_current_key");setCoupleKey(null);setDataRaw(null);setTab("dashboard");};

  const setData=useCallback(nd=>{setDataRaw(nd);if(coupleKey)saveData(coupleKey,nd);},[coupleKey]);

  if(!coupleKey||!data)return<LoginScreen onLogin={handleLogin}/>;
  if(!data.isSetup)return<SetupScreen data={data} setData={setData}/>;

  return(
    <div style={S.app}>
      <nav style={S.side}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 12px 10px"}}><span style={{fontSize:24}}>🌿</span><span style={{fontSize:18,fontWeight:700,color:"#33691E"}}>Wedding</span></div>
        <div style={{fontSize:13,color:"#8D6E63",padding:"0 14px 14px",borderBottom:"1px solid #E8E0D8",marginBottom:10}}>{data.groomName} ♥ {data.brideName}</div>
        {TABS.map(t=><button key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:"none",borderRadius:12,fontSize:15,cursor:"pointer",fontFamily:FONT,background:tab===t.id?"#F1F8E9":"transparent",color:tab===t.id?"#33691E":"#8D6E63",fontWeight:tab===t.id?700:400}} onClick={()=>setTab(t.id)}><span>{t.icon}</span><span>{t.label}</span></button>)}
      </nav>
      <nav style={S.mob}>{TABS.map(t=><button key={t.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:"none",border:"none",padding:"6px 4px",cursor:"pointer",fontFamily:FONT,color:tab===t.id?"#33691E":"#BCAAA4",fontWeight:tab===t.id?700:400}} onClick={()=>setTab(t.id)}><span style={{fontSize:18}}>{t.icon}</span><span style={{fontSize:9}}>{t.label}</span></button>)}</nav>
      <main style={S.main}>
        {tab==="dashboard"&&<Dashboard data={data} setTab={setTab}/>}
        {tab==="checklist"&&<ChecklistTab data={data} setData={setData}/>}
        {tab==="budget"&&<BudgetTab data={data} setData={setData}/>}
        {tab==="dates"&&<KeyDatesTab data={data} setData={setData}/>}
        {tab==="vendors"&&<VendorTab data={data} setData={setData}/>}
        {tab==="email"&&<EmailTab data={data} setData={setData}/>}
        {tab==="settings"&&<SettingsTab data={data} setData={setData} coupleKey={coupleKey} onLogout={handleLogout}/>}
      </main>
    </div>
  );
}

/* ═══════ STYLES ═══════ */
const S={
  loginWrap:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(150deg,#FFFDE7 0%,#FFF9C4 25%,#F1F8E9 55%,#E8F5E9 100%)",padding:16,fontFamily:FONT,position:"relative",overflow:"hidden"},
  loginCard:{background:"rgba(255,255,255,0.92)",borderRadius:28,padding:"44px 36px",maxWidth:420,width:"100%",boxShadow:"0 20px 60px rgba(76,111,55,0.1)",textAlign:"center",backdropFilter:"blur(12px)",position:"relative",zIndex:2},
  lbl:{fontSize:14,fontWeight:700,color:"#5D4037",display:"block",marginBottom:5},
  inp:{padding:"12px 14px",border:"1.5px solid #D7CCC8",borderRadius:12,fontSize:15,outline:"none",fontFamily:FONT,color:"#3E2723",background:"rgba(255,255,255,0.9)",boxSizing:"border-box"},
  btn1:{padding:"14px 28px",background:"linear-gradient(135deg,#66BB6A,#81C784)",color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:FONT,boxShadow:"0 4px 14px rgba(102,187,106,0.3)"},
  app:{display:"flex",minHeight:"100vh",background:"#FFFEF7",fontFamily:FONT},
  side:{width:210,background:"rgba(255,253,247,0.98)",borderRight:"1px solid #E8E0D8",padding:"24px 12px",display:"flex",flexDirection:"column",gap:3,position:"fixed",top:0,left:0,bottom:0,zIndex:10},
  mob:{display:"none",position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,253,247,0.98)",borderTop:"1px solid #E8E0D8",zIndex:10,justifyContent:"space-around",padding:"5px 0 env(safe-area-inset-bottom,5px)"},
  main:{flex:1,marginLeft:210,padding:"28px 32px 80px",minHeight:"100vh",overflowY:"auto",maxWidth:900},
  ddayCard:{background:"linear-gradient(135deg,#FFFDE7 0%,#FFF9C4 25%,#F1F8E9 55%,#E8F5E9 100%)",borderRadius:28,padding:"48px 32px",textAlign:"center",border:"1px solid rgba(165,214,167,0.3)",position:"relative",overflow:"hidden"},
  card:{background:"#fff",borderRadius:20,padding:"24px 22px",border:"1px solid #E8E0D8",boxShadow:"0 2px 8px rgba(62,39,35,0.03)"},
  cardLbl:{fontSize:14,fontWeight:700,color:"#A1887F",marginBottom:10},
  linkBtn:{background:"none",border:"none",color:"#66BB6A",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FONT,padding:0},
  tab:{maxWidth:800},
  tabH:{fontSize:26,fontWeight:700,color:"#33691E",margin:"0 0 20px"},
  phaseCard:{background:"#fff",borderRadius:20,padding:"22px 22px 18px",border:"1px solid #E8E0D8"},
  addBtn:{padding:"12px 20px",background:"#66BB6A",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"},
  delBtn:{background:"none",border:"none",color:"#D7CCC8",fontSize:18,cursor:"pointer",padding:"2px 6px"},
  editBtn:{background:"#F5F0EB",border:"none",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:600,color:"#8D6E63",cursor:"pointer",fontFamily:FONT},
  sumBox:{flex:1,minWidth:130,background:"#fff",borderRadius:16,padding:"18px 20px",border:"1px solid #E8E0D8"},
  sumLbl:{display:"block",fontSize:13,color:"#A1887F",fontWeight:600,marginBottom:5},
  empty:{textAlign:"center",padding:"48px 20px",color:"#A1887F",fontSize:16,gridColumn:"1 / -1"},
};

/* ── Global styles ── */
const fl=document.createElement("link");fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Maru+Buri:wght@300;400;700&display=swap";document.head.appendChild(fl);
const se=document.createElement("style");se.textContent='@media(max-width:768px){nav[style*="width: 210"]{display:none !important;}nav[style*="display: none"]{display:flex !important;}main[style*="margin-left: 210"]{margin-left:0 !important;padding:20px 16px 100px !important;}}input:focus,select:focus{border-color:#81C784 !important;box-shadow:0 0 0 3px rgba(129,199,132,0.15) !important;}button:hover{opacity:0.88;}*{-webkit-font-smoothing:antialiased;box-sizing:border-box;}';document.head.appendChild(se);
