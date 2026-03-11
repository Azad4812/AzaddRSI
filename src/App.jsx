// cSpell:ignore Vinod Shivam
import { useState, useEffect, useCallback } from "react";

const TEAM = ["Vinod", "Shivam"];
const ISSUES = ["Pickup Issue", "Shipment Delivery Issue", "RTO Issue", "RVP Pickup Issue"];
const COURIERS = ["Ekart", "Delhivery", "Delhivery Premium", "Delhivery Air", "XpressBees", "Shadowfax", "Amazon", "BlueDart", "BlueDart Air", "Other"];
const STATUS = ["Resolved", "Pending", "Escalated"];
const SHIPPRIME_LOGO = "data:image/png;base64,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0TqGhdHUXuZv3uLnbAD7t/8AIdPmUX7hWVVwrpq6unkqKmd5fJI86ucT0r8raqprauWrrJ5KiomcXySSOLnOJ6SSvivaNj2OztNnhp51z1nx/pqWs1leprzPKO6BEV6wThm44sv8NotrRvv9lLK4exiYOdzv/wBxJAXcXr1FmiblycUxzmXFppmuYppjnK95SYGqMZ38Nla+O1UxDquYDTUdm0/jH5hqerWV1FS09FRw0dJE2GngYI4o2jQNaBoAPQrfhHD1uwxYoLRbItyGIaucfbSvPO93ef8A65grsvE+0O+V7rqMxyt0/hj9585+Tb9Do401HP8AFPUREWvucIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIg127JDKlzi52C7eSTqTvSf1L8/wPyo/Mq3+KT+pbFRBh+FssMBYXvDLvYMNUlBXMa5jZo3PLgHDQjiSOIWYIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgwHPG+YlsOETVYep+D3FlTVt4vpmnmIb38290enURVke+SR0kj3Pe8lznOOpJPOSVOWeKKogkgnjZLFI0sex41a5pGhBHSCFGXOfLWXCtU672lj5bLM/iOc0rj7l36PUfQeOhPo3YnddLbidJXTFNczyn/ANeU+cd3d8evQbxprlX3sTmI7vBrNEXqtNurbtcoLdbqZ9TVTu3I42DiT/IdJPQvSKqooiaqpxEOgiJmcQ+uH7RcL9eKe1WyAz1VQ7dY0cw6yT0ADiSpY5a4MocF2BlDBuS1kmj6up3dDK/q7mjmA9POSvDlRl/RYKte+/cqLtUNHqmo04Dp3GdTR8549QGbryHtR2knca/s9ifuo/8AqfH08I+PptO3aD2Ecdf4p+QiItPdqIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIC+VXTwVdLLS1ULJoJWlkkb26tc084I6QvqisTMTmE6o4ZiZNXmivfKYUpH11uqHatj5RofTn8UlxGreo/HzanaOUeXVJguhNVVGOpvM7dJpm8Wxt/EZr0dZ6VnyLvtZ2l1+s0saW5VyjrPfV6/7n3uFa2+zauTcpjn9PQREXQOcIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiIP//Z";
const SLACK_WEBHOOK = "https://hooks.slack.com/services/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";
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbyHOU-kIu-ozFO7dJRBKj63heHLBa4KnpiiTLoFX_X-yEBst8Qo-suWbHffnx6t46Bt/exec";

const KAM_MAP = {
  "Pickup Issue":            { name: "Azad Khan", email: "azad.k@cmsupport.live" },
  "RTO Issue":               { name: "Azad Khan", email: "azad.k@cmsupport.live" },
  "RVP Pickup Issue":        { name: "Anoop",     email: "anoop@cmsupport.live" },
  "Shipment Delivery Issue": { name: "Sagar",     email: "sagar@citymall.live" },
};

const todayStr = () => new Date().toLocaleDateString("en-CA", {timeZone:"Asia/Kolkata"});

async function sheetRequest(action, data) {
  try {
    await fetch("/api/sheet-action", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...data }),
    });
  } catch(e) { console.error("Sheet sync failed:", e); }
}

function timeDiff(t1, t2) {
  if (!t1 || !t2) return null;
  const [h1,m1] = t1.split(":").map(Number);
  const [h2,m2] = t2.split(":").map(Number);
  const d = h2*60+m2-(h1*60+m1);
  return d > 0 ? d : null;
}

function formatMins(m) {
  if (m===null||m===undefined) return "—";
  return m<60?`${m}m`:`${Math.floor(m/60)}h ${m%60}m`;
}

function formatDate(d) {
  if (!d) return "";
  const [y,mo,dd] = d.split("-");
  return `${dd}/${mo}/${y}`;
}

