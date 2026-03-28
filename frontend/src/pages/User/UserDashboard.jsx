// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { useState,useEffect } from "react";
// import UserSidebar from "../../components/UserSidebar";
 
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const [stats, setStats] = useState(null);
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         // 🔹 Fetch stats
//         const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/complaint/user/stats`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         const statsData = await statsRes.json();

//         // 🔹 Fetch user complaints
//         const complaintsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/complaint/my/complaints`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         const complaintsData = await complaintsRes.json();

//         // ✅ Set stats
//         setStats([
//           {
//             label: "Total Reports",
//             value: statsData.stats.total,
//             icon: "📋",
//             sub: "Since registration",
//             color: "text-amber-400",
//           },
//           {
//             label: "Resolved",
//             value: statsData.stats.resolved,
//             icon: "✅",
//             sub: "Completed issues",
//             color: "text-green-400",
//           },
//           {
//             label: "Pending",
//             value: statsData.stats.pending,
//             icon: "⏳",
//             sub: "Under process",
//             color: "text-orange-400",
//           },
//         ]);

//         // ✅ Set recent activity (latest 3)
//         setRecentActivity(
//           complaintsData.complaints.slice(0, 3).map((item) => ({
//             id: item._id,
//             title: item.title,
//             status: item.status === "resolved" ? "Resolved" : "Pending",
//             date: new Date(item.createdAt).toLocaleDateString(),
//           }))
//         );

//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);
  
//   const navCards = [
//     { title: "Community Feed", icon: "📡", path: "/user/feed", desc: "View & upvote issues in your area", tag: "Live" },
//     { title: "Report Issue", icon: "📝", path: "/user/reportissue", desc: "File a new civic grievance", tag: "Action" },
//     { title: "My Reports", icon: "🗂️", path: "/user/myreports", desc: "Track all your submitted complaints", tag: "Total" },
//   ];

//   const statusColor = {
//     "Resolved": "text-green-400 bg-green-900/30",
//     "Pending": "text-slate-400 bg-slate-800",
//   };
//   if (loading) {
//     return <div className="text-white p-10">Loading...</div>;
//   }
//   return (
//     <div className="min-h-screen bg-[#060e1f] text-white flex">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
//         .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
//         .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
//         .tricolor-bar       { background: linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%); }
//         .gov-grid           { background-image: linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px); background-size:48px 48px; }
//       `}</style>
 
//       {/* Sidebar */}
//       <UserSidebar />
 
//       {/* Main */}
//       <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
 
//         {/* Top bar */}
//         <div className="tricolor-bar h-1 w-full shrink-0" />
//         <div className="bg-[#0a1628] border-b border-amber-700/30 px-6 py-3 flex items-center justify-between shrink-0">
//           <div>
//             <h1 className="text-base font-black font-serif-display text-white leading-tight">
//               Citizen Dashboard
//             </h1>
//             <p className="text-[10px] text-slate-500 font-mono-gov">
//               JanSahayak Portal &nbsp;|&nbsp; नागरिक डैशबोर्ड
//             </p>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="border border-amber-700/40 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-3 py-1">
//               🟢 Portal Active
//             </div>
//           </div>
//         </div>
 
//         {/* Content */}
//         <div className="flex-1 gov-grid p-6 overflow-auto">
 
//           {/* ── STATS ── */}
//           <div className="grid md:grid-cols-3 gap-4 mb-6">
//             {stats.map((item, i) => (
//               <motion.div
//                 key={i}
//                 whileHover={{ y: -2 }}
//                 className="border border-amber-700/30 bg-[#0a1628] p-5 flex items-start gap-4"
//               >
//                 <div className="text-2xl mt-0.5">{item.icon}</div>
//                 <div>
//                   <p className="text-[10px] text-slate-500 font-mono-gov uppercase tracking-widest">{item.label}</p>
//                   <p className={`text-3xl font-black font-mono-gov mt-0.5 ${item.color}`}>{item.value}</p>
//                   <p className="text-[10px] text-slate-600 mt-0.5 font-mono-gov">{item.sub}</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
 
