import { useState, useMemo, useEffect, useCallback } from "react";
import ExportButton from "../../components/ExportButton";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const API = `${import.meta.env.VITE_API_URL}/api/v1`;
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });
const jsonHeaders = () => ({ ...authHeaders(), "Content-Type": "application/json" });

const statusColor = (s) => {
  if (s === "resolved")  return "text-green-400 bg-green-900/20 border-green-700/40";
  if (s === "assigned")  return "text-blue-400 bg-blue-900/20 border-blue-700/40";
  if (s === "pending")   return "text-amber-400 bg-amber-900/20 border-amber-700/40";
  return "text-slate-400 bg-slate-800 border-slate-700";
};

const categoryIcon = (c = "") => {
  const map = { garbage:"🗑️", bad_road:"🛣️", broken_light:"💡", waterlogging:"💧", other:"📋" };
  return map[c] || "📋";
};
const categoryLabel = (c = "") => {
  const map = { garbage:"Sanitation", bad_road:"Road", broken_light:"Electricity", waterlogging:"Water", other:"Other" };
  return map[c] || c;
};
const categoryAccent = (c = "") => {
  const map = { garbage:"#34d399", bad_road:"#f59e0b", broken_light:"#facc15", waterlogging:"#60a5fa", other:"#FF9933" };
  return map[c] || "#FF9933";
};

const timeAgo = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

const scoreApplicant = (b) => {
  const maxAmount = 10000, maxDays = 30;
  return (1 - b.estimatedAmount / maxAmount) * 0.5 + (1 - b.estimatedDays / maxDays) * 0.5;
};

const Badge = ({ label, className = "" }) => (
  <span className={`text-[9px] font-mono px-2 py-0.5 border uppercase tracking-widest ${className}`}>{label}</span>
);

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060e1f; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; }
  .serif { font-family: 'Source Serif 4', Georgia, serif; }
  .tricolor { background: linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%); }
  .gov-grid { background-image: linear-gradient(rgba(255,153,51,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,153,51,0.02) 1px,transparent 1px); background-size:48px 48px; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:#0a1628; }
  ::-webkit-scrollbar-thumb { background:#FF9933; border-radius:2px; }

  .card { border:1px solid rgba(255,153,51,0.18); background:#0a1628; transition:border-color 0.2s; }
  .card:hover { border-color:rgba(255,153,51,0.45); }

  .btn-primary { background:#FF9933; color:#060e1f; border:none; font-family:'JetBrains Mono',monospace; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; font-size:10px; cursor:pointer; padding:9px 18px; transition:background 0.15s; }
  .btn-primary:hover { background:#ffb347; }
  .btn-primary:disabled { background:#334155; color:#64748b; cursor:not-allowed; }

  .btn-ghost { background:transparent; color:#FF9933; border:1px solid rgba(255,153,51,0.4); font-family:'JetBrains Mono',monospace; font-weight:500; font-size:10px; cursor:pointer; padding:8px 16px; transition:all 0.15s; text-transform:uppercase; letter-spacing:0.08em; }
  .btn-ghost:hover { border-color:#FF9933; background:rgba(255,153,51,0.08); }
  .btn-ghost:disabled { color:#475569; border-color:rgba(255,255,255,0.08); cursor:not-allowed; }

  .btn-danger { background:transparent; color:#ef4444; border:1px solid rgba(239,68,68,0.4); font-family:'JetBrains Mono',monospace; font-weight:500; font-size:10px; cursor:pointer; padding:8px 16px; transition:all 0.15s; text-transform:uppercase; }
  .btn-danger:hover { background:rgba(239,68,68,0.1); border-color:#ef4444; }

  input, select { background:#060e1f; border:1px solid rgba(255,153,51,0.25); color:white; font-family:'JetBrains Mono',monospace; font-size:11px; padding:8px 12px; outline:none; width:100%; }
  input:focus, select:focus { border-color:#FF9933; }
  input::placeholder { color:#475569; }

  .feed-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; padding:24px; }
  .feed-card { background:#0d1b2e; border:1px solid rgba(255,153,51,0.18); overflow:hidden; transition:transform 0.18s,box-shadow 0.18s,border-color 0.18s; cursor:pointer; }
  .feed-card:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,0.5); border-color:rgba(255,153,51,0.5); }
  .feed-img-wrap { position:relative; width:100%; aspect-ratio:4/3; overflow:hidden; background:#060e1f; }
  .feed-img { width:100%; height:100%; object-fit:cover; transition:transform 0.3s; }
  .feed-card:hover .feed-img { transform:scale(1.04); }
  .feed-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(6,14,31,0.92) 0%,rgba(6,14,31,0.2) 45%,transparent 100%); pointer-events:none; }

  .modal-overlay { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.82); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.15s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal-box { background:#0a1628; border:1px solid rgba(255,153,51,0.35); width:100%; max-width:860px; max-height:92vh; overflow-y:auto; position:relative; animation:slideUp 0.2s ease; }
  @keyframes slideUp { from{transform:translateY(14px);opacity:0} to{transform:translateY(0);opacity:1} }

  .stat-card { border:1px solid rgba(255,153,51,0.18); background:#0a1628; padding:16px 20px; }
  .vol-row { padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer; transition:background 0.12s; }
  .vol-row:hover { background:rgba(255,153,51,0.05); }
  .vol-row.active { background:rgba(255,153,51,0.08); border-left:2px solid #FF9933; }

  .section-label { font-size:9px; color:#FF9933; text-transform:uppercase; letter-spacing:0.18em; margin-bottom:12px; }
  .divider { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:16px 0; }
`;

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ active, setView, counts }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const items = [
    { id:"dashboard", label:"Dashboard", icon:"⬡" },
    { id:"assign",    label:"Assign",    icon:"👷", badge: counts.pending },
    { id:"pending",   label:"Active",    icon:"⏳", badge: counts.assigned },
    { id:"resolved",  label:"Resolved",  icon:"✅" },
    { id:"volunteers",label:"Volunteers",icon:"👥" },
  ];
  return (
    <nav style={{ background:"#060e1f", borderBottom:"1px solid rgba(255,153,51,0.2)", position:"sticky", top:0, zIndex:100 }}>
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 500,
          }}
        >
          <div
            style={{
              background: "#0a1628",
              border: "1px solid rgba(255,153,51,0.4)",
              padding: "24px",
              width: "320px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
              Confirm Logout
            </div>

            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 18 }}>
              Are you sure you want to logout?
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <ExportButton />
              <button
                className="btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", height:54 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div className="w-9 h-9 rounded-full border border-amber-600 bg-amber-900/20 flex items-center justify-center overflow-hidden shrink-0">
               <img src="/favicon.png" alt="logo" className="w-6 h-6 object-cover" />
          </div>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"white" }}>JanSahayak</div>
            <div style={{ fontSize:8, color:"#475569", letterSpacing:"0.12em" }}>AUTHORITY PORTAL</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:2 }}>
          {items.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              background: active===n.id ? "rgba(255,153,51,0.12)" : "transparent",
              border: active===n.id ? "1px solid rgba(255,153,51,0.45)" : "1px solid transparent",
              color: active===n.id ? "#FF9933" : "#64748b",
              fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700,
              textTransform:"uppercase", letterSpacing:"0.1em",
              padding:"6px 14px", cursor:"pointer", transition:"all 0.15s",
              display:"flex", alignItems:"center", gap:6, position:"relative",
            }}>
              <span>{n.icon}</span>{n.label}
              {n.badge > 0 && (
                <span style={{ background:"#FF9933", color:"#060e1f", fontSize:8, fontWeight:900, borderRadius:8, padding:"1px 5px", marginLeft:2 }}>{n.badge}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:9, color:"#475569", fontFamily:"'JetBrains Mono',monospace", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"#22c55e" }}>●</span>Authority Portal
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.5)",
              color: "#ef4444",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "6px 12px",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView({ setView, complaints, volunteers }) {
  const resolved  = complaints.filter(c => c.status === "resolved");
  const assigned  = complaints.filter(c => c.status === "assigned");
  const pending   = complaints.filter(c => c.status === "pending");
  const activeVols = volunteers.filter(v => !v.volunteerDetails?.isAvailable);

  const stats = [
    { label:"Total Complaints", value: complaints.length,  icon:"📋", color:"white",    sub:"All time" },
    { label:"Resolved",         value: resolved.length,    icon:"✅", color:"#22c55e",  sub:`${complaints.length ? Math.round(resolved.length/complaints.length*100) : 0}% resolution rate` },
    { label:"Awaiting Assign",  value: pending.length,     icon:"⏳", color:"#f59e0b",  sub:"Need a volunteer" },
    { label:"Active Tasks",     value: assigned.length,    icon:"🔧", color:"#60a5fa",  sub:"In progress now" },
    { label:"Volunteers",       value: volunteers.length,  icon:"👷", color:"#a78bfa",  sub:`${activeVols.length} currently busy` },
    { label:"Available Vols",   value: volunteers.length - activeVols.length, icon:"🟢", color:"#34d399", sub:"Ready to assign" },
  ];

  return (
    <div style={{ padding:28 }}>
      <div style={{ marginBottom:24 }}>
        <div className="section-label">Overview</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {stats.map((s,i) => (
            <div key={i} className="stat-card" style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <span style={{ fontSize:22, marginTop:2 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize:9, color:"#475569", letterSpacing:"0.14em", textTransform:"uppercase" }}>{s.label}</div>
                <div style={{ fontSize:30, fontWeight:900, color:s.color, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.1 }}>{s.value}</div>
                <div style={{ fontSize:9, color:"#334155", marginTop:3 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[
          { id:"assign",    icon:"👷", label:"Assign Tasks",   sub:`${pending.length} awaiting assignment`,  color:"#FF9933" },
          { id:"pending",   icon:"⏳", label:"Active Tasks",   sub:`${assigned.length} in progress`,         color:"#60a5fa" },
          { id:"resolved",  icon:"✅", label:"Resolved",       sub:`${resolved.length} completed`,           color:"#22c55e" },
          { id:"volunteers",icon:"👥", label:"Volunteer Mgmt", sub:`${volunteers.length} registered`,        color:"#a78bfa" },
        ].map(n => (
          <div key={n.id} className="card" onClick={() => setView(n.id)}
            style={{ padding:18, cursor:"pointer", display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:28 }}>{n.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:n.color }}>{n.label}</div>
              <div style={{ fontSize:9, color:"#475569", marginTop:3 }}>{n.sub}</div>
            </div>
            <span style={{ color:"#FF9933", fontSize:16 }}>→</span>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      {complaints.slice(0,5).length > 0 && (
        <div style={{ marginTop:24 }}>
          <div className="section-label">Recent Complaints</div>
          <div className="card" style={{ overflow:"hidden" }}>
            {complaints.slice(0,5).map((c,i) => (
              <div key={c._id} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 16px", borderBottom: i<4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <span style={{ fontSize:16 }}>{categoryIcon(c.category)}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#f1f5f9", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</div>
                  <div style={{ fontSize:9, color:"#475569" }}>📍 {c.location} · {timeAgo(c.createdAt)}</div>
                </div>
                <Badge label={c.status} className={statusColor(c.status)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BID CARDS inside modal ───────────────────────────────────────────────────
function BidCard({ bid, rank, isAssigned, onAssign, canAssign, assigning }) {
  const vol = bid.volunteer;
  const score = Math.round(scoreApplicant(bid) * 100);
  const isTop = rank === 0;
  const initials = vol?.name ? vol.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() : "??";

  return (
    <div className="card" style={{
      padding:16, position:"relative",
      borderColor: isAssigned ? "rgba(34,197,94,0.55)" : isTop ? "rgba(255,153,51,0.6)" : undefined,
    }}>
      {isTop && !isAssigned && (
        <div style={{ position:"absolute", top:-1, right:10, background:"#FF9933", color:"#060e1f", fontSize:8, fontWeight:900, padding:"2px 8px", letterSpacing:"0.1em" }}>BEST MATCH</div>
      )}
      {isAssigned && (
        <div style={{ position:"absolute", top:-1, right:10, background:"#22c55e", color:"#060e1f", fontSize:8, fontWeight:900, padding:"2px 8px" }}>ASSIGNED ✓</div>
      )}

      {/* Volunteer header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
        {bid.selfie
          ? <img src={bid.selfie} alt="selfie" style={{ width:40, height:40, objectFit:"cover", border:"2px solid rgba(255,153,51,0.4)", flexShrink:0 }} />
          : <div style={{ width:40, height:40, background:"#FF9933", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:900, color:"#060e1f", flexShrink:0 }}>{initials}</div>
        }
        <div>
          <div style={{ fontSize:13, fontWeight:700, fontFamily:"'Source Serif 4',serif", color:"white" }}>{vol?.name || "Unknown"}</div>
          <div style={{ fontSize:9, color:"#64748b" }}>{vol?.email}</div>
          <div style={{ fontSize:9, color:"#64748b", marginTop:1 }}>
            ✅ {vol?.volunteerDetails?.totalTasksCompleted || 0} tasks completed
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
        {[
          { label:"Bid Amount", value:`₹${bid.estimatedAmount?.toLocaleString()}`, color:"#60a5fa" },
          { label:"Est. Days",  value:`${bid.estimatedDays}d`,                     color:"#f59e0b" },
          { label:"Score",      value:`${score}/100`,                              color: isTop ? "#FF9933" : "#94a3b8" },
        ].map((m,i) => (
          <div key={i} style={{ background:"rgba(255,255,255,0.03)", padding:"8px 10px" }}>
            <div style={{ fontSize:8, color:"#475569", textTransform:"uppercase", letterSpacing:"0.1em" }}>{m.label}</div>
            <div style={{ fontSize:15, fontWeight:900, color:m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Bank details summary */}
      <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", padding:"8px 10px", marginBottom:12, fontSize:9, color:"#64748b", lineHeight:1.7 }}>
        🏦 {bid.bankDetails?.bankName} · A/C: ••••{bid.bankDetails?.accountNumber?.slice(-4)} · {bid.bankDetails?.accountHolder}
      </div>

      {/* Skills */}
      {vol?.volunteerDetails?.skills?.length > 0 && (
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom: canAssign && !isAssigned ? 12 : 0 }}>
          {vol.volunteerDetails.skills.filter(Boolean).map(s => (
            <Badge key={s} label={s} className="text-slate-400 bg-slate-900/20 border-slate-700/30" />
          ))}
        </div>
      )}

      {canAssign && !isAssigned && (
        <button className="btn-primary" style={{ width:"100%", marginTop:4 }}
          disabled={assigning}
          onClick={() => onAssign(bid._id, bid.volunteer._id)}>
          {assigning ? "Assigning..." : "Assign This Volunteer →"}
        </button>
      )}
    </div>
  );
}

// ─── COMPLAINT DETAIL MODAL ───────────────────────────────────────────────────
function ComplaintModal({ complaint, onClose, onAssigned, onResolved }) {
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await fetch(`${API}/volunteer/complaint/${complaint._id}/bids`, { headers: authHeaders() });
        const data = await res.json();
        if (data.success) setBids(data.bids);
      } catch (e) { console.error(e); }
      finally { setBidsLoading(false); }
    };
    fetchBids();
  }, [complaint._id]);

  const sorted = [...bids].sort((a,b) => scoreApplicant(b) - scoreApplicant(a));

  const handleAssign = async (bidId, volunteerId) => {
    setAssigning(true);
    try {
      const res = await fetch(`${API}/volunteer/assign`, {
        method:"POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ complaintId: complaint._id, volunteerId, bidId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onAssigned(complaint._id, data.complaint);
      onClose();
    } catch (e) { alert(e.message); }
    finally { setAssigning(false); }
  };

  const handleResolve = async () => {
    if (!window.confirm("Mark this complaint as resolved?")) return;
    setResolving(true);
    try {
      const res = await fetch(`${API}/volunteer/complaint/${complaint._id}/resolve`, {
        method:"PUT",
        headers: jsonHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onResolved(complaint._id, data.complaint);
      onClose();
    } catch (e) { alert(e.message); }
    finally { setResolving(false); }
  };

  const isAssignedTo = (bid) => complaint.assignedTo?._id === bid.volunteer?._id || complaint.assignedTo === bid.volunteer?._id;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Tricolor top */}
        <div className="tricolor" style={{ height:3 }} />

        {/* Hero */}
        {complaint.photo ? (
          <div style={{ width:"100%", height:220, overflow:"hidden", position:"relative" }}>
            <img src={complaint.photo} alt="complaint" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(10,22,40,0.95) 0%,transparent 55%)" }} />
            <div style={{ position:"absolute", bottom:16, left:20 }}>
              <div style={{ fontSize:9, color:"#FF9933", letterSpacing:"0.15em", marginBottom:4 }}>
                {complaint._id?.slice(-8).toUpperCase()}
              </div>
              <div className="serif" style={{ fontSize:20, fontWeight:900, color:"white" }}>{complaint.title}</div>
            </div>
            <button onClick={onClose} style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.2)", color:"white", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        ) : (
          <div style={{ padding:"20px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:9, color:"#FF9933", letterSpacing:"0.15em", marginBottom:4 }}>{complaint._id?.slice(-8).toUpperCase()}</div>
              <div className="serif" style={{ fontSize:18, fontWeight:900, color:"white" }}>{complaint.title}</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"white", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        )}

        <div style={{ padding:20 }}>
          {/* Meta */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
            <Badge label={categoryLabel(complaint.category)} className="text-blue-400 bg-blue-900/20 border-blue-700/40" />
            <Badge label={complaint.status} className={statusColor(complaint.status)} />
            <span style={{ fontSize:9, color:"#64748b" }}>📍 {complaint.location}</span>
            <span style={{ fontSize:9, color:"#64748b" }}>🕐 {timeAgo(complaint.createdAt)}</span>
            {complaint.postedBy?.name && <span style={{ fontSize:9, color:"#64748b" }}>👤 {complaint.postedBy.name}</span>}
          </div>

          <p style={{ fontSize:11, color:"#94a3b8", lineHeight:1.65, marginBottom:20 }}>{complaint.description}</p>

          {/* Assigned volunteer info */}
          {complaint.assignedTo && (
            <div style={{ background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.2)", padding:14, marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:20 }}>🛡️</span>
              <div>
                <div style={{ fontSize:10, color:"#22c55e", fontWeight:700 }}>Assigned to: {complaint.assignedTo?.name || "Volunteer"}</div>
                <div style={{ fontSize:9, color:"#475569" }}>{complaint.assignedTo?.email}</div>
              </div>
              {complaint.status === "assigned" && (
                <button className="btn-primary" style={{ marginLeft:"auto" }} onClick={handleResolve} disabled={resolving}>
                  {resolving ? "Resolving..." : "✅ Mark Resolved"}
                </button>
              )}
            </div>
          )}

          {/* Bids section */}
          <div className="section-label">
            Volunteer Applications — {bidsLoading ? "…" : `${bids.length} applied`}
          </div>

          {bidsLoading && (
            <div style={{ textAlign:"center", color:"#475569", fontSize:11, padding:24 }}>Loading bids…</div>
          )}

          {!bidsLoading && bids.length === 0 && (
            <div style={{ textAlign:"center", color:"#475569", fontSize:11, padding:24, border:"1px solid rgba(255,255,255,0.05)" }}>
              No volunteer applications yet for this complaint.
            </div>
          )}

          {!bidsLoading && sorted.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {sorted.map((bid, rank) => (
                <BidCard
                  key={bid._id}
                  bid={bid}
                  rank={rank}
                  isAssigned={isAssignedTo(bid)}
                  onAssign={handleAssign}
                  canAssign={complaint.status === "pending"}
                  assigning={assigning}
                />
              ))}
            </div>
          )}
        </div>
        <div className="tricolor" style={{ height:3 }} />
      </div>
    </div>
  );
}

// ─── ASSIGN TASK VIEW ─────────────────────────────────────────────────────────
function AssignTaskView({ complaints, setComplaints, loading }) {
  const [filter, setFilter] = useState("pending");
  const [modal, setModal] = useState(null);

  const displayed = filter === "all" ? complaints : complaints.filter(c => c.status === filter);

  const handleAssigned = (complaintId, updated) => {
    setComplaints(prev => prev.map(c => c._id === complaintId ? { ...c, ...updated, status:"assigned" } : c));
  };
  const handleResolved = (complaintId, updated) => {
    setComplaints(prev => prev.map(c => c._id === complaintId ? { ...c, ...updated, status:"resolved" } : c));
  };

  return (
    <>
      {modal && (
        <ComplaintModal
          complaint={modal}
          onClose={() => setModal(null)}
          onAssigned={handleAssigned}
          onResolved={handleResolved}
        />
      )}

      <div style={{ padding:"14px 24px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,153,51,0.1)", background:"#060e1f", position:"sticky", top:54, zIndex:50 }}>
        <div style={{ fontSize:10, color:"#FF9933", textTransform:"uppercase", letterSpacing:"0.15em" }}>Complaint Feed</div>
        <div style={{ display:"flex", gap:6 }}>
          {["pending","assigned","resolved","all"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontSize:8, padding:"5px 10px", textTransform:"uppercase", letterSpacing:"0.08em",
              background: filter===f ? "#FF9933" : "transparent",
              color: filter===f ? "#060e1f" : "#64748b",
              border:`1px solid ${filter===f ? "#FF9933" : "rgba(255,255,255,0.1)"}`,
              cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
            }}>{f}</button>
          ))}
        </div>
        <div style={{ marginLeft:"auto", fontSize:9, color:"#475569" }}>{displayed.length} complaints</div>
      </div>

      {loading && <div style={{ textAlign:"center", color:"#475569", padding:40, fontSize:11 }}>Loading complaints…</div>}

      <div className="feed-grid">
        {displayed.map(c => {
          const accent = categoryAccent(c.category);
          return (
            <div key={c._id} className="feed-card" onClick={() => setModal(c)}>
              <div className="feed-img-wrap">
                {c.photo
                  ? <img src={c.photo} className="feed-img" alt={c.title} />
                  : <div style={{ width:"100%", height:"100%", background:"#0a1628", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>{categoryIcon(c.category)}</div>
                }
                <div className="feed-overlay" />
                <div style={{ position:"absolute", bottom:10, left:12, fontSize:9, color:"rgba(255,255,255,0.5)", letterSpacing:"0.1em" }}>
                  #{c._id?.slice(-6).toUpperCase()}
                </div>
                <div style={{ position:"absolute", top:10, right:10 }}>
                  <Badge label={c.status} className={statusColor(c.status)} />
                </div>
              </div>

              <div style={{ padding:"14px 16px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:13 }}>{categoryIcon(c.category)}</span>
                  <span style={{ fontSize:9, color:accent, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>{categoryLabel(c.category)}</span>
                </div>
                <div className="serif" style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", lineHeight:1.35, marginBottom:6 }}>{c.title}</div>
                <div style={{ fontSize:9, color:"#64748b", marginBottom:8 }}>📍 {c.location} · {timeAgo(c.createdAt)}</div>
                <div style={{ fontSize:10, color:"#94a3b8", lineHeight:1.55, marginBottom:12,
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {c.description}
                </div>

                {c.assignedTo && (
                  <div style={{ background:"rgba(34,197,94,0.07)", border:"1px solid rgba(34,197,94,0.18)", padding:"7px 10px", marginBottom:10, fontSize:10, color:"#22c55e" }}>
                    🛡️ {c.assignedTo?.name || "Assigned"}
                  </div>
                )}

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ fontSize:9, color:"#64748b" }}>
                    {c.postedBy?.name ? `👤 ${c.postedBy.name}` : ""}
                  </div>
                  <button style={{ background:"transparent", color:"#FF9933", border:"1px solid rgba(255,153,51,0.5)", fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", padding:"6px 14px", cursor:"pointer" }}>
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && displayed.length === 0 && (
          <div style={{ gridColumn:"1/-1", textAlign:"center", color:"#475569", padding:60, border:"1px solid rgba(255,255,255,0.05)", fontSize:11 }}>
            No complaints in this category.
          </div>
        )}
      </div>
    </>
  );
}
function PendingView({ complaints, setComplaints, loading }) {
  const active = complaints.filter(c => c.status === "assigned");
  const [resolving, setResolving] = useState({});

  const handleResolve = async (complaintId) => {
    if (!window.confirm("Mark this complaint as resolved?")) return;
    setResolving(r => ({ ...r, [complaintId]: true }));
    try {
      const res = await fetch(`${API}/volunteer/complaint/${complaintId}/resolve`, {
        method: "PUT", headers: jsonHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setComplaints(prev => prev.map(c =>
        c._id === complaintId ? { ...c, status: "resolved", resolvedAt: new Date() } : c
      ));
    } catch (e) { alert(e.message); }
    finally { setResolving(r => ({ ...r, [complaintId]: false })); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#475569", fontSize: 11 }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 4 }}>Active Tasks</div>
          <div style={{ fontSize: 9, color: "#475569" }}>Assigned and in-progress complaints</div>
        </div>
        <Badge label={`${active.length} active`} className="text-amber-400 bg-amber-900/20 border-amber-700/40" />
      </div>

      {active.length === 0 && (
        <div style={{ textAlign: "center", color: "#475569", padding: 60, border: "1px solid rgba(255,255,255,0.05)", fontSize: 11 }}>
          No active tasks right now.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {active.map(c => {
          const vol = c.assignedTo;
          const bid = c.approvedBid;
          const initials = vol?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "V";

          return (
            <div key={c._id} className="card" style={{ overflow: "hidden" }}>
              {/* Photo / icon strip */}
              <div style={{ position: "relative" }}>
                {c.photo
                  ? <img src={c.photo} alt={c.title} style={{ width: "100%", aspectRatio: "16/6", objectFit: "cover", display: "block", borderBottom: "1px solid rgba(255,153,51,0.1)" }} />
                  : <div style={{ width: "100%", aspectRatio: "16/6", background: "#0d1b2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, borderBottom: "1px solid rgba(255,153,51,0.1)" }}>
                      {categoryIcon(c.category)}
                    </div>
                }
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,22,40,0.7) 0%,transparent 60%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: 8, left: 12, fontSize: 8, color: "#FF9933", letterSpacing: "0.1em", fontWeight: 700 }}>
                  #{c._id?.slice(-6).toUpperCase()}
                </div>
                <div style={{ position: "absolute", top: 8, right: 10, display: "flex", gap: 4 }}>
                  <Badge label={categoryLabel(c.category)} className="text-blue-400 bg-blue-900/20 border-blue-700/40" />
                  <Badge label={c.status} className={statusColor(c.status)} />
                </div>
              </div>

              <div style={{ padding: 18 }}>
                {/* Title + meta */}
                <div className="serif" style={{ fontSize: 14, fontWeight: 900, marginBottom: 4, color: "white" }}>{c.title}</div>
                <div style={{ fontSize: 9, color: "#64748b", marginBottom: 6 }}>
                  📍 {c.location} · {timeAgo(c.createdAt)}
                  {c.postedBy?.name && ` · 👤 ${c.postedBy.name}`}
                </div>

                {/* ✅ NEW: Description */}
                {c.description && (
                  <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6, marginBottom: 14,
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {c.description}
                  </p>
                )}

                {/* Volunteer info */}
                {vol && (
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: 8, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Assigned Volunteer</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      {/* ✅ NEW: show selfie from approved bid if available */}
                      {bid?.selfie
                        ? <img src={bid.selfie} alt="selfie" style={{ width: 36, height: 36, objectFit: "cover", border: "2px solid rgba(255,153,51,0.4)", flexShrink: 0 }} />
                        : <div style={{ width: 36, height: 36, background: "#FF9933", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#060e1f", flexShrink: 0 }}>{initials}</div>
                      }
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{vol.name || "Volunteer"}</div>
                        <div style={{ fontSize: 9, color: "#64748b" }}>{vol.email}</div>
                        {/* ✅ NEW: phone */}
                        {vol.phone && <div style={{ fontSize: 9, color: "#64748b" }}>📱 {vol.phone}</div>}
                        <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>
                          ✅ {vol.volunteerDetails?.totalTasksCompleted || 0} tasks completed
                        </div>
                      </div>
                    </div>

                    {/* Bid metrics */}
                    {bid && (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
                          <div>
                            <div style={{ fontSize: 8, color: "#475569" }}>Agreed Amount</div>
                            <div style={{ fontSize: 15, fontWeight: 900, color: "#60a5fa" }}>₹{bid.estimatedAmount?.toLocaleString() || "—"}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 8, color: "#475569" }}>Est. Days</div>
                            <div style={{ fontSize: 15, fontWeight: 900, color: "#f59e0b" }}>{bid.estimatedDays || "—"}d</div>
                          </div>
                          {/* ✅ NEW: assigned date */}
                          <div>
                            <div style={{ fontSize: 8, color: "#475569" }}>Assigned On</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginTop: 4 }}>
                              {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—"}
                            </div>
                          </div>
                        </div>

                        {/* ✅ NEW: Bank details */}
                        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "8px 10px", fontSize: 9, color: "#64748b", lineHeight: 1.7 }}>
                          🏦 {bid.bankDetails?.bankName} &nbsp;·&nbsp;
                          A/C: ••••{bid.bankDetails?.accountNumber?.slice(-4)} &nbsp;·&nbsp;
                          IFSC: {bid.bankDetails?.ifsc} &nbsp;·&nbsp;
                          {bid.bankDetails?.accountHolder}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Actions — contact now shows real phone */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-ghost" style={{ flex: 1 }}
                    onClick={() => vol?.phone && window.open(`tel:${vol.phone}`)}>
                    📞 {vol?.phone || "No phone"}
                  </button>
                  <button className="btn-primary" style={{ flex: 1 }}
                    disabled={resolving[c._id]}
                    onClick={() => handleResolve(c._id)}>
                    {resolving[c._id] ? "Resolving…" : "✅ Mark Resolved"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function ResolvedView({ complaints, loading }) {
  const [search, setSearch] = useState("");
  const resolved = complaints.filter(c => c.status === "resolved");

  const filtered = useMemo(() => {
    if (!search) return resolved;
    const q = search.toLowerCase();
    return resolved.filter(r =>
      r.title?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q) ||
      r._id?.toLowerCase().includes(q) ||
      r.assignedTo?.name?.toLowerCase().includes(q) ||
      r.postedBy?.name?.toLowerCase().includes(q)
    );
  }, [resolved, search]);

  const timeToResolve = (createdAt, resolvedAt) => {
    if (!createdAt || !resolvedAt) return "—";
    const days = Math.round((new Date(resolvedAt) - new Date(createdAt)) / 86400000);
    if (days === 0) return "Same day";
    return `${days}d`;
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#475569", fontSize: 11 }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Resolved", value: resolved.length, color: "#22c55e" },
          { label: "Pending Assign", value: complaints.filter(c => c.status === "pending").length, color: "#f59e0b" },
          { label: "Active Tasks",   value: complaints.filter(c => c.status === "assigned").length, color: "#60a5fa" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, location, volunteer, reporter, or ID…"
          style={{ maxWidth: 440 }} />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,153,51,0.2)", background: "rgba(255,153,51,0.05)" }}>
              {["Photo", "Complaint", "Reported By", "Volunteer", "Bid & Payment", "Timeline"].map((h, i) => (
                <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 8, color: "#FF9933", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#475569", fontSize: 11 }}>No resolved complaints found.</td></tr>
            )}
            {filtered.map((r, i) => {
              const bid = r.approvedBid;
              const vol = r.assignedTo;
              const initials = vol?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "V";

              return (
                <tr key={r._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)", verticalAlign: "top" }}>

                  {/* Photo */}
                  <td style={{ padding: "12px 14px" }}>
                    {r.photo
                      ? <img src={r.photo} alt={r.title} style={{ width: 72, height: 54, objectFit: "cover", border: "1px solid rgba(255,153,51,0.2)", display: "block" }} />
                      : <div style={{ width: 72, height: 54, background: "#0d1b2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "1px solid rgba(255,153,51,0.12)" }}>{categoryIcon(r.category)}</div>
                    }
                  </td>

                  {/* Complaint */}
                  <td style={{ padding: "12px 14px", maxWidth: 200 }}>
                    <div style={{ fontSize: 9, color: "#FF9933", fontWeight: 700, marginBottom: 2 }}>#{r._id?.slice(-6).toUpperCase()}</div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
                      <Badge label={categoryLabel(r.category)} className="text-blue-400 bg-blue-900/20 border-blue-700/40" />
                    </div>
                    <div className="serif" style={{ fontSize: 11, fontWeight: 700, marginBottom: 3, color: "white", lineHeight: 1.35 }}>{r.title}</div>
                    <div style={{ fontSize: 9, color: "#64748b", marginBottom: 4 }}>📍 {r.location}</div>
                    {/* ✅ Description */}
                    {r.description && (
                      <div style={{ fontSize: 9, color: "#475569", lineHeight: 1.55,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {r.description}
                      </div>
                    )}
                  </td>

                  {/* ✅ Reported By */}
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    {r.postedBy ? (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{r.postedBy.name || "—"}</div>
                        <div style={{ fontSize: 9, color: "#64748b" }}>{r.postedBy.email}</div>
                      </>
                    ) : <span style={{ fontSize: 9, color: "#475569" }}>—</span>}
                  </td>

                  {/* Volunteer */}
                  <td style={{ padding: "12px 14px" }}>
                    {vol ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* ✅ Selfie from bid or initials fallback */}
                        {bid?.selfie
                          ? <img src={bid.selfie} alt="selfie" style={{ width: 30, height: 30, objectFit: "cover", border: "1px solid rgba(255,153,51,0.3)", flexShrink: 0 }} />
                          : <div style={{ width: 30, height: 30, background: "#FF9933", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#060e1f", flexShrink: 0 }}>{initials}</div>
                        }
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{vol.name || "—"}</div>
                          <div style={{ fontSize: 9, color: "#64748b" }}>{vol.email}</div>
                          {/* ✅ Phone */}
                          {vol.phone && <div style={{ fontSize: 9, color: "#64748b" }}>📱 {vol.phone}</div>}
                          {/* ✅ Tasks completed */}
                          <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>
                            ✅ {vol.volunteerDetails?.totalTasksCompleted || 0} tasks done
                          </div>
                        </div>
                      </div>
                    ) : <span style={{ fontSize: 9, color: "#475569" }}>—</span>}
                  </td>
                  {/* Bid & Payment */}
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    {bid && bid.estimatedAmount ? (
                      <>
                        <div style={{ fontSize: 14, fontWeight: 900, color: "#60a5fa", marginBottom: 2 }}>
                          ₹{bid.estimatedAmount.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 9, color: "#f59e0b", marginBottom: 6 }}>
                          {bid.estimatedDays}d estimated
                        </div>
                        {bid.bankDetails?.bankName && (
                          <div style={{ fontSize: 9, color: "#475569", lineHeight: 1.65 }}>
                            🏦 {bid.bankDetails.bankName}<br />
                            A/C: ••••{bid.bankDetails.accountNumber?.slice(-4)}<br />
                            IFSC: {bid.bankDetails.ifsc}<br />
                            {bid.bankDetails.accountHolder}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: 9, color: "#475569" }}>No bid data</span>
                    )}
                  </td>

                  {/* ✅ Timeline */}
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: 8, color: "#475569", marginBottom: 2 }}>Filed</div>
                    <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 6 }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </div>
                    <div style={{ fontSize: 8, color: "#475569", marginBottom: 2 }}>Resolved</div>
                    <div style={{ fontSize: 9, color: "#22c55e", marginBottom: 6 }}>
                      {r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </div>
                    <div style={{ fontSize: 8, color: "#475569", marginBottom: 2 }}>Duration</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>
                      {timeToResolve(r.createdAt, r.resolvedAt)}
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── VOLUNTEERS VIEW ──────────────────────────────────────────────────────────
function VolunteersView() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API}/volunteer/all`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success) setVolunteers(d.volunteers); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return volunteers;
    const q = search.toLowerCase();
    return volunteers.filter(v =>
      v.name?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.volunteerDetails?.skills?.some(s => s?.toLowerCase().includes(q))
    );
  }, [volunteers, search]);

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"#475569", fontSize:11 }}>Loading volunteers…</div>;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", height:"calc(100vh - 57px)" }}>
      {/* List */}
      <div style={{ borderRight:"1px solid rgba(255,153,51,0.15)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,153,51,0.1)", background:"#0a1628", flexShrink:0 }}>
          <div className="section-label">Volunteer Directory ({filtered.length})</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, skill, email…" />
        </div>
        <div style={{ overflowY:"auto", flex:1 }}>
          {filtered.map(v => {
            const busy = !v.volunteerDetails?.isAvailable;
            const initials = v.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "V";
            return (
              <div key={v._id}
                className={`vol-row ${selected?._id === v._id ? "active" : ""}`}
                onClick={() => setSelected(v)}
                style={{ borderLeft: selected?._id===v._id ? "2px solid #FF9933" : "2px solid transparent" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, background: busy ? "#334155" : "#FF9933", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color: busy ? "#64748b" : "#060e1f", flexShrink:0 }}>{initials}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="serif" style={{ fontSize:11, fontWeight:700, color:"white" }}>{v.name}</div>
                    <div style={{ fontSize:9, color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.email}</div>
                    <div style={{ fontSize:9, color:"#475569", marginTop:2 }}>
                      ✅ {v.volunteerDetails?.totalTasksCompleted || 0} tasks
                    </div>
                  </div>
                  <Badge label={busy ? "busy" : "available"} className={busy ? "text-amber-400 bg-amber-900/20 border-amber-700/40" : "text-green-400 bg-green-900/20 border-green-700/40"} />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding:40, textAlign:"center", color:"#475569", fontSize:11 }}>No volunteers found.</div>
          )}
        </div>
      </div>

      {/* Detail */}
      <div style={{ overflowY:"auto", padding:24 }}>
        {!selected ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:"#334155" }}>
            <div style={{ fontSize:52, marginBottom:12 }}>👷</div>
            <div style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase" }}>Select a volunteer</div>
          </div>
        ) : (
          <>
            <div className="card" style={{ padding:20, marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                <div style={{ width:52, height:52, background:"#FF9933", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:"#060e1f", flexShrink:0 }}>
                  {selected.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div className="serif" style={{ fontSize:20, fontWeight:900, color:"white" }}>{selected.name}</div>
                  <div style={{ fontSize:9, color:"#64748b", marginTop:3 }}>{selected.email}</div>
                  {selected.phone && <div style={{ fontSize:9, color:"#64748b" }}>📱 {selected.phone}</div>}
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                    {selected.volunteerDetails?.skills?.filter(Boolean).map(s => (
                      <Badge key={s} label={s} className="text-blue-400 bg-blue-900/20 border-blue-700/40" />
                    ))}
                  </div>
                </div>
                <Badge
                  label={selected.volunteerDetails?.isAvailable ? "available" : "busy"}
                  className={selected.volunteerDetails?.isAvailable ? "text-green-400 bg-green-900/20 border-green-700/40" : "text-amber-400 bg-amber-900/20 border-amber-700/40"}
                />
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
              {[
                { label:"Tasks Completed", value: selected.volunteerDetails?.totalTasksCompleted || 0, color:"#22c55e" },
                { label:"Rating",          value: selected.volunteerDetails?.rating ? `${selected.volunteerDetails.rating}★` : "N/A", color:"#f59e0b" },
                { label:"Status",          value: selected.volunteerDetails?.isAvailable ? "Free" : "Busy", color: selected.volunteerDetails?.isAvailable ? "#22c55e" : "#f59e0b" },
              ].map((s,i) => (
                <div key={i} className="stat-card">
                  <div style={{ fontSize:9, color:"#475569", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function AuthorityDashboard() {
  const [view, setView] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, vRes] = await Promise.all([
        fetch(`${API}/complaint/all`, { headers: authHeaders() }),
        fetch(`${API}/volunteer/all`, { headers: authHeaders() }),
      ]);
      const [cData, vData] = await Promise.all([cRes.json(), vRes.json()]);
      if (cData.success) setComplaints(cData.complaints);
      if (vData.success) setVolunteers(vData.volunteers);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const counts = {
    pending:  complaints.filter(c => c.status === "pending").length,
    assigned: complaints.filter(c => c.status === "assigned").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
  };

  const views = {
    dashboard: <DashboardView setView={setView} complaints={complaints} volunteers={volunteers} />,
    assign:    <AssignTaskView complaints={complaints} setComplaints={setComplaints} loading={loading} />,
    pending:   <PendingView complaints={complaints} setComplaints={setComplaints} loading={loading} />,
    resolved:  <ResolvedView complaints={complaints} loading={loading} />,
    volunteers:<VolunteersView />,
  };

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight:"100vh", background:"#060e1f" }}>
        <div className="tricolor" style={{ height:3 }} />
        <Navbar active={view} setView={setView} counts={counts} />
        <div className="gov-grid" style={{ minHeight:"calc(100vh - 60px)" }}>
          {views[view]}
        </div>
        <div className="tricolor" style={{ height:3 }} />
      </div>
    </>
  );
}
