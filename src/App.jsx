// cSpell:ignore Vinod Shivam
import { useState } from "react";

const TEAM = ["Vinod", "Shivam"];
const ISSUES = [
  "Pickup Issue",
  "Shipment Delivery Issue",
  "RTO Issue",
  "RVP Pickup Issue",
];
const STATUS = ["Resolved", "Pending", "Escalated"];
const SLACK_WEBHOOK = "https://hooks.slack.com/services/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";

// Paste your Google Apps Script Web App URL here after Step 2 below
const SHEET_API_URL = "https://script.google.com/a/macros/cmsupport.live/s/AKfycbytwqM4faw5bREETuMFVfdH4C7sN9xXmcv3en4hJES9--72eBaFWoYQvGnTkASDXTU0/exec";

async function syncToSheet(action, data) {
  if (!SHEET_API_URL || SHEET_API_URL === "YOUR_APPS_SCRIPT_URL_HERE") return;
  try {
    await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action, ...data }),
    });
  } catch (err) {
    console.error("Sheet sync failed:", err);
  }
}

function timeDiff(t1, t2) {
  if (!t1 || !t2) return null;
  const [h1, m1] = t1.split(":").map(Number);
  const [h2, m2] = t2.split(":").map(Number);
  const diff = h2 * 60 + m2 - (h1 * 60 + m1);
  return diff > 0 ? diff : null;
}

function formatMins(mins) {
  if (mins === null || mins === undefined) return "—";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function Badge({ color, children }) {
  const colors = {
    green: { background: "#d1fae5", color: "#065f46" },
    amber: { background: "#fef3c7", color: "#92400e" },
    red: { background: "#fee2e2", color: "#991b1b" },
  };
  return (
    <span style={{
      ...colors[color],
      padding: "2px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      fontFamily: "inherit"
    }}>{children}</span>
  );
}

const inputStyle = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
  padding: "10px 14px", color: "#f1f5f9",
  fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
};