//           {/* ── NAV CARDS ── */}
//           <div className="grid md:grid-cols-3 gap-4 mb-6">
//             {navCards.map((item, i) => (
//               <motion.div
//                 key={i}
//                 whileHover={{ y: -3 }}
//                 onClick={() => navigate(item.path)}
//                 className="cursor-pointer border border-white/10 hover:border-amber-700/60 bg-[#0a1628] p-5 transition group"
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <span className="text-xl">{item.icon}</span>
//                   <span className="text-[9px] font-mono-gov bg-amber-900/30 text-amber-400 border border-amber-700/30 px-2 py-0.5 uppercase tracking-widest">
//                     {item.tag}
//                   </span>
//                 </div>
//                 <h3 className="font-bold text-white group-hover:text-amber-400 transition text-sm">{item.title}</h3>
//                 <p className="text-[11px] text-slate-500 mt-1 font-mono-gov">{item.desc}</p>
//                 <div className="mt-3 text-[10px] text-amber-600 font-mono-gov group-hover:text-amber-400 transition">
//                   Open →
//                 </div>
//               </motion.div>
//             ))}
//           </div>
 
//           {/* ── BOTTOM GRID ── */}
//           <div className="grid md:grid-cols-1 gap-4">

//             {/* Recent Activity */}
//             <div className="border border-white/10 bg-[#0a1628] p-5">
//               <div className="flex items-center justify-between mb-5">
//                 <h2 className="font-bold font-serif-display text-white">Recent Complaints</h2>
//                 <button
//                   onClick={() => navigate("/user/myreports")}
//                   className="text-[10px] font-mono-gov text-amber-500 hover:underline uppercase tracking-wide"
//                 >
//                   View All →
//                 </button>
//               </div>
//               <div className="space-y-3">
//                 {recentActivity.map((item) => (
//                   <div key={item.id} className="border border-white/5 hover:border-amber-700/30 bg-[#060e1f] p-3 transition">
//                     <div className="flex items-start justify-between gap-2">
//                       <div className="flex-1 min-w-0">
//                         <p className="text-[10px] text-slate-500 font-mono-gov">{item.id}</p>
//                         <p className="text-xs font-semibold text-white mt-0.5 truncate">{item.title}</p>
//                         <p className="text-[10px] text-slate-600 font-mono-gov mt-0.5">{item.date}</p>
//                       </div>
//                       <div className="flex flex-col items-end gap-1 shrink-0">
//                         <span className={`text-[9px] font-mono-gov font-bold px-2 py-0.5 ${statusColor[item.status]}`}>
//                           {item.status}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
 
//           </div>
 
//           {/* Helpline footer strip */}
//           <div className="mt-6 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov">
//             Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free · Mon–Sat · 9AM–6PM) &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
//           </div>
 
//         </div>
//         <div className="tricolor-bar h-1 w-full shrink-0" />
//       </div>
//     </div>
//   );
// }
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../../components/UserSidebar";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/complaint/user/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsRes.json();

        const complaintsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/complaint/my/complaints`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const complaintsData = await complaintsRes.json();

        setStats([
          { label: "Total Reports", value: statsData.stats.total,    icon: "📋", sub: "Since registration", color: "text-amber-400" },
          { label: "Resolved",      value: statsData.stats.resolved, icon: "✅", sub: "Completed issues",   color: "text-green-400" },
          { label: "Pending",       value: statsData.stats.pending,  icon: "⏳", sub: "Under process",      color: "text-orange-400" },
        ]);

        setRecentActivity(
          complaintsData.complaints.slice(0, 3).map((item) => ({
            id: item._id,
            title: item.title,
            status: item.status === "resolved" ? "Resolved" : "Pending",
            date: new Date(item.createdAt).toLocaleDateString(),
          }))
        );

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navCards = [
    { title: "Community Feed", icon: "📡", path: "/user/feed",        desc: "View & upvote issues in your area",    tag: "Live"   },
    { title: "Report Issue",   icon: "📝", path: "/user/reportissue", desc: "File a new civic grievance",           tag: "Action" },
    { title: "My Reports",     icon: "🗂️", path: "/user/myreports",   desc: "Track all your submitted complaints",  tag: "Total"  },
  ];

  const statusColor = {
    "Resolved": "text-green-400 bg-green-900/30",
    "Pending":  "text-slate-400 bg-slate-800",
  };

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

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <UserSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="ml-0 md:ml-[30%] flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="tricolor-bar h-1 w-full shrink-0" />
        <div className="bg-[#0a1628] border-b border-amber-700/30 px-4 py-3 flex items-center justify-between shrink-0">
          
          {/* Left: hamburger + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden text-slate-400 hover:text-white text-xl leading-none shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-black font-serif-display text-white leading-tight truncate">
                Citizen Dashboard
              </h1>
              <p className="text-[10px] text-slate-500 font-mono-gov truncate">
                JanSahayak Portal &nbsp;|&nbsp; नागरिक डैशबोर्ड
              </p>
            </div>
          </div>

          {/* Right: portal status badge */}
          <div className="shrink-0 ml-3">
            <div className="border border-amber-700/40 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-3 py-1 whitespace-nowrap">
              🟢 Portal Active
            </div>
          </div>

        </div>
        {/* Content */}
        <div className="flex-1 gov-grid p-6 overflow-auto">

          {/* STATS */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {stats.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -2 }}
                className="border border-amber-700/30 bg-[#0a1628] p-5 flex items-start gap-4"
              >
                <div className="text-2xl mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-[10px] text-slate-500 font-mono-gov uppercase tracking-widest">{item.label}</p>
                  <p className={`text-3xl font-black font-mono-gov mt-0.5 ${item.color}`}>{item.value}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-mono-gov">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* NAV CARDS */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {navCards.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                onClick={() => navigate(item.path)}
                className="cursor-pointer border border-white/10 hover:border-amber-700/60 bg-[#0a1628] p-5 transition group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[9px] font-mono-gov bg-amber-900/30 text-amber-400 border border-amber-700/30 px-2 py-0.5 uppercase tracking-widest">
                    {item.tag}
                  </span>
                </div>
                <h3 className="font-bold text-white group-hover:text-amber-400 transition text-sm">{item.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 font-mono-gov">{item.desc}</p>
                <div className="mt-3 text-[10px] text-amber-600 font-mono-gov group-hover:text-amber-400 transition">
                  Open →
                </div>
              </motion.div>
            ))}
          </div>

          {/* RECENT COMPLAINTS */}
          <div className="grid md:grid-cols-1 gap-4">
            <div className="border border-white/10 bg-[#0a1628] p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold font-serif-display text-white">Recent Complaints</h2>
                <button
                  onClick={() => navigate("/user/myreports")}
                  className="text-[10px] font-mono-gov text-amber-500 hover:underline uppercase tracking-wide"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <div key={item.id} className="border border-white/5 hover:border-amber-700/30 bg-[#060e1f] p-3 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-500 font-mono-gov">{item.id}</p>
                        <p className="text-xs font-semibold text-white mt-0.5 truncate">{item.title}</p>
                        <p className="text-[10px] text-slate-600 font-mono-gov mt-0.5">{item.date}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[9px] font-mono-gov font-bold px-2 py-0.5 ${statusColor[item.status]}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer strip */}
          <div className="mt-6 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov">
            Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free · Mon–Sat · 9AM–6PM) &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
          </div>

        </div>
        <div className="tricolor-bar h-1 w-full shrink-0" />
      </div>
    </div>
  );
}