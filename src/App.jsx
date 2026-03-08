// cSpell:ignore Vinod Shivam
import { useState, useEffect, useCallback } from "react";

const TEAM = ["Vinod", "Shivam"];
const ISSUES = ["Pickup Issue", "Shipment Delivery Issue", "RTO Issue", "RVP Pickup Issue"];
const COURIERS = ["Delhivery", "Ecom Express", "XpressBees", "BlueDart", "DTDC", "Other"];
const STATUS = ["Resolved", "Pending", "Escalated"];
const SLACK_WEBHOOK = "https://hooks.slack.com/services/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";
const SHEET_API_URL = "https://script.google.com/a/macros/cmsupport.live/s/AKfycbytwqM4faw5bREETuMFVfdH4C7sN9xXmcv3en4hJES9--72eBaFWoYQvGnTkASDXTU0/exec";

const KAM_MAP = {
  "Pickup Issue":            { name: "Azad Khan",  email: "azad.k@cmsupport.live" },
  "RTO Issue":               { name: "Azad Khan",  email: "azad.k@cmsupport.live" },
  "RVP Pickup Issue":        { name: "Anoop",      email: "anoop@cmsupport.live" },
  "Shipment Delivery Issue": { name: "Sagar",      email: "sagar@citymall.live" },
};

const todayStr = () => new Date().toISOString().split("T")[0];

async function sheetRequest(action, data) {
  try {
    await fetch(SHEET_API_URL, {
      method: "POST", headers: { "Content-Type": "text/plain" },
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

const EMPTY = { sellerName:"", issue:ISSUES[0], courier:COURIERS[0], respondedBy:TEAM[0], sellerTime:"", teamTime:"", status:"Resolved", note:"" };

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
  const [slackLoading, setSlackLoading] = useState(false);
  const [slackStatus, setSlackStatus]   = useState(null);
  const [slackPreview, setSlackPreview] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus]   = useState(null);

  const loadFromSheet = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(SHEET_API_URL);
      const data = await res.json();
      if (data.success && data.entries) {
        setEntries(data.entries.map(e => ({
          ...e, id:Number(e.id),
          diffMins: e.diffMins ? Number(e.diffMins) : null,
        })));
      }
    } catch(e) { console.error("Load failed:", e); }
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
    const entry = { ...form, id:editId||Date.now(), diffMins:timeDiff(form.sellerTime,form.teamTime), date:todayStr() };
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
    setForm({ sellerName:e.sellerName, issue:e.issue, courier:e.courier||COURIERS[0], respondedBy:e.respondedBy, sellerTime:e.sellerTime, teamTime:e.teamTime, status:e.status, note:e.note||"" });
    setEditId(e.id); setTab("log");
  };

  const handleDelete = async id => {
    setEntries(entries.filter(e=>e.id!==id));
    await sheetRequest("delete",{id});
  };

  const sendSlack = async () => {
    if (!filtered.length){setSlackStatus("❌ No entries.");return;}
    setSlackLoading(true); setSlackStatus(null); setSlackPreview(null);
    try {
      const res = await fetch("/api/send-report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({entries:filtered,stats,winner:winner.person,slackWebhook:SLACK_WEBHOOK})});
      const d = await res.json();
      if (d.success){setSlackPreview(d.report);setSlackStatus("✅ Sent to Slack!");}
      else setSlackStatus(`❌ ${d.error}`);
    } catch {setSlackStatus("❌ Network error.");}
    setSlackLoading(false);
  };

  const sendEmails = async () => {
    if (!filtered.length){setEmailStatus("❌ No entries to send.");return;}
    setEmailLoading(true); setEmailStatus(null);
    const dateLabel = filterMode==="today"
      ? `Today (${formatDate(todayStr())})`
      : `${formatDate(filterFrom)} → ${formatDate(filterTo)}`;
    try {
      await sheetRequest("sendEmails",{ entries:filtered, dateLabel });
      const kamsSent = [...new Set(filtered.map(e=>KAM_MAP[e.issue]?.name).filter(Boolean))];
      setEmailStatus(`✅ Emails sent!\n📧 ${kamsSent.join(", ")} + Mohit (compiled)`);
    } catch { setEmailStatus("❌ Email sending failed."); }
    setEmailLoading(false);
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

  return (
    <div style={S.page}>
      <div style={{background:"linear-gradient(135deg,#1e293b 0%,#0f1117 100%)",borderBottom:"2px solid #f59e0b",padding:"20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:26}}>📦</span>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:"#f59e0b",letterSpacing:"0.05em"}}>SELLER RESPONSE TRACKER</div>
              <div style={{fontSize:10,color:"#64748b",letterSpacing:"0.1em"}}>WHATSAPP GROUP · EOD MONITOR</div>
            </div>
          </div>
          <button onClick={loadFromSheet} title="Refresh from Sheet" style={{background:"none",border:"1px solid #334155",borderRadius:8,padding:"6px 10px",color:"#64748b",cursor:"pointer",fontSize:16}}>🔄</button>
        </div>
        {syncStatus&&<div style={{fontSize:11,marginBottom:10,letterSpacing:"0.06em",color:syncStatus==="saved"?"#34d399":syncStatus==="error"?"#f87171":"#f59e0b"}}>
          {syncStatus==="saving"?"⏳ Saving to Google Sheet...":syncStatus==="saved"?"✅ Saved to Google Sheet":"❌ Sync failed"}
        </div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
          {[
            {l:"TOTAL",v:filtered.length,c:"#f59e0b"},
            {l:"RESOLVED",v:filtered.filter(e=>e.status==="Resolved").length,c:"#34d399"},
            {l:"PENDING",v:filtered.filter(e=>e.status==="Pending").length,c:"#fb923c"},
            {l:"TOP ISSUE",v:topIssue?topIssue[0].split(" ")[0]:"—",c:"#a78bfa"},
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
                <div><label style={S.label}>COURIER PARTNER</label><select value={form.courier} onChange={e=>setForm({...form,courier:e.target.value})} style={S.input}>{COURIERS.map(c=><option key={c}>{c}</option>)}</select></div>
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
              {editId&&<button onClick={()=>{setEditId(null);setForm(EMPTY);}} style={S.btn("#1e293b","#94a3b8",false)}>