const S = {
  page: { minHeight:"100vh", background:"#0f1117", fontFamily:"'IBM Plex Mono','Courier New',monospace", color:"#e2e8f0", paddingBottom:60 },
  input: { background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"10px 14px", color:"#f1f5f9", fontFamily:"'IBM Plex Mono','Courier New',monospace", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" },
  label: { fontSize:10, color:"#64748b", letterSpacing:"0.1em", display:"block", marginBottom:6 },
  btn: (bg,col,dis) => ({ background:dis?"#334155":bg, color:dis?"#64748b":col, border:"none", borderRadius:8, padding:"13px 20px", fontFamily:"'IBM Plex Mono','Courier New',monospace", fontWeight:700, fontSize:12, cursor:dis?"not-allowed":"pointer", width:"100%", letterSpacing:"0.06em" }),
  card: (border) => ({ background:"#1e293b", border:`1px solid ${border||"#334155"}`, borderRadius:10, padding:"14px 16px" }),
};

const EMPTY = { sellerName:"", issue:ISSUES[0], courier:[], respondedBy:TEAM[0], sellerTime:"", teamTime:"", status:"Resolved", note:"" };

export default function App() {
  const [entries, setEntries]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);
  const [tab, setTab]               = useState("log");
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [filterFrom, setFilterFrom] = useState(todayStr());
  const [filterTo, setFilterTo]     = useState(todayStr());
  const [filterMode, setFilterMode] = useState("today");
  const [loadError, setLoadError]   = useState(null);
  const [sending, setSending]       = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [sendPreview, setSendPreview] = useState(null);

  const loadFromSheet = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res  = await fetch("/api/get-entries");
      const data = await res.json();
      if (data.success && data.entries) {
        setEntries(data.entries.map(e => {
          // Normalize status — trim + capitalize first letter
          const rawStatus = String(e.status||"").trim();
          const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
          const normalStatus = status === "Resolved" ? "Resolved" : status === "Escalated" ? "Escalated" : "Pending";
          return {
            ...e,
            id: Number(e.id),
            status: normalStatus,
            diffMins: e.diffMins ? Number(e.diffMins) : null,
            date: e.date ? new Date(e.date).toLocaleDateString("en-CA", {timeZone:"Asia/Kolkata"}) : e.date,
            resolvedDate: e.resolvedDate ? new Date(e.resolvedDate).toLocaleDateString("en-CA", {timeZone:"Asia/Kolkata"}) : "",
            sellerTime: e.sellerTime ? new Date(e.sellerTime).toLocaleTimeString("en-GB", {timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit"}) : e.sellerTime,
            teamTime: e.teamTime ? new Date(e.teamTime).toLocaleTimeString("en-GB", {timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit"}) : e.teamTime,
          };
        }));
      } else {
        setLoadError(data.error || JSON.stringify(data).slice(0,200));
      }
    } catch(e) { setLoadError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { loadFromSheet(); }, [loadFromSheet]);

  const diff = timeDiff(form.sellerTime, form.teamTime);

  const filtered = filterMode==="today"
    ? entries.filter(e => e.date===todayStr())
    : entries.filter(e => e.date>=filterFrom && e.date<=filterTo);

  const stats = TEAM.map(person => {
    const mine = filtered.filter(e => e.respondedBy===person);
    const resolved = mine.filter(e => e.status==="Resolved").length;
    const diffs = mine.map(e=>e.diffMins).filter(Boolean);
    const avg = diffs.length ? Math.round(diffs.reduce((a,b)=>a+b,0)/diffs.length) : null;
    const fastest = diffs.length ? Math.min(...diffs) : null;
    return { person, total:mine.length, resolved, avg, fastest };
  });

  const winner = stats.reduce((a,b) => {
    const sc = s => s.resolved*10+(s.avg!==null?Math.max(0,60-s.avg):0);
    return sc(a)>=sc(b)?a:b;
  }, stats[0]);

  const handleAdd = async () => {
    if (!form.sellerName||!form.sellerTime||!form.teamTime) return;
    setSyncStatus("saving");
    const entry = { ...form, courier:Array.isArray(form.courier)?form.courier.join(", "):form.courier||"", id:editId||Date.now(), diffMins:timeDiff(form.sellerTime,form.teamTime), date:todayStr(), resolvedDate: form.status==="Resolved" ? todayStr() : "" };
    try {
      if (editId) {
        setEntries(entries.map(e=>e.id===editId?entry:e));
        await sheetRequest("update",{entry});
        setEditId(null);
      } else {
        setEntries(p=>[...p,entry]);
        await sheetRequest("add",{entry});
      }
      setSyncStatus("saved");
      setTimeout(()=>setSyncStatus(null),2500);
    } catch { setSyncStatus("error"); }
    setForm(EMPTY);
  };

  const handleEdit = e => {
    const courierArr = Array.isArray(e.courier)?e.courier:e.courier?String(e.courier).split(",").map(x=>x.trim()).filter(Boolean):[];
    setForm({ sellerName:e.sellerName, issue:e.issue, courier:courierArr, respondedBy:e.respondedBy, sellerTime:e.sellerTime, teamTime:e.teamTime, status:e.status, note:e.note||"" });
    setEditId(e.id); setTab("log");
  };

  const handleDelete = async id => {
    setEntries(entries.filter(e=>e.id!==id));
    await sheetRequest("delete",{id});
  };

  const handleResolve = async id => {
    const entry = entries.find(e=>e.id===id);
    if (!entry || entry.status==="Resolved") return;
    const updated = {...entry, status:"Resolved", resolvedDate: todayStr()};
    setEntries(entries.map(e=>e.id===id?updated:e));
    await sheetRequest("update",{entry:updated});
  };

  // ONE button — sends BOTH Slack + Email together
  const sendAll = async () => {
    if (!filtered.length){ setSendStatus("❌ No entries to report."); return; }
    setSending(true); setSendStatus(null); setSendPreview(null);
    const dateLabel = filterMode==="today"
      ? `Today (${formatDate(todayStr())})`
      : `${formatDate(filterFrom)} → ${formatDate(filterTo)}`;
    const results = [];

    // 1. Send Slack
    try {
      const res = await fetch("/api/send-report", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ entries:filtered, stats, winner:winner.person, slackWebhook:SLACK_WEBHOOK })
      });
      const d = await res.json();
      if (d.success){ results.push("✅ Slack sent!"); setSendPreview(d.report); }
      else results.push(`❌ Slack: ${d.error}`);
    } catch { results.push("❌ Slack: Network error"); }

    // 2. Send Emails
    try {
      await sheetRequest("sendEmails", { entries:filtered, dateLabel });
      const kamsSent = [...new Set(filtered.map(e=>KAM_MAP[e.issue]?.name).filter(Boolean))];
      results.push(`✅ Emails sent to: ${kamsSent.join(", ")} + Mohit`);
    } catch { results.push("❌ Email sending failed"); }

    setSendStatus(results.join("\n"));
    setSending(false);
  };

  const issueCount = {};
  filtered.forEach(e=>{issueCount[e.issue]=(issueCount[e.issue]||0)+1;});
  const topIssue = Object.entries(issueCount).sort((a,b)=>b[1]-a[1])[0];

  const qBtn = (label,onClick,active) => (
    <button onClick={onClick} style={{background:active?"#f59e0b":"#1e293b",color:active?"#0f1117":"#94a3b8",border:"1px solid #334155",borderRadius:6,padding:"5px 10px",fontSize:10,fontFamily:"inherit",fontWeight:active?700:400,cursor:"pointer",whiteSpace:"nowrap"}}>{label}</button>
  );

  const DateFilter = () => (
    <div style={{...S.card(),marginBottom:16}}>
      <div style={{fontSize:10,color:"#64748b",letterSpacing:"0.1em",marginBottom:10}}>📅 DATE FILTER</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
        {qBtn("Today",()=>setFilterMode("today"),filterMode==="today")}
        {qBtn("Last 7 Days",()=>{const d=new Date();d.setDate(d.getDate()-6);setFilterFrom(d.toISOString().split("T")[0]);setFilterTo(todayStr());setFilterMode("custom");},false)}
        {qBtn("This Month",()=>{const d=new Date();d.setDate(1);setFilterFrom(d.toISOString().split("T")[0]);setFilterTo(todayStr());setFilterMode("custom");},false)}
        {qBtn("All Time",()=>{setFilterFrom("2020-01-01");setFilterTo(todayStr());setFilterMode("custom");},false)}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:120}}><div style={S.label}>FROM</div><input type="date" value={filterFrom} onChange={e=>{setFilterFrom(e.target.value);setFilterMode("custom");}} style={{...S.input,fontSize:12,padding:"8px 10px"}}/></div>
        <div style={{color:"#64748b",paddingBottom:10,fontSize:12}}>→</div>
        <div style={{flex:1,minWidth:120}}><div style={S.label}>TO</div><input type="date" value={filterTo} onChange={e=>{setFilterTo(e.target.value);setFilterMode("custom");}} style={{...S.input,fontSize:12,padding:"8px 10px"}}/></div>
        <button onClick={loadFromSheet} title="Refresh" style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"8px 12px",color:"#64748b",cursor:"pointer",fontSize:14,marginBottom:0}}>🔄</button>
      </div>
      <div style={{marginTop:8,fontSize:11,color:"#f59e0b"}}>
        {filterMode==="today"?`📆 Today — ${formatDate(todayStr())}`:`📆 ${formatDate(filterFrom)} → ${formatDate(filterTo)}`}
        <span style={{color:"#64748b",marginLeft:8}}>({filtered.length} entries)</span>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontSize:36}}>📦</div>
      <div style={{fontSize:14,color:"#f59e0b",letterSpacing:"0.1em"}}>LOADING FROM GOOGLE SHEET...</div>
      <div style={{fontSize:11,color:"#64748b"}}>Please wait</div>
    </div>
  );

  if (loadError) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:24}}>
      <div style={{fontSize:36}}>⚠️</div>
      <div style={{fontSize:14,color:"#f87171",letterSpacing:"0.1em"}}>FAILED TO LOAD DATA</div>
      <div style={{fontSize:11,color:"#94a3b8",background:"#1e293b",padding:"10px 16px",borderRadius:8,maxWidth:400,wordBreak:"break-all"}}>{loadError}</div>
      <button onClick={loadFromSheet} style={{background:"#f59e0b",color:"#0f1117",border:"none",borderRadius:8,padding:"10px 20px",fontFamily:"inherit",fontWeight:700,cursor:"pointer"}}>🔄 RETRY</button>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={{background:"linear-gradient(135deg,#1e293b 0%,#0f1117 100%)",borderBottom:"2px solid #f59e0b",padding:"20px 16px",position:"relative",overflow:"hidden"}}>
        <img src={SHIPPRIME_LOGO} style={{position:"absolute",right:-10,top:"50%",transform:"translateY(-50%)",height:60,opacity:0.06,pointerEvents:"none",userSelect:"none"}} alt=""/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:26}}>📦</span>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:"#f59e0b",letterSpacing:"0.05em"}}>SELLER RESPONSE TRACKER</div>
              <div style={{fontSize:10,color:"#64748b",letterSpacing:"0.1em"}}>WHATSAPP GROUP · EOD MONITOR</div>
            </div>
          </div>
          <button onClick={loadFromSheet} style={{background:"none",border:"1px solid #334155",borderRadius:8,padding:"6px 10px",color:"#64748b",cursor:"pointer",fontSize:16}}>🔄</button>
        </div>
        {syncStatus&&<div style={{fontSize:11,marginBottom:10,letterSpacing:"0.06em",color:syncStatus==="saved"?"#34d399":syncStatus==="error"?"#f87171":"#f59e0b"}}>
          {syncStatus==="saving"?"⏳ Saving...":syncStatus==="saved"?"✅ Saved to Google Sheet":"❌ Sync failed"}
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          {[
            {l:"TOTAL",v:filtered.length,c:"#f59e0b"},
            {l:"RESOLVED",v:filtered.filter(e=>e.status==="Resolved").length,c:"#34d399"},
            {l:"PENDING",v:filtered.filter(e=>e.status==="Pending").length,c:"#fb923c"},
            {l:"TOP ISSUE",v:topIssue?topIssue[0].replace("Shipment Delivery Issue","Shipment").replace("Pickup Issue","Pickup").replace("RTO Issue","RTO").replace("RVP Pickup Issue","RVP"):"—",c:"#a78bfa"},
          ].map(s=>(
            <div key={s.l} style={{background:"#0f1117",border:`1px solid ${s.c}33`,borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:8,color:"#64748b",letterSpacing:"0.1em"}}>{s.l}</div>
              <div style={{fontSize:18,fontWeight:700,color:s.c,marginTop:2}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid #1e293b",background:"#0f1117",overflowX:"auto"}}>
        {[["log","📝 LOG"],["entries",`📋 ALL (${filtered.length})`],["perf","🏆 STATS"],["eod","📤 EOD"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{background:"none",border:"none",cursor:"pointer",padding:"12px 14px",fontSize:11,fontFamily:"inherit",letterSpacing:"0.06em",fontWeight:700,whiteSpace:"nowrap",color:tab===id?"#f59e0b":"#475569",borderBottom:tab===id?"2px solid #f59e0b":"2px solid transparent",marginBottom:-1}}>{label}</button>
        ))}
      </div>

      <div style={{padding:"16px"}}>

        {tab==="log"&&(
          <div style={{maxWidth:580}}>
            <div style={{fontSize:12,color:"#f59e0b",fontWeight:700,letterSpacing:"0.1em",marginBottom:16}}>{editId?"✏️ EDIT ENTRY":"➕ NEW ENTRY"}</div>
            <div style={{display:"grid",gap:12}}>
              <div><label style={S.label}>SELLER NAME</label><input value={form.sellerName} onChange={e=>setForm({...form,sellerName:e.target.value})} placeholder="Enter seller name..." style={S.input}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={S.label}>ISSUE TYPE</label>
                  <select value={form.issue} onChange={e=>setForm({...form,issue:e.target.value})} style={S.input}>{ISSUES.map(i=><option key={i}>{i}</option>)}</select>
                  <div style={{fontSize:10,color:"#64748b",marginTop:4}}>📧 KAM: <span style={{color:"#f59e0b"}}>{KAM_MAP[form.issue]?.name}</span></div>
                </div>
                <div>
                  <label style={S.label}>COURIER PARTNER</label>
                  <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"8px 10px",maxHeight:130,overflowY:"auto"}}>
                    {COURIERS.map(co=>(
                      <label key={co} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",cursor:"pointer",fontSize:12,color:(form.courier||[]).includes(co)?"#f59e0b":"#94a3b8"}}>
                        <input type="checkbox" checked={(form.courier||[]).includes(co)} onChange={e=>{const cur=form.courier||[];setForm({...form,courier:e.target.checked?[...cur,co]:cur.filter(x=>x!==co)});}} style={{accentColor:"#f59e0b"}}/>
                        {co}
                      </label>
                    ))}
                  </div>
                  {(form.courier||[]).length>0&&<div style={{fontSize:10,color:"#f59e0b",marginTop:4}}>Selected: {(form.courier||[]).join(", ")}</div>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={S.label}>RESPONDED BY</label><select value={form.respondedBy} onChange={e=>setForm({...form,respondedBy:e.target.value})} style={S.input}>{TEAM.map(t=><option key={t}>{t}</option>)}</select></div>
                <div><label style={S.label}>STATUS</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={S.input}>{STATUS.map(s=><option key={s}>{s}</option>)}</select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={S.label}>⏰ SELLER RAISED AT</label><input type="time" value={form.sellerTime} onChange={e=>setForm({...form,sellerTime:e.target.value})} style={S.input}/></div>
                <div><label style={S.label}>✅ TEAM RESPONDED AT</label><input type="time" value={form.teamTime} onChange={e=>setForm({...form,teamTime:e.target.value})} style={S.input}/></div>
              </div>
              {diff!==null&&(
                <div style={{background:diff<=10?"#064e3b":diff<=30?"#451a03":"#450a0a",border:`1px solid ${diff<=10?"#34d399":diff<=30?"#f59e0b":"#f87171"}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{diff<=10?"🟢":diff<=30?"🟡":"🔴"}</span>
                  <div>
                    <div style={{fontSize:10,color:"#94a3b8"}}>RESPONSE TIME</div>
                    <div style={{fontSize:22,fontWeight:700,color:diff<=10?"#34d399":diff<=30?"#f59e0b":"#f87171"}}>{formatMins(diff)}</div>
                  </div>
                  <div style={{marginLeft:"auto",fontSize:10,color:"#64748b"}}>{diff<=10?"Excellent!":diff<=30?"Acceptable":"Needs work"}</div>
                </div>
              )}
              <div><label style={S.label}>NOTE (OPTIONAL)</label><input value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Any extra info..." style={S.input}/></div>
              <button onClick={handleAdd} disabled={!form.sellerName||!form.sellerTime||!form.teamTime} style={S.btn("#f59e0b","#0f1117",!form.sellerName||!form.sellerTime||!form.teamTime)}>
                {editId?"✏️ UPDATE ENTRY":"➕ ADD ENTRY"}
              </button>
              {editId&&<button onClick={()=>{setEditId(null);setForm(EMPTY);}} style={S.btn("#1e293b","#94a3b8",false)}>Cancel</button>}
            </div>
          </div>
        )}

        {tab==="entries"&&(
          <div>
            <DateFilter/>
            {filtered.length===0
              ?<div style={{color:"#475569",fontSize:13,textAlign:"center",padding:"40px 0"}}>No entries for this period.</div>
              :<div style={{display:"flex",flexDirection:"column",gap:10}}>
                {filtered.slice().reverse().map(e=>(
                  <div key={e.id} style={{background:"#1e293b",borderLeft:`4px solid ${e.status==="Resolved"?"#34d399":e.status==="Pending"?"#f59e0b":"#f87171"}`,border:"1px solid #334155",borderRadius:8,padding:"12px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:6}}>
                      <span style={{fontWeight:700,fontSize:14,color:"#f1f5f9"}}>{e.sellerName}</span>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:10,color:"#64748b"}}>{formatDate(e.date)}</span>
                        <span style={{background:e.status==="Resolved"?"#d1fae5":e.status==="Pending"?"#fef3c7":"#fee2e2",color:e.status==="Resolved"?"#065f46":e.status==="Pending"?"#92400e":"#991b1b",padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700}}>{e.status}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,color:"#64748b"}}>{e.issue}</span>
                      {e.courier&&(Array.isArray(e.courier)?e.courier:String(e.courier).split(",").map(x=>x.trim())).filter(Boolean).map(co=>(<span key={co} style={{fontSize:11,color:"#38bdf8",background:"#0c4a6e22",padding:"1px 6px",borderRadius:4,marginRight:2}}>{co}</span>))}
                      <span style={{fontSize:11,color:"#a78bfa"}}>📧 {KAM_MAP[e.issue]?.name}</span>
                    </div>
                    <div style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                      <div><div style={{fontSize:9,color:"#64748b"}}>BY</div><div style={{fontSize:12,fontWeight:700,color:"#a78bfa"}}>{e.respondedBy}</div></div>
                      <div><div style={{fontSize:9,color:"#64748b"}}>CREATED</div><div style={{fontSize:11,color:"#94a3b8"}}>{e.date}</div></div>
                      {e.resolvedDate&&e.resolvedDate!==e.date&&<div><div style={{fontSize:9,color:"#64748b"}}>RESOLVED</div><div style={{fontSize:11,color:"#34d399",fontWeight:700}}>{e.resolvedDate}</div></div>}
                      <div><div style={{fontSize:9,color:"#64748b"}}>TIME</div><div style={{fontSize:11,color:"#94a3b8"}}>{e.sellerTime}→{e.teamTime}</div></div>
                      <div><div style={{fontSize:9,color:"#64748b"}}>RESPONSE</div><div style={{fontSize:16,fontWeight:700,color:e.diffMins<=10?"#34d399":e.diffMins<=30?"#f59e0b":"#f87171"}}>{formatMins(e.diffMins)}</div></div>
                      <div style={{marginLeft:"auto",display:"flex",gap:6}}>
                        {e.status!=="Resolved"&&<button onClick={()=>handleResolve(e.id)} style={{background:"#064e3b",border:"1px solid #34d399",borderRadius:6,padding:"5px 10px",color:"#34d399",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700}}>✅ Resolve</button>}
                        <button onClick={()=>handleEdit(e)} style={{background:"#334155",border:"none",borderRadius:6,padding:"5px 10px",color:"#94a3b8",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Edit</button>
                        <button onClick={()=>handleDelete(e.id)} style={{background:"#450a0a",border:"none",borderRadius:6,padding:"5px 10px",color:"#f87171",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {tab==="perf"&&(
          <div>
            <DateFilter/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
              {stats.map(s=>(
                <div key={s.person} style={{...S.card(),position:"relative",border:`2px solid ${s.person===winner?.person&&filtered.length>0?"#f59e0b":"#334155"}`}}>
                  {s.person===winner?.person&&filtered.length>0&&<div style={{position:"absolute",top:-10,right:10,background:"#f59e0b",color:"#0f1117",fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:99}}>⭐ STAR</div>}
                  <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:10}}>{s.person}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {[["HANDLED",s.total,"#a78bfa"],["RESOLVED",s.resolved,"#34d399"],["AVG",formatMins(s.avg),"#38bdf8"],["FASTEST",formatMins(s.fastest),"#fb923c"]].map(([l,v,c])=>(
                      <div key={l} style={{background:"#0f1117",borderRadius:8,padding:"8px"}}>
                        <div style={{fontSize:8,color:"#64748b",letterSpacing:"0.1em"}}>{l}</div>
                        <div style={{fontSize:18,fontWeight:700,color:c,marginTop:2}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {s.total>0&&<div style={{marginTop:10}}>
                    <div style={{background:"#0f1117",borderRadius:99,height:5,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${(s.resolved/s.total)*100}%`,background:"linear-gradient(90deg,#34d399,#059669)",borderRadius:99}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                      <span style={{fontSize:10,color:"#f87171"}}>{s.total-s.resolved} pending</span>
                      <span style={{fontSize:10,color:"#34d399"}}>{Math.round((s.resolved/s.total)*100)}% resolved</span>
                    </div>
                  </div>}
                </div>
              ))}
            </div>
            <div style={{...S.card(),marginBottom:12}}>
              <div style={{fontSize:11,color:"#64748b",letterSpacing:"0.08em",marginBottom:12}}>📧 KAM BREAKDOWN</div>
              {Object.entries(KAM_MAP).reduce((acc,[issue,kam])=>{
                if(!acc.find(x=>x.email===kam.email)) acc.push({...kam,issues:[]});
                acc.find(x=>x.email===kam.email).issues.push(issue);
                return acc;
              },[]).map(kam=>{
                const tickets=filtered.filter(e=>kam.issues.includes(e.issue));
                return(
                  <div key={kam.email} style={{marginBottom:12,paddingBottom:12,borderBottom:"1px solid #0f1117"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div>
                        <span style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{kam.name}</span>
                        <span style={{fontSize:10,color:"#64748b",marginLeft:8}}>{kam.email}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <span style={{fontSize:14,fontWeight:700,color:"#f59e0b"}}>{tickets.length} tickets</span>
                        <div style={{fontSize:10,color:"#34d399"}}>✅ {tickets.filter(e=>e.status==="Resolved").length} resolved · <span style={{color:"#f87171"}}>⏳ {tickets.filter(e=>e.status!=="Resolved").length} pending</span></div>
                      </div>
                    </div>
                    <div style={{fontSize:10,color:"#64748b",marginBottom:6}}>{kam.issues.join(" · ")}</div>
                    <div style={{background:"#0f1117",borderRadius:99,height:5,overflow:"hidden"}}>
                      <div style={{height:"100%",width:filtered.length?`${(tickets.length/filtered.length)*100}%`:"0%",background:"#a78bfa",borderRadius:99}}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={S.card()}>
              <div style={{fontSize:11,color:"#64748b",letterSpacing:"0.08em",marginBottom:12}}>ISSUE BREAKDOWN</div>
              {ISSUES.map(issue=>{
                const all=filtered.filter(e=>e.issue===issue);
                const count=all.length;
                const resolvedCount=all.filter(e=>e.status==="Resolved").length;
                const pendingCount=count-resolvedCount;
                const pct=filtered.length?(count/filtered.length)*100:0;
                const resPct=count?(resolvedCount/count)*100:0;
                return <div key={issue} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,flexWrap:"wrap",gap:4}}>
                    <span style={{fontSize:11,color:"#94a3b8"}}>{issue}</span>
                    <div style={{display:"flex",gap:8}}>
                      <span style={{fontSize:10,color:"#34d399"}}>✅ {resolvedCount}</span>
                      <span style={{fontSize:10,color:"#f87171"}}>⏳ {pendingCount}</span>
                      <span style={{fontSize:11,color:"#f59e0b",fontWeight:700}}>{count} total</span>
                    </div>
                  </div>
                  <div style={{background:"#0f1117",borderRadius:99,height:6,overflow:"hidden",marginBottom:2}}>
                    <div style={{height:"100%",width:`${pct}%`,background:"#f59e0b",borderRadius:99}}/>
                  </div>
                  <div style={{background:"#0f1117",borderRadius:99,height:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${resPct}%`,background:"#34d399",borderRadius:99}}/>
                  </div>
                  <div style={{fontSize:9,color:"#34d399",textAlign:"right",marginTop:1}}>{Math.round(resPct)}% resolved</div>
                </div>;
              })}
            </div>

            {/* TEAM RESOLVE REPORT */}
            <div style={{...S.card(),marginTop:12}}>
              <div style={{fontSize:11,color:"#64748b",letterSpacing:"0.08em",marginBottom:14}}>📊 TEAM RESOLVE REPORT</div>
              {TEAM.map(person => {
                const resolved = filtered.filter(e=>e.respondedBy===person && e.status==="Resolved");
                const byDate = resolved.reduce((acc,e)=>{ acc[e.date]=(acc[e.date]||[]);acc[e.date].push(e);return acc; },{});
                return (
                  <div key={person} style={{marginBottom:18,paddingBottom:18,borderBottom:"1px solid #0f1117"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{person}</span>
                      <div style={{display:"flex",gap:8}}>
                        <span style={{background:"#064e3b",color:"#34d399",padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:700}}>✅ {resolved.length} resolved</span>
                        <span style={{background:"#1e293b",color:"#64748b",padding:"2px 10px",borderRadius:99,fontSize:11}}>📋 {filtered.filter(e=>e.respondedBy===person).length} total</span>
                      </div>
                    </div>
                    {Object.keys(byDate).length === 0
                      ? <div style={{fontSize:11,color:"#475569"}}>No resolved tickets in this period.</div>
                      : Object.entries(byDate).sort((a,b)=>b[0].localeCompare(a[0])).map(([date, tickets])=>(
                        <div key={date} style={{marginBottom:8}}>
                          <div style={{fontSize:10,color:"#f59e0b",fontWeight:700,marginBottom:4}}>📅 {date} — {tickets.length} ticket{tickets.length>1?"s":""}</div>
                          {tickets.map(t=>(
                            <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0f1117",borderRadius:6,padding:"6px 10px",marginBottom:4}}>
                              <div>
                                <span style={{fontSize:11,color:"#f1f5f9",fontWeight:600}}>{t.sellerName}</span>
                                <span style={{fontSize:10,color:"#64748b",marginLeft:8}}>{t.issue}</span>
                              </div>
                              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                {t.courier&&<span style={{fontSize:10,color:"#38bdf8"}}>{t.courier}</span>}
                                <span style={{fontSize:12,fontWeight:700,color:t.diffMins<=10?"#34d399":t.diffMins<=30?"#f59e0b":"#f87171"}}>{t.diffMins?`${t.diffMins}m`:"—"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                    }
                  </div>
                );
              })}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid #334155"}}>
                <span style={{fontSize:12,color:"#64748b"}}>TOTAL RESOLVED</span>
                <span style={{fontSize:14,fontWeight:700,color:"#34d399"}}>{filtered.filter(e=>e.status==="Resolved").length} / {filtered.length} tickets</span>
              </div>
            </div>
          </div>
        )}

        {tab==="eod"&&(
          <div style={{maxWidth:560}}>
            <div style={{fontSize:12,color:"#f59e0b",fontWeight:700,letterSpacing:"0.1em",marginBottom:4}}>📤 EOD REPORT</div>
            <div style={{fontSize:12,color:"#64748b",marginBottom:16}}>Sends Slack + Emails to KAMs and Mohit in one click.</div>
            <DateFilter/>
            <div style={{...S.card(),marginBottom:16}}>
              <div style={{fontSize:10,color:"#64748b",marginBottom:10,letterSpacing:"0.08em"}}>📧 EMAIL ROUTING</div>
              {[
                {who:"Azad Khan",issues:"Pickup + RTO",count:filtered.filter(e=>e.issue==="Pickup Issue"||e.issue==="RTO Issue").length},
                {who:"Anoop",issues:"RVP Pickup",count:filtered.filter(e=>e.issue==="RVP Pickup Issue").length},
                {who:"Sagar",issues:"Shipment Delivery",count:filtered.filter(e=>e.issue==="Shipment Delivery Issue").length},
                {who:"Mohit",issues:"All tickets (compiled)",count:filtered.length},
              ].map(k=>(
                <div key={k.who} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #0f1117"}}>
                  <div>
                    <span style={{fontSize:12,fontWeight:700,color:"#f1f5f9"}}>{k.who}</span>
                    <div style={{fontSize:10,color:"#64748b"}}>{k.issues}</div>
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:k.count>0?"#f59e0b":"#475569"}}>{k.count} tickets</span>
                </div>
              ))}
            </div>

            <button onClick={sendAll} disabled={sending||!filtered.length} style={{...S.btn(sending?"#334155":"#f59e0b",sending?"#64748b":"#0f1117",sending||!filtered.length),fontSize:13,padding:"16px 20px",marginBottom:10}}>
              {sending?"⏳ SENDING REPORT...":"🚀 SEND EOD REPORT (Slack + Email)"}
            </button>
            {filtered.length===0&&<div style={{fontSize:11,color:"#64748b",textAlign:"center",marginBottom:10}}>Add at least one entry first.</div>}
            {sendStatus&&(
              <div style={{marginBottom:12,padding:"14px 16px",background:"#1e293b",border:"1px solid #334155",borderRadius:8,fontSize:12,whiteSpace:"pre-line"}}>
                {sendStatus.split("\n").map((line,i)=>(
                  <div key={i} style={{color:line.startsWith("✅")?"#34d399":line.startsWith("❌")?"#f87171":"#94a3b8",marginBottom:4}}>{line}</div>
                ))}
              </div>
            )}
            {sendPreview&&<div style={{...S.card(),marginTop:8}}>
              <div style={{fontSize:10,color:"#64748b",marginBottom:8}}>📋 SLACK PREVIEW</div>
              <pre style={{fontSize:11,color:"#94a3b8",whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{sendPreview}</pre>
            </div>}
          </div>
        )}

      </div>
    </div>
  );
}