export default function App() {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState("log");
  const [slackStatus, setSlackStatus] = useState(null);
  const [slackLoading, setSlackLoading] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    sellerName: "", issue: ISSUES[0], respondedBy: TEAM[0],
    sellerTime: "", teamTime: "", status: "Resolved", note: "",
  });

  const diff = timeDiff(form.sellerTime, form.teamTime);

  const handleAdd = () => {
    if (!form.sellerName || !form.sellerTime || !form.teamTime) return;
    const entry = { id: Date.now(), ...form, diffMins: timeDiff(form.sellerTime, form.teamTime) };
    if (editId !== null) {
      const updated = { ...entry, id: editId };
      setEntries(entries.map(e => e.id === editId ? updated : e));
      syncToSheet("update", { entry: updated });
      setEditId(null);
    } else {
      setEntries([...entries, entry]);
      syncToSheet("add", { entry });
    }
    setForm({ sellerName: "", issue: ISSUES[0], respondedBy: TEAM[0], sellerTime: "", teamTime: "", status: "Resolved", note: "" });
  };

  const handleEdit = (entry) => {
    setForm({ sellerName: entry.sellerName, issue: entry.issue, respondedBy: entry.respondedBy, sellerTime: entry.sellerTime, teamTime: entry.teamTime, status: entry.status, note: entry.note || "" });
    setEditId(entry.id);
    setTab("log");
  };

  const handleDelete = (id) => {
    setEntries(entries.filter(e => e.id !== id));
    syncToSheet("delete", { id });
  };

  const stats = TEAM.map(person => {
    const mine = entries.filter(e => e.respondedBy === person);
    const resolved = mine.filter(e => e.status === "Resolved").length;
    const diffs = mine.map(e => e.diffMins).filter(Boolean);
    const avg = diffs.length ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : null;
    const fastest = diffs.length ? Math.min(...diffs) : null;
    return { person, total: mine.length, resolved, avg, fastest };
  });

  const winner = stats.reduce((a, b) => {
    const scoreA = a.resolved * 10 + (a.avg !== null ? Math.max(0, 60 - a.avg) : 0);
    const scoreB = b.resolved * 10 + (b.avg !== null ? Math.max(0, 60 - b.avg) : 0);
    return scoreA >= scoreB ? a : b;
  }, stats[0]);

  const sendEODReport = async () => {
    if (entries.length === 0) { setSlackStatus("❌ No entries to report yet."); return; }
    setSlackLoading(true);
    setSlackStatus(null);
    setPreviewReport(null);
    try {
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries, stats, winner: winner.person, slackWebhook: SLACK_WEBHOOK }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewReport(data.report);
        setSlackStatus("✅ EOD Report successfully sent to Slack!");
      } else {
        setSlackStatus(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setSlackStatus("❌ Network error. Make sure the app is deployed on Vercel.");
    }
    setSlackLoading(false);
  };

  const issueCount = {};
  entries.forEach(e => { issueCount[e.issue] = (issueCount[e.issue] || 0) + 1; });
  const topIssue = Object.entries(issueCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", fontFamily: "'IBM Plex Mono', 'Courier New', monospace", color: "#e2e8f0", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f1117 100%)", borderBottom: "2px solid #f59e0b", padding: "24px 32px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <span style={{ fontSize: 28 }}>📦</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f59e0b", letterSpacing: "0.05em" }}>SELLER RESPONSE TRACKER</div>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.1em" }}>WHATSAPP GROUP · EOD PERFORMANCE MONITOR</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
          {[
            { label: "TOTAL ISSUES", value: entries.length, color: "#f59e0b" },
            { label: "RESOLVED", value: entries.filter(e => e.status === "Resolved").length, color: "#34d399" },
            { label: "PENDING", value: entries.filter(e => e.status === "Pending").length, color: "#fb923c" },
            { label: "TOP ISSUE", value: topIssue ? topIssue[0].split(" ")[0] : "—", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} style={{ background: "#1e293b", border: `1px solid ${s.color}33`, borderRadius: 8, padding: "8px 16px", minWidth: 100 }}>
              <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.12em", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e293b", padding: "0 32px", background: "#0f1117" }}>
        {[
          { id: "log", label: "📝 LOG ENTRY" },
          { id: "entries", label: `📋 ALL ENTRIES (${entries.length})` },
          { id: "performance", label: "🏆 PERFORMANCE" },
          { id: "eod", label: "📤 EOD REPORT" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "14px 20px", fontSize: 11, fontFamily: "inherit",
            letterSpacing: "0.08em", fontWeight: 700,
            color: tab === t.id ? "#f59e0b" : "#475569",
            borderBottom: tab === t.id ? "2px solid #f59e0b" : "2px solid transparent",
            transition: "all 0.15s", marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "28px 32px" }}>

        {/* LOG ENTRY */}
        {tab === "log" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 20 }}>
              {editId ? "✏️ EDIT ENTRY" : "➕ NEW ENTRY"}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>SELLER NAME</span>
                <input value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} placeholder="Enter seller name..." style={inputStyle} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>ISSUE TYPE</span>
                  <select value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} style={inputStyle}>
                    {ISSUES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>RESPONDED BY</span>
                  <select value={form.respondedBy} onChange={e => setForm({ ...form, respondedBy: e.target.value })} style={inputStyle}>
                    {TEAM.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>⏰ SELLER RAISED ISSUE AT</span>
                  <input type="time" value={form.sellerTime} onChange={e => setForm({ ...form, sellerTime: e.target.value })} style={inputStyle} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>✅ TEAM RESPONDED AT</span>
                  <input type="time" value={form.teamTime} onChange={e => setForm({ ...form, teamTime: e.target.value })} style={inputStyle} />
                </label>
              </div>
              {diff !== null && (
                <div style={{
                  background: diff <= 10 ? "#064e3b" : diff <= 30 ? "#451a03" : "#450a0a",
                  border: `1px solid ${diff <= 10 ? "#34d399" : diff <= 30 ? "#f59e0b" : "#f87171"}`,
                  borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10
                }}>
                  <span style={{ fontSize: 20 }}>{diff <= 10 ? "🟢" : diff <= 30 ? "🟡" : "🔴"}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>RESPONSE TIME</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: diff <= 10 ? "#34d399" : diff <= 30 ? "#f59e0b" : "#f87171" }}>{formatMins(diff)}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 11, color: "#64748b" }}>
                    {diff <= 10 ? "Excellent!" : diff <= 30 ? "Acceptable" : "Needs improvement"}
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>STATUS</span>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                    {STATUS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.1em" }}>NOTE (OPTIONAL)</span>
                  <input value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Any extra info..." style={inputStyle} />
                </label>
              </div>
              <button onClick={handleAdd} disabled={!form.sellerName || !form.sellerTime || !form.teamTime} style={{
                background: "#f59e0b", color: "#0f1117", border: "none", borderRadius: 8,
                padding: "14px 24px", fontFamily: "inherit", fontWeight: 700,
                fontSize: 13, letterSpacing: "0.08em", cursor: "pointer",
                opacity: (!form.sellerName || !form.sellerTime || !form.teamTime) ? 0.4 : 1,
              }}>
                {editId ? "✏️ UPDATE ENTRY" : "➕ ADD ENTRY"}
              </button>
              {editId && (
                <button onClick={() => { setEditId(null); setForm({ sellerName: "", issue: ISSUES[0], respondedBy: TEAM[0], sellerTime: "", teamTime: "", status: "Resolved", note: "" }); }} style={{ background: "none", color: "#64748b", border: "1px solid #1e293b", borderRadius: 8, padding: "10px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Cancel</button>
              )}
            </div>
          </div>
        )}

        {/* ALL ENTRIES */}
        {tab === "entries" && (
          <div>
            <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>📋 TODAY'S ENTRIES</div>
            {entries.length === 0 ? (
              <div style={{ color: "#475569", fontSize: 13, padding: "40px 0", textAlign: "center" }}>No entries yet. Go to LOG ENTRY to add issues.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {entries.map(e => (
                  <div key={e.id} style={{
                    background: "#1e293b", border: "1px solid #334155",
                    borderLeft: `4px solid ${e.status === "Resolved" ? "#34d399" : e.status === "Pending" ? "#f59e0b" : "#f87171"}`,
                    borderRadius: 8, padding: "14px 18px",
                    display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"
                  }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>{e.sellerName}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{e.issue}</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 10, color: "#64748b" }}>BY</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>{e.respondedBy}</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 100 }}>
                      <div style={{ fontSize: 10, color: "#64748b" }}>SELLER → TEAM</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{e.sellerTime} → {e.teamTime}</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 70 }}>
                      <div style={{ fontSize: 10, color: "#64748b" }}>RESPONSE</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: e.diffMins <= 10 ? "#34d399" : e.diffMins <= 30 ? "#f59e0b" : "#f87171" }}>{formatMins(e.diffMins)}</div>
                    </div>
                    <Badge color={e.status === "Resolved" ? "green" : e.status === "Pending" ? "amber" : "red"}>{e.status}</Badge>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleEdit(e)} style={{ background: "#334155", border: "none", borderRadius: 6, padding: "6px 12px", color: "#94a3b8", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>Edit</button>
                      <button onClick={() => handleDelete(e.id)} style={{ background: "#450a0a", border: "none", borderRadius: 6, padding: "6px 12px", color: "#f87171", cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PERFORMANCE */}
        {tab === "performance" && (
          <div>
            <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 20 }}>🏆 TEAM PERFORMANCE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {stats.map(s => (
                <div key={s.person} style={{ background: "#1e293b", border: `2px solid ${s.person === winner?.person ? "#f59e0b" : "#334155"}`, borderRadius: 12, padding: "20px 24px", position: "relative" }}>
                  {s.person === winner?.person && entries.length > 0 && (
                    <div style={{ position: "absolute", top: -12, right: 16, background: "#f59e0b", color: "#0f1117", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.08em" }}>⭐ STAR TODAY</div>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>{s.person}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "ISSUES HANDLED", value: s.total, color: "#a78bfa" },
                      { label: "RESOLVED", value: s.resolved, color: "#34d399" },
                      { label: "AVG RESPONSE", value: formatMins(s.avg), color: "#38bdf8" },
                      { label: "FASTEST", value: formatMins(s.fastest), color: "#fb923c" },
                    ].map(m => (
                      <div key={m.label} style={{ background: "#0f1117", borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ fontSize: 9, color: "#64748b", letterSpacing: "0.1em" }}>{m.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  {s.total > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>RESOLUTION RATE</div>
                      <div style={{ background: "#0f1117", borderRadius: 99, height: 8, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(s.resolved / s.total) * 100}%`, background: "linear-gradient(90deg, #34d399, #059669)", borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#34d399", marginTop: 4, textAlign: "right" }}>{Math.round((s.resolved / s.total) * 100)}%</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 12, color: "#64748b", letterSpacing: "0.08em", marginBottom: 14 }}>ISSUE TYPE BREAKDOWN</div>
              {ISSUES.map(issue => {
                const count = entries.filter(e => e.issue === issue).length;
                const pct = entries.length ? (count / entries.length) * 100 : 0;
                return (
                  <div key={issue} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{issue}</span>
                      <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>{count}</span>
                    </div>
                    <div style={{ background: "#0f1117", borderRadius: 99, height: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EOD REPORT */}
        {tab === "eod" && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>📤 SEND EOD REPORT TO SLACK</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>AI will analyse today's entries and post a performance summary to your Slack channel automatically.</div>

            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, letterSpacing: "0.08em" }}>REPORT WILL INCLUDE</div>
              {[
                `📊 Total: ${entries.length} issues, ${entries.filter(e => e.status === "Resolved").length} resolved`,
                `🏆 Star of the day: ${entries.length > 0 ? winner?.person : "TBD"}`,
                `👥 Vinod: ${stats[0].total} issues, avg ${formatMins(stats[0].avg)}`,
                `👥 Shivam: ${stats[1].total} issues, avg ${formatMins(stats[1].avg)}`,
                `💡 AI-generated insight for tomorrow`,
              ].map((line, i) => (
                <div key={i} style={{ fontSize: 12, color: "#94a3b8", padding: "5px 0", borderBottom: i < 4 ? "1px solid #0f1117" : "none" }}>{line}</div>
              ))}
            </div>

            <button onClick={sendEODReport} disabled={slackLoading || entries.length === 0} style={{
              background: slackLoading ? "#334155" : "#4ade80",
              color: "#0f1117", border: "none", borderRadius: 8,
              padding: "14px 28px", fontFamily: "inherit", fontWeight: 700,
              fontSize: 13, letterSpacing: "0.08em", cursor: slackLoading || entries.length === 0 ? "not-allowed" : "pointer",
              opacity: entries.length === 0 ? 0.4 : 1, width: "100%",
            }}>
              {slackLoading ? "⏳ GENERATING & SENDING..." : "🚀 SEND EOD REPORT TO SLACK"}
            </button>

            {slackStatus && (
              <div style={{
                marginTop: 14, padding: "12px 16px",
                background: slackStatus.startsWith("✅") ? "#064e3b" : "#450a0a",
                border: `1px solid ${slackStatus.startsWith("✅") ? "#34d399" : "#f87171"}`,
                borderRadius: 8, fontSize: 13,
                color: slackStatus.startsWith("✅") ? "#34d399" : "#f87171"
              }}>{slackStatus}</div>
            )}

            {previewReport && (
              <div style={{ marginTop: 20, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "16px 20px" }}>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em", marginBottom: 10 }}>📋 REPORT PREVIEW</div>
                <pre style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{previewReport}</pre>
              </div>
            )}

            {entries.length === 0 && (
              <div style={{ marginTop: 12, fontSize: 12, color: "#64748b", textAlign: "center" }}>Add at least one entry before sending the report.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
