import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import pothole from "../assets/pothole.jpg";
import light from "../assets/streetlight.jpg";
import garbage from "../assets/garbage.jpg";
import logo from "/favicon.png";
import water from "../assets/Water.jpg";
import drainage from "../assets/Drainage.jpg";
import traffic from "../assets/Traffic.jpg";

// ── tiny helpers ──────────────────────────────────────────────────────────────
const Badge = ({ children }) => (
  <span className="inline-block bg-orange-600 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
    {children}
  </span>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-2">
    <div className="h-px flex-1 bg-amber-600/40" />
    <div className="w-1.5 h-1.5 rotate-45 bg-amber-600" />
    <div className="h-px flex-1 bg-amber-600/40" />
  </div>
);

const StatCard = ({ number, label, sub }) => (
  <div className="border border-amber-700/40 bg-[#0a1628]/80 p-6 text-center">
    <div className="text-3xl md:text-4xl font-black text-amber-400 font-mono">{number}</div>
    <div className="text-white font-semibold mt-1 text-sm">{label}</div>
    {sub && <div className="text-slate-400 text-xs mt-0.5">{sub}</div>}
  </div>
);

// ── main component ────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060e1f] text-white font-sans">
      {/* ── Google Fonts (Tiro Devanagari + Source Serif 4) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
        .font-hindi         { font-family: 'Tiro Devanagari Hindi', serif; }
        .ashoka-border { border-image: repeating-linear-gradient(90deg,#b45309 0,#b45309 6px,transparent 6px,transparent 12px) 1; }
        @keyframes ticker { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
        .ticker { animation: ticker 28s linear infinite; }
        .gov-grid { background-image: linear-gradient(rgba(255,165,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.04) 1px,transparent 1px); background-size:48px 48px; }
        .stamp::before { content:''; position:absolute;inset:0;border:2px solid rgba(251,191,36,0.15);border-radius:4px; }
        .tricolor-bar { background:linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%); }
      `}</style>

      {/* ══ TOP STRIP — tricolor ══════════════════════════════════════════════ */}
      <div className="tricolor-bar h-1.5 w-full" />

      {/* ══ ANNOUNCEMENT TICKER ══════════════════════════════════════════════ */}
      <div className="bg-amber-700/20 border-b border-amber-700/30 py-1.5 overflow-hidden flex items-center gap-2 px-4">
        <span className="shrink-0 text-amber-400 text-xs font-bold tracking-widest uppercase font-mono-gov">
          📢 Notice:
        </span>
        <div className="overflow-hidden flex-1">
          <p className="ticker whitespace-nowrap text-xs text-slate-300">
            JanSahayak Portal v2.0 launched — All citizens are encouraged to report civic issues online &nbsp;|&nbsp; New: Mobile app available on Play Store &nbsp;|&nbsp; Grievance redressal timelines reduced to 15 working days &nbsp;|&nbsp; Over 500 issues resolved in Q1 2026 &nbsp;|&nbsp; कृपया अपनी शिकायत दर्ज करें
          </p>
        </div>
      </div>

      {/* ══ GOVERNMENT HEADER ════════════════════════════════════════════════ */}
      <header className="bg-[#0a1628] border-b-2 border-amber-700/60 py-5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
          {/* Left: emblem + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-amber-600 flex items-center justify-center bg-amber-900/20 shrink-0 overflow-hidden">
              <img src={logo} alt="JanSahayak Emblem" className="w-10 h-10 object-cover" />
            </div>
            <div>
              <div className="text-amber-400 text-xs tracking-[0.2em] uppercase font-mono-gov">
                Government of India Initiative
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-serif-display leading-tight">
                JanSahayak
              </h1>
              <p className="text-slate-400 text-xs tracking-wide font-hindi">
                जन सहायक — नागरिक शिकायत निवारण पोर्टल
              </p>
            </div>
          </div>

          {/* Center: ministry label */}
          <div className="hidden lg:block text-center">
            <p className="text-slate-400 text-xs">Under the aegis of</p>
            <p className="text-white text-sm font-semibold">
              Ministry of Housing & Urban Affairs
            </p>
            <p className="text-slate-400 text-xs">भारत सरकार</p>
          </div>

          {/* Right: auth buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 border border-amber-600/60 text-amber-400 hover:bg-amber-600/10 transition text-sm font-semibold tracking-wide uppercase font-mono-gov"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 transition text-white text-sm font-semibold tracking-wide uppercase font-mono-gov"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* ══ NAV BAR ══════════════════════════════════════════════════════════ */}
      <nav className="bg-[#0d1f3c] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-6 px-6 py-2 text-xs font-semibold tracking-widest uppercase font-mono-gov overflow-x-auto">
          {[
            ["Home", "/"],
            ["About", null],
            ["Report Issue", "/login"],
            ["Track Status", "/login"],
            ["FAQ", null],
            ["Contact", null],
          ].map(([label, path]) => (
            <button
              key={label}
              onClick={() => path && navigate(path)}
              className="whitespace-nowrap text-slate-400 hover:text-amber-400 transition pb-0.5 border-b-2 border-transparent hover:border-amber-400"
            >
              {label}
            </button>
          ))}
          <div className="ml-auto shrink-0 text-slate-500 text-[10px]">
            🌐 <span className="hover:text-amber-400 cursor-pointer">EN</span> | <span className="hover:text-amber-400 cursor-pointer font-hindi">हि</span>
          </div>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <section className="relative gov-grid overflow-hidden">
        {/* decorative diagonals */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          {/* text */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <Badge>Official Portal</Badge>
            <Divider />
            <h2 className="text-4xl md:text-5xl font-black font-serif-display leading-[1.1] mt-4">
              Report. Track.{" "}
              <span className="text-amber-400">Fix Your City.</span>
            </h2>
            <p className="mt-5 text-slate-300 leading-relaxed text-base">
              JanSahayak is an integrated citizen grievance redressal system enabling residents to
              report civic issues — potholes, broken streetlights, water leakages and more — with
              photographic evidence and GPS-tagged location data.
            </p>
            <p className="mt-3 text-slate-400 text-sm border-l-2 border-amber-600 pl-3">
              Over <strong className="text-amber-400">60%</strong> of civic complaints in Indian cities go
              unresolved due to inadequate reporting infrastructure.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate("/login")}
                className="px-7 py-3 bg-amber-600 hover:bg-amber-500 transition font-bold tracking-wide uppercase text-sm font-mono-gov"
              >
                File a Complaint →
              </button>
              <button
                onClick={() => document.getElementById("learn-more").scrollIntoView({ behavior: "smooth" })}
                className="px-7 py-3 border border-amber-700/60 text-amber-400 hover:bg-amber-600/10 transition text-sm font-mono-gov uppercase tracking-wide"
              >
                Learn More
              </button>
            </div>
            {/* helpline */}
            <div className="mt-8 inline-flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400 font-mono-gov">
              <span className="text-amber-400 text-lg">📞</span>
              Helpline: <strong className="text-white">1800-XXX-XXXX</strong> (Toll Free, 24×7)
            </div>
          </motion.div>

          {/* right — info card stack */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="border border-amber-700/40 bg-[#0a1628]/90 p-6 relative stamp">
              <div className="absolute -top-3 left-4 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest font-mono-gov">
                Quick Access
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {[
                  { icon: "🕳️", label: "Pothole Report", tag: "High Priority" },
                  { icon: "💡", label: "Street Lighting", tag: "Medium" },
                  { icon: "🗑️", label: "Garbage Overflow", tag: "High Priority" },
                  { icon: "💧", label: "Water Leakage", tag: "Medium" },
                  { icon: "🚦", label: "Traffic Signal", tag: "Urgent" },
                  { icon: "🚰", label: "Blocked Drain", tag: "Medium" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate("/login")}
                    className="flex flex-col items-start gap-1 border border-white/10 hover:border-amber-600/60 bg-white/5 hover:bg-amber-600/10 transition p-3 text-left"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-semibold text-white">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.tag}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full mt-4 py-2 border border-dashed border-amber-700/60 text-amber-500 text-xs uppercase tracking-widest hover:bg-amber-600/10 transition font-mono-gov"
              >
                + Report Other Issue
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ STATS BAR ════════════════════════════════════════════════════════ */}
      <div className="bg-[#0a1628] border-y border-amber-700/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-amber-700/20">
          <StatCard number="12,400+" label="Issues Reported" sub="Since Jan 2024" />
          <StatCard number="8,950+" label="Resolved" sub="71% resolution rate" />
          <StatCard number="24" label="Cities Covered" sub="Across 8 States" />
          <StatCard number="15 Days" label="Avg. Resolution Time" sub="Down from 42 days" />
        </div>
      </div>

      {/* ══ ABOUT ════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <Badge>About the Portal</Badge>
            <h2 className="text-3xl font-black font-serif-display mt-3 leading-tight">
              What is JanSahayak?
            </h2>
            <Divider />
            <p className="text-slate-300 mt-4 leading-relaxed">
              JanSahayak is a citizen-powered grievance redressal platform under the Smart Cities
              Mission. It bridges the gap between residents and municipal authorities by providing a
              transparent, structured, and accountable reporting mechanism.
            </p>
            <p className="text-slate-300 mt-4 leading-relaxed">
              Built in compliance with the Government's Digital India initiative, the portal supports
              geo-tagged reporting, photographic evidence submission, real-time status tracking, and
              community upvoting to prioritise high-impact issues.
            </p>
            <div className="mt-6 border border-amber-700/40 bg-amber-900/10 p-4 text-sm text-amber-200">
              <strong>Legal Basis:</strong> Complaints registered on this portal are treated as formal
              grievances under the Public Grievances (Redressal) Act and must be acknowledged within
              <strong> 5 working days</strong>.
            </div>
          </div>
          <div className="space-y-4">
            {[
              { q: "Who can use this portal?", a: "Any Indian citizen with a valid Aadhaar-linked mobile number can register and file complaints." },
              { q: "Is it free to use?", a: "Yes. JanSahayak is a completely free public service offered by the Government." },
              { q: "How are complaints tracked?", a: "Each complaint receives a unique ID. Citizens receive SMS/email updates at every stage of resolution." },
              { q: "What action can I expect?", a: "Municipal authorities are mandated to respond within 5 days and resolve within 15 working days." },
            ].map((faq, i) => (
              <details key={i} className="border border-white/10 group">
                <summary className="flex justify-between items-center px-4 py-3 cursor-pointer text-sm font-semibold hover:bg-white/5 list-none">
                  {faq.q}
                  <span className="text-amber-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CIVIC PROBLEMS ═══════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#080f1e] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge>Reportable Categories</Badge>
            <h2 className="text-3xl font-black font-serif-display mt-3">
              Civic Issues Addressed
            </h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm">
              The following categories are officially recognised under the JanSahayak grievance
              framework and are assigned to respective municipal departments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Potholes & Road Damage", img: pothole, dept: "PWD / Road Dept.", sla: "15 days", desc: "Potholes damage vehicles, cause accidents, and worsen significantly during monsoons." },
              { title: "Broken Street Lights", img: light, dept: "Electricity Dept.", sla: "7 days", desc: "Poor lighting increases crime, reduces visibility, and creates unsafe night conditions." },
              { title: "Garbage Overflow", img: garbage, dept: "Sanitation Dept.", sla: "3 days", desc: "Overflowing garbage leads to foul smell, disease vectors and environmental pollution." },
              { title: "Water Leakage / Shortage", img: water, dept: "Jal Board", sla: "10 days", desc: "Leaking pipelines waste thousands of litres daily and damage nearby infrastructure." },
              { title: "Blocked Drainage", img: drainage, dept: "Drainage Dept.", sla: "7 days", desc: "Clogged drains cause waterlogging, flooding and mosquito breeding in urban areas." },
              { title: "Traffic Signal Issues", img: traffic, dept: "Traffic Police", sla: "5 days", desc: "Non-functional signals lead to traffic chaos, delays and increased accident risk." },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="border border-white/10 hover:border-amber-700/60 bg-[#0a1628] overflow-hidden transition group"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={item.img} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <div className="flex gap-3 mt-2 text-[10px] font-mono-gov">
                    <span className="text-amber-400 bg-amber-900/30 px-2 py-0.5">{item.dept}</span>
                    <span className="text-green-400 bg-green-900/30 px-2 py-0.5">SLA: {item.sla}</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-3">{item.desc}</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-4 text-xs text-amber-400 hover:underline font-mono-gov uppercase tracking-wide"
                  >
                    Report This →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge>Process</Badge>
          <h2 className="text-3xl font-black font-serif-display mt-3">How to File a Complaint</h2>
          <p className="text-slate-400 mt-2 text-sm">Step-by-step grievance process in accordance with government guidelines</p>
        </div>
        <div className="relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-amber-700/30" />
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: "01", icon: "📝", title: "Register / Login", desc: "Create account with Aadhaar-verified mobile number" },
              { step: "02", icon: "📍", title: "Locate Issue", desc: "Use GPS or drop a pin on the map at the issue location" },
              { step: "03", icon: "📷", title: "Upload Evidence", desc: "Attach photographs and describe the problem in detail" },
              { step: "04", icon: "📨", title: "Submit Complaint", desc: "Receive unique complaint ID and acknowledgement receipt" },
              { step: "05", icon: "✅", title: "Track & Resolve", desc: "Get SMS updates until closure and rate the resolution" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="w-14 h-14 rounded-full border-2 border-amber-600 bg-amber-900/20 flex items-center justify-center text-2xl mb-4 z-10">
                  {item.icon}
                </div>
                <span className="text-amber-400 text-[10px] font-mono-gov tracking-widest">{item.step}</span>
                <h3 className="font-bold mt-1 text-sm text-white">{item.title}</h3>
                <p className="text-slate-400 text-xs mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY IT MATTERS ═══════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#080f1e] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge>Key Benefits</Badge>
            <h2 className="text-3xl font-black font-serif-display mt-3">Why JanSahayak?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "Faster Resolution", desc: "Structured digital complaints eliminate manual paperwork, reducing average resolution time from 42 to 15 working days.", stat: "65% faster" },
              { icon: "🔍", title: "Full Transparency", desc: "Real-time status updates, departmental assignments and public dashboards ensure complete accountability.", stat: "100% trackable" },
              { icon: "🗳️", title: "Democratic Prioritisation", desc: "Community upvoting ensures high-impact issues are escalated automatically to senior officials.", stat: "Top issues escalated" },
              { icon: "📊", title: "Data-Driven Governance", desc: "Aggregated complaint data helps authorities identify chronic problem zones and allocate resources efficiently.", stat: "Smart allocation" },
              { icon: "📱", title: "Multi-Channel Access", desc: "File complaints via web portal, mobile app, or toll-free helpline — available in 12 regional languages.", stat: "12 languages" },
              { icon: "🔒", title: "Secure & Compliant", desc: "ISO 27001 certified infrastructure with end-to-end encryption. Data stored on Indian government servers.", stat: "ISO certified" },
            ].map((item, i) => (
              <div key={i} className="border border-white/10 hover:border-amber-700/40 bg-[#0a1628] p-6 transition">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-[10px] text-amber-400 font-mono-gov tracking-widest mb-1">{item.stat}</div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES SECTION ═════════════════════════════════════════════════ */}
      <section id="learn-more" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge>Platform Features</Badge>
          <h2 className="text-3xl font-black font-serif-display mt-3">Portal Capabilities</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {[
            { no: "01", title: "Geo-tagged Reporting", desc: "Citizens attach GPS coordinates ensuring authorities locate issues precisely without field surveys.", color: "text-amber-400" },
            { no: "02", title: "Community Upvoting", desc: "Upvotes highlight the most urgent community issues and trigger automatic escalation protocols.", color: "text-amber-400" },
            { no: "03", title: "SLA Enforcement", desc: "Automated reminders escalate overdue complaints to senior officers ensuring accountability.", color: "text-amber-400" },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="border border-white/10 hover:border-amber-700/60 bg-[#0a1628] p-6 transition">
              <span className={`text-sm font-mono-gov font-bold ${item.color}`}>{item.no}</span>
              <h3 className="font-bold mt-2 mb-2 text-white">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { no: "04", title: "Departmental Workflow", desc: "Complaints auto-routed to concerned departments with built-in assignment and progress tracking.", color: "text-orange-400" },
            { no: "05", title: "Public Dashboard", desc: "Live analytics showing resolution rates, category breakdown and city rankings available publicly.", color: "text-orange-400" },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="border border-white/10 hover:border-orange-700/60 bg-[#0a1628] p-6 transition">
              <span className={`text-sm font-mono-gov font-bold ${item.color}`}>{item.no}</span>
              <h3 className="font-bold mt-2 mb-2 text-white">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ PARTNER MINISTRIES ═══════════════════════════════════════════════ */}
      <section className="py-14 px-6 bg-[#080f1e] border-y border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-500 text-xs tracking-widest uppercase font-mono-gov mb-6">In Collaboration With</p>
          <div className="flex flex-wrap justify-center gap-6 text-slate-400 text-xs font-semibold">
            {[
              "Ministry of Housing & Urban Affairs",
              "Digital India Programme",
              "Smart Cities Mission",
              "NASSCOM",
              "MyGov India",
              "NDMC",
            ].map((org) => (
              <div key={org} className="border border-white/10 px-4 py-2 hover:border-amber-700/40 hover:text-amber-400 transition">
                {org}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-amber-700/10 border-y border-amber-700/30 text-center">
        <Badge>Take Action</Badge>
        <h2 className="text-3xl md:text-4xl font-black font-serif-display mt-4">
          Don't just complain — file a <span className="text-amber-400">formal grievance.</span>
        </h2>
        <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm">
          Your complaint has legal backing. Authorities are bound to respond.
          It takes less than 2 minutes to file.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-500 font-bold tracking-widest uppercase text-sm font-mono-gov transition"
          >
            Register as Citizen
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 border border-amber-600 text-amber-400 hover:bg-amber-600/10 font-bold tracking-widest uppercase text-sm font-mono-gov transition"
          >
            Already Registered? Login
          </button>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#060c18] border-t border-amber-700/30 pt-12 pb-6 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} className="w-7 h-7 rounded" alt="logo" />
              <h3 className="text-white font-black font-serif-display text-lg">JanSahayak</h3>
            </div>
            <p className="text-xs leading-relaxed">
              An initiative under the Smart Cities Mission, Government of India. Empowering citizens through transparent civic grievance redressal.
            </p>
            <p className="mt-3 text-xs text-amber-700/80 font-hindi">जन सेवा ही राष्ट्र सेवा है</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-widest text-xs font-mono-gov">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              {["Home", "About Portal", "File Complaint", "Track Status", "Public Dashboard", "RTI / CPGRAMS"].map((l) => (
                <li key={l} className="hover:text-amber-400 cursor-pointer transition">{l}</li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-widest text-xs font-mono-gov">Issue Categories</h4>
            <ul className="space-y-2 text-xs">
              {["Potholes & Roads", "Street Lighting", "Garbage & Sanitation", "Water & Drainage", "Traffic Signals", "Other Civic Issues"].map((l) => (
                <li key={l} className="hover:text-amber-400 cursor-pointer transition">{l}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-widest text-xs font-mono-gov">Contact Us</h4>
            <ul className="space-y-2 text-xs">
              <li>📞 <strong className="text-white">1800-XXX-XXXX</strong> (Toll Free)</li>
              <li>📧 grievance@jansahayak.gov.in</li>
              <li>🕐 Mon–Sat, 9:00 AM – 6:00 PM</li>
              <li className="mt-3 text-[10px] text-slate-500">Emergency: Contact local municipal office or dial 112</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] text-slate-500 font-mono-gov">
          <p>© 2026 JanSahayak — Government of India. All rights reserved.</p>
          <div className="flex gap-4">
            {["Privacy Policy", "Terms of Use", "Accessibility", "Site Map"].map((l) => (
              <span key={l} className="hover:text-amber-400 cursor-pointer transition">{l}</span>
            ))}
          </div>
        </div>

        {/* bottom tricolor */}
        <div className="tricolor-bar h-1 w-full mt-6" />
      </footer>
    </div>
  );
}
