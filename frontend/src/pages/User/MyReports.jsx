import UserSidebar from "../../components/UserSidebar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
export default function MyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const statusColor = {
    "Pending":     "text-slate-400 bg-slate-800 border-slate-700",
    "Resolved":    "text-green-400 bg-green-900/30 border-green-700/40",
  };
  useEffect(() => {
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/v1/complaint/my/complaints",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setReports(
        data.complaints.map((item) => ({
          id: item._id.slice(-6).toUpperCase(),
          title: item.title,
          desc: item.description,
          location: item.location,
          dept: item.category || "General",
          status: item.status === "resolved" ? "Resolved" : "Pending",
          filed: new Date(item.createdAt).toLocaleDateString(),
          updated: item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString()
            : "-",
          img: item.photo || "https://via.placeholder.com/400",
          upvotes: item.upvotes?.length || 0,
          sla: "—",
        }))
      );

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  fetchReports();
}, []);
  const resolved   = reports.filter((r) => r.status === "Resolved").length;
  const pending    = reports.filter((r) => r.status === "Pending").length;
  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-[#060e1f] text-white flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
        .tricolor-bar       { background: linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%); }
        .gov-grid           { background-image: linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px); background-size:48px 48px; }
      `}</style>

      <UserSidebar />

      <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
        <div className="tricolor-bar h-1 w-full shrink-0" />

        {/* Top bar */}
        <div className="bg-[#0a1628] border-b border-amber-700/30 px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-black font-serif-display text-white leading-tight">My Complaints</h1>
            <p className="text-[10px] text-slate-500 font-mono-gov">JanSahayak Portal &nbsp;|&nbsp; मेरी शिकायतें</p>
          </div>
          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 transition text-[11px] font-mono-gov uppercase tracking-widest font-bold" onClick={()=>{
            navigate("/user/reportissue")
          }}>
            + File New Complaint
          </button>
        </div>

        <div className="flex-1 gov-grid p-6 overflow-auto">

          {/* Summary strip */}
          <div className="grid grid-cols-3 border border-amber-700/30 bg-[#0a1628] mb-6 divide-x divide-amber-700/20">
            {[
              { label: "Total Filed", value: reports.length, color: "text-white" },
              { label: "Resolved",    value: resolved,        color: "text-green-400" },
              { label: "Pending",     value: pending,         color: "text-slate-400" },
            ].map((s) => (
              <div key={s.label} className="px-5 py-4 text-center">
                <p className={`text-2xl font-black font-mono-gov ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 font-mono-gov uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="max-w-4xl flex flex-col gap-5">
            {reports.map((r, i) => (
              <div
                key={i}
                className="border border-white/10 hover:border-amber-700/40 bg-[#0a1628] transition group"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={r.img}
                    alt={r.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent" />
                  <div className={`absolute top-3 right-3 text-[9px] font-mono-gov font-bold px-2 py-0.5 border ${statusColor[r.status]}`}>
                    {r.status}
                  </div>
                </div>

                <div className="p-5">
                  {/* ID + dept + SLA */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono-gov text-slate-500">{r.id}</span>
                    <span className="text-[9px] font-mono-gov bg-[#060e1f] border border-white/10 text-slate-400 px-2 py-0.5">
                      {r.dept}
                    </span>
                    <span className="text-[9px] font-mono-gov text-slate-600 ml-auto">SLA: {r.sla}</span>
                  </div>

                  <h2 className="font-bold text-white font-serif-display text-base">{r.title}</h2>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">{r.desc}</p>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono-gov text-slate-500">
                    <span>📍 {r.location}</span>
                    <span>🏛️ {r.dept}</span>
                    <span>📅 Filed: {r.filed}</span>
                    <span>🔄 Updated: {r.updated}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1 text-[10px] font-mono-gov text-slate-500">
                      ▲ <span className="text-amber-400 font-bold">{r.upvotes}</span>&nbsp;upvotes
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer strip */}
          <div className="mt-8 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov max-w-4xl">
            Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free) &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
          </div>

        </div>
        <div className="tricolor-bar h-1 w-full shrink-0" />
      </div>
    </div>
  );
}