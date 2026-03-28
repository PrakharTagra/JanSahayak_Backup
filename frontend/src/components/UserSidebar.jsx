// import { useNavigate, useLocation } from "react-router-dom";
// import { useState } from "react";
// import LogoutModal from "./LogoutModal";

// export default function UserSidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [showModal, setShowModal] = useState(false);

//   const user = JSON.parse(localStorage.getItem("user"));

//   const navItems = [
//     { title: "Dashboard",      path: "/user/userdashboard", icon: "⊞",  sub: "Overview"        },
//     { title: "Community Feed", path: "/user/feed",          icon: "📡", sub: "Live issues"      },
//     { title: "Report Issue",   path: "/user/reportissue",   icon: "📝", sub: "File a complaint" },
//     { title: "My Reports",     path: "/user/myreports",     icon: "🗂️", sub: "Track your cases" },
//   ];

//   const isActive = (path) => location.pathname === path;

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
//         .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
//         .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
//         .tricolor-bar       { background: linear-gradient(to bottom, #FF9933 33.3%, white 33.3%, white 66.6%, #138808 66.6%); }
//       `}</style>

//       {/* <div className="fixed top-0 left-0 h-full w-[30%] bg-[#0a1628] border-r border-amber-700/30 flex"> */}
//       <div className="fixed top-0 left-0 h-full w-[80%] max-w-xs md:w-[30%] bg-[#0a1628] border-r border-amber-700/30 flex z-50">

//         {/* Tricolor left accent bar */}
//         <div className="tricolor-bar w-1 shrink-0 h-full" />

//         <div className="flex-1 flex flex-col justify-between overflow-hidden">

//           {/* ── Header ── */}
//           <div>
//             {/* Ministry label */}
//             <div className="bg-[#060e1f] border-b border-amber-700/20 px-5 py-2 text-center">
//               <p className="text-[9px] font-mono-gov text-slate-600 uppercase tracking-widest leading-relaxed">
//                 Ministry of Housing & Urban Affairs<br />Government of India
//               </p>
//             </div>

//             {/* Logo block */}
//             <div
//               onClick={() => navigate("/user/userdashboard")}
//               className="flex items-center gap-3 px-5 py-5 cursor-pointer border-b border-white/5 hover:bg-white/5 transition"
//             >
//               <div className="w-10 h-10 rounded-full border border-amber-600 bg-amber-900/20 flex items-center justify-center shrink-0 overflow-hidden">
//                 <img src="/favicon.png" alt="logo" className="w-7 h-7 object-cover" />
//               </div>
//               <div className="overflow-hidden">
//                 <h1 className="text-base font-black font-serif-display text-white leading-tight truncate">
//                   JanSahayak
//                 </h1>
//                 <p className="text-[9px] text-amber-700/70 font-mono-gov truncate">
//                   जन सहायक पोर्टल
//                 </p>
//               </div>
//             </div>

//             {/* ✅ Citizen info chip - now showing real user data */}
//             <div className="mx-4 mt-4 mb-2 border border-white/10 bg-[#060e1f] px-3 py-2.5 flex items-center gap-2">
//               <div className="w-7 h-7 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center text-xs shrink-0">
//                 👤
//               </div>
//               <div className="overflow-hidden min-w-0">
//                 <p className="text-xs font-semibold text-white font-mono-gov truncate">{user?.name || "Citizen User"}</p>
//                 <p className="text-[9px] text-slate-500 font-mono-gov truncate">{user?.email || "citizen@example.com"}</p>
//               </div>
//               <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-green-500" title="Online" />
//             </div>

//             {/* Nav label */}
//             <p className="text-[9px] font-mono-gov text-slate-600 uppercase tracking-widest px-5 mt-5 mb-2">
//               Navigation
//             </p>

//             {/* Nav items */}
//             <div className="flex flex-col gap-1 px-3">
//               {navItems.map((item, i) => (
//                 <button
//                   key={i}
//                   onClick={() => navigate(item.path)}
//                   className={`w-full text-left px-3 py-3 flex items-center gap-3 transition border ${
//                     isActive(item.path)
//                       ? "border-amber-600/60 bg-amber-600/15 text-amber-400"
//                       : "border-transparent hover:border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
//                   }`}
//                 >
//                   <span className="text-base shrink-0">{item.icon}</span>
//                   <div className="overflow-hidden min-w-0">
//                     <p className={`text-xs font-bold font-mono-gov uppercase tracking-wide truncate ${isActive(item.path) ? "text-amber-400" : ""}`}>
//                       {item.title}
//                     </p>
//                     <p className="text-[9px] text-slate-600 font-mono-gov truncate">{item.sub}</p>
//                   </div>
//                   {isActive(item.path) && (
//                     <div className="ml-auto w-1 h-6 bg-amber-500 shrink-0" />
//                   )}
//                 </button>
//               ))}
//             </div>

//             {/* Divider */}
//             <div className="mx-5 mt-5 mb-4 h-px bg-white/5" />
//           </div>

//           {/* ── Footer ── */}
//           <div className="px-3 pb-5 space-y-2">
//             {/* Helpline */}
//             <div className="border border-amber-700/20 bg-amber-900/10 px-3 py-2 text-center">
//               <p className="text-[9px] font-mono-gov text-amber-700">📞 Helpline</p>
//               <p className="text-[10px] font-bold font-mono-gov text-amber-400">1800-XXX-XXXX</p>
//               <p className="text-[9px] font-mono-gov text-slate-600">Toll Free · Mon–Sat</p>
//             </div>

//             {/* ✅ Logout now clears localStorage */}
//             <button
//               onClick={() => setShowModal(true)}
//               className="w-full px-4 py-2.5 border border-red-700/30 text-red-400 hover:bg-red-900/20 hover:border-red-700/60 transition text-[10px] font-mono-gov uppercase tracking-widest flex items-center justify-center gap-2"
//             >
//               <span>⏻</span> Logout
//             </button>

//             <p className="text-[9px] text-slate-700 font-mono-gov text-center">
//               © 2026 JanSahayak — Govt. of India
//             </p>
//           </div>
//         </div>
//       </div>

//       {showModal && (
//         <LogoutModal
//           onCancel={() => setShowModal(false)}
//           onConfirm={() => {
//             setShowModal(false);
//             // ✅ Clear localStorage on logout
//             localStorage.removeItem("token");
//             localStorage.removeItem("user");
//             navigate("/");
//           }}
//         />
//       )}
//     </>
//   );
// }
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import LogoutModal from "./LogoutModal";

export default function UserSidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const navItems = [
    { title: "Dashboard",      path: "/user/userdashboard", icon: "⊞",  sub: "Overview"        },
    { title: "Community Feed", path: "/user/feed",          icon: "📡", sub: "Live issues"      },
    { title: "Report Issue",   path: "/user/reportissue",   icon: "📝", sub: "File a complaint" },
    { title: "My Reports",     path: "/user/myreports",     icon: "🗂️", sub: "Track your cases" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
        .tricolor-bar       { background: linear-gradient(to bottom, #FF9933 33.3%, white 33.3%, white 66.6%, #138808 66.6%); }
      `}</style>

      {/* Width & positioning handled by parent wrapper in UserDashboard */}
      <div className="h-full w-[80vw] max-w-xs md:w-[30vw] bg-[#0a1628] border-r border-amber-700/30 flex">

        {/* Tricolor left accent bar */}
        <div className="tricolor-bar w-1 shrink-0 h-full" />

        <div className="flex-1 flex flex-col justify-between overflow-hidden">

          {/* Header */}
          <div>
            <div className="bg-[#060e1f] border-b border-amber-700/20 px-5 py-2 text-center">
              <p className="text-[9px] font-mono-gov text-slate-600 uppercase tracking-widest leading-relaxed">
                Ministry of Housing & Urban Affairs<br />Government of India
              </p>
            </div>

            <div
              onClick={() => handleNav("/user/userdashboard")}
              className="flex items-center gap-3 px-5 py-5 cursor-pointer border-b border-white/5 hover:bg-white/5 transition"
            >
              <div className="w-10 h-10 rounded-full border border-amber-600 bg-amber-900/20 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="/favicon.png" alt="logo" className="w-7 h-7 object-cover" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-base font-black font-serif-display text-white leading-tight truncate">
                  JanSahayak
                </h1>
                <p className="text-[9px] text-amber-700/70 font-mono-gov truncate">
                  जन सहायक पोर्टल
                </p>
              </div>
            </div>

            <div className="mx-4 mt-4 mb-2 border border-white/10 bg-[#060e1f] px-3 py-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-900/40 border border-amber-700/40 flex items-center justify-center text-xs shrink-0">
                👤
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-semibold text-white font-mono-gov truncate">{user?.name || "Citizen User"}</p>
                <p className="text-[9px] text-slate-500 font-mono-gov truncate">{user?.email || "citizen@example.com"}</p>
              </div>
              <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-green-500" title="Online" />
            </div>

            <p className="text-[9px] font-mono-gov text-slate-600 uppercase tracking-widest px-5 mt-5 mb-2">
              Navigation
            </p>

            <div className="flex flex-col gap-1 px-3">
              {navItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleNav(item.path)}
                  className={`w-full text-left px-3 py-3 flex items-center gap-3 transition border ${
                    isActive(item.path)
                      ? "border-amber-600/60 bg-amber-600/15 text-amber-400"
                      : "border-transparent hover:border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div className="overflow-hidden min-w-0">
                    <p className={`text-xs font-bold font-mono-gov uppercase tracking-wide truncate ${isActive(item.path) ? "text-amber-400" : ""}`}>
                      {item.title}
                    </p>
                    <p className="text-[9px] text-slate-600 font-mono-gov truncate">{item.sub}</p>
                  </div>
                  {isActive(item.path) && (
                    <div className="ml-auto w-1 h-6 bg-amber-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="mx-5 mt-5 mb-4 h-px bg-white/5" />
          </div>

          {/* Footer */}
          <div className="px-3 pb-5 space-y-2">
            <div className="border border-amber-700/20 bg-amber-900/10 px-3 py-2 text-center">
              <p className="text-[9px] font-mono-gov text-amber-700">📞 Helpline</p>
              <p className="text-[10px] font-bold font-mono-gov text-amber-400">1800-XXX-XXXX</p>
              <p className="text-[9px] font-mono-gov text-slate-600">Toll Free · Mon–Sat</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full px-4 py-2.5 border border-red-700/30 text-red-400 hover:bg-red-900/20 hover:border-red-700/60 transition text-[10px] font-mono-gov uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <span>⏻</span> Logout
            </button>

            <p className="text-[9px] text-slate-700 font-mono-gov text-center">
              © 2026 JanSahayak — Govt. of India
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <LogoutModal
          onCancel={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
          }}
        />
      )}
    </>
  );
}