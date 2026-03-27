import { useState, useEffect } from "react";
import UserSidebar from "../../components/UserSidebar";

const categoryMap = {
  garbage:      "Sanitation",
  bad_road:     "Infrastructure",
  broken_light: "Electricity",
  waterlogging: "Water Supply",
  other:        "General",
};

// ── Volunteer Info Modal ───────────────────────────────────────────────────
function VolunteerInfoModal({ onClose }) {
  const steps = [
    { num: "01", title: "Visit Nearby JanSahayak Centre",      desc: "Locate your nearest JanSahayak Seva Kendra using the portal map. Carry a valid government-issued photo ID.", icon: "🏛️" },
    { num: "02", title: "Fill Volunteer Registration Form",     desc: "Complete the V-REG form at the centre. Mention your skills, availability, and preferred complaint categories.", icon: "📋" },
    { num: "03", title: "Appear for Category Tests",           desc: "Undergo a short assessment based on your chosen categories (e.g., Infrastructure, Sanitation, Water Supply).", icon: "📝" },
    { num: "04", title: "Verification & Approval",             desc: "Upon passing, your account will be upgraded. Your isVolunteer flag is activated and skills are assigned.", icon: "✅" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-[#07111f] border border-amber-700/40 max-w-lg w-full overflow-hidden">
        <div className="h-1 w-full" style={{ background: "linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)" }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[9px] font-mono text-amber-500/70 uppercase tracking-widest mb-1">JanSahayak Volunteer Programme</p>
              <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>Become a Volunteer</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">स्वयंसेवक कैसे बनें</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl leading-none mt-1">✕</button>
          </div>
          <div className="flex flex-col gap-3 mb-6">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-4 border border-white/5 bg-white/[0.02] p-3 hover:border-amber-700/30 transition">
                <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-amber-900/30 border border-amber-700/30 text-sm">{s.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-mono text-amber-500/60 uppercase tracking-widest">{s.num}</span>
                    <span className="text-[11px] font-bold text-white">{s.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border border-amber-700/20 bg-amber-900/10 px-4 py-3 text-[10px] font-mono text-amber-400/70 leading-relaxed mb-4">
            ℹ️ &nbsp;Once verified, you can volunteer on complaints matching your approved skill categories and receive payment for resolutions.
          </div>
          <button onClick={onClose} className="w-full py-2 border border-white/10 text-[11px] font-mono text-slate-400 hover:text-white hover:border-white/30 transition uppercase tracking-widest">
            Close
          </button>
        </div>
        <div className="h-1 w-full" style={{ background: "linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)" }} />
      </div>
    </div>
  );
}

// ── Volunteer Apply Modal ──────────────────────────────────────────────────
function VolunteerApplyModal({ complaint, onClose, onSubmit }) {
  const [form, setForm] = useState({
    estimatedAmount: "", estimatedDays: "",
    bankName: "", accountNumber: "", ifsc: "", accountHolder: "",
    selfieFile: null, selfiePreview: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSelfie = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, selfieFile: file, selfiePreview: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await onSubmit({ complaintId: complaint._id, ...form });
    setSubmitting(false);
    if (res?.success) setSubmitted(true);
  };

  const valid = form.estimatedAmount && form.estimatedDays && form.bankName &&
    form.accountNumber && form.ifsc && form.accountHolder && form.selfieFile;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-[#07111f] border border-green-700/40 max-w-sm w-full p-8 text-center">
          <div className="h-1 w-full mb-6" style={{ background: "linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)" }} />
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-black text-green-400 mb-2" style={{ fontFamily: "'Source Serif 4', serif" }}>Application Submitted</h3>
          <p className="text-xs text-slate-400 font-mono mb-6">Your volunteer application has been received. You'll be notified upon approval.</p>
          <button onClick={onClose} className="w-full py-2 border border-green-700/40 bg-green-900/20 text-green-400 text-[11px] font-mono uppercase tracking-widest hover:bg-green-900/40 transition">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative bg-[#07111f] border border-amber-700/40 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="h-1 w-full sticky top-0" style={{ background: "linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)" }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[9px] font-mono text-amber-500/70 uppercase tracking-widest mb-1">Volunteer Application</p>
              <h2 className="text-base font-black text-white" style={{ fontFamily: "'Source Serif 4', serif" }}>Apply for Complaint</h2>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">{complaint.title}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition text-xl leading-none mt-1">✕</button>
          </div>

          <p className="text-[9px] font-mono text-amber-500/60 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Resolution Details</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { name: "estimatedAmount", label: "Estimated Amount (₹) *", type: "number", placeholder: "e.g. 2500" },
              { name: "estimatedDays",   label: "Time to Resolve (days) *", type: "number", placeholder: "e.g. 3" },
            ].map(f => (
              <div key={f.name}>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">{f.label}</label>
                <input name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={handleChange}
                  className="w-full bg-[#060e1f] border border-white/10 text-white text-xs font-mono px-3 py-2 focus:outline-none focus:border-amber-700/60 placeholder-slate-600" />
              </div>
            ))}
          </div>

          <p className="text-[9px] font-mono text-amber-500/60 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Bank Details (for payment)</p>
          <div className="flex flex-col gap-3 mb-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "accountHolder", label: "Account Holder Name *", placeholder: "Full name as per bank" },
                { name: "bankName",      label: "Bank Name *",            placeholder: "e.g. SBI, HDFC" },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">{f.label}</label>
                  <input name={f.name} type="text" placeholder={f.placeholder} value={form[f.name]} onChange={handleChange}
                    className="w-full bg-[#060e1f] border border-white/10 text-white text-xs font-mono px-3 py-2 focus:outline-none focus:border-amber-700/60 placeholder-slate-600" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "accountNumber", label: "Account Number *", placeholder: "e.g. 1234567890" },
                { name: "ifsc",          label: "IFSC Code *",       placeholder: "e.g. SBIN0001234" },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">{f.label}</label>
                  <input name={f.name} type="text" placeholder={f.placeholder} value={form[f.name]} onChange={handleChange}
                    className="w-full bg-[#060e1f] border border-white/10 text-white text-xs font-mono px-3 py-2 focus:outline-none focus:border-amber-700/60 placeholder-slate-600" />
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] font-mono text-amber-500/60 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">Identity Verification</p>
          <div className="mb-6">
            <label className="text-[10px] font-mono text-slate-400 block mb-2">Upload Your Photo (Selfie) *</label>
            <label className="flex items-center gap-3 cursor-pointer border border-dashed border-white/10 hover:border-amber-700/40 transition p-4 bg-[#060e1f]">
              {form.selfiePreview ? (
                <>
                  <img src={form.selfiePreview} alt="selfie" className="w-14 h-14 object-cover border border-white/10" />
                  <span className="text-[10px] font-mono text-green-400">Photo selected ✓ — click to change</span>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 border border-white/10 flex items-center justify-center text-2xl bg-white/[0.02]">📷</div>
                  <span className="text-[10px] font-mono text-slate-500">Click to upload a clear selfie for identity verification</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleSelfie} />
            </label>
          </div>

          <button onClick={handleSubmit} disabled={!valid || submitting}
            className={`w-full py-2.5 text-[11px] font-mono uppercase tracking-widest transition border ${
              valid && !submitting
                ? "border-amber-600/60 bg-amber-900/30 text-amber-300 hover:bg-amber-900/50"
                : "border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed"
            }`}>
            {submitting ? "Submitting..." : "Submit Volunteer Application →"}
          </button>
          <p className="text-[9px] font-mono text-slate-600 text-center mt-3">Your bank details are encrypted and only used for official disbursement.</p>
        </div>
        <div className="h-1 w-full" style={{ background: "linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)" }} />
      </div>
    </div>
  );
}

// ── Main Feed ──────────────────────────────────────────────────────────────
export default function Feed() {
  const [complaints, setComplaints]           = useState([]);
  const [sortBy, setSortBy]                   = useState("upvotes");
  const [loading, setLoading]                 = useState(true);
  const [infoModal, setInfoModal]             = useState(false);
  const [applyModal, setApplyModal]           = useState(null);
  const [appliedComplaints, setAppliedComplaints] = useState(new Set()); // ✅ declared here

  const rawUser        = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId  = rawUser?._id;
  const isVolunteer    = rawUser?.isVolunteer === true;
  const volunteerSkills = rawUser?.volunteerDetails?.skills || [];
  const token          = localStorage.getItem("token");

  // ✅ fetch user's existing bids on mount so applied state persists on refresh
  useEffect(() => {
    if (!isVolunteer) return;
    fetch("https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/volunteer/my-bids", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setAppliedComplaints(new Set(d.bids.map(b => b.complaint?.toString())));
        }
      })
      .catch(console.error);
  }, [isVolunteer]);

  useEffect(() => { fetchComplaints(); }, [sortBy]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res  = await fetch("https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/complaint/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const sorted = [...data.complaints].sort((a, b) =>
          sortBy === "upvotes"
            ? (b.upvotes?.length || 0) - (a.upvotes?.length || 0)
            : new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComplaints(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (complaintId) => {
    try {
      const res  = await fetch(`https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/complaint/${complaintId}/upvote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(prev => prev.map(c =>
          c._id === complaintId
            ? { ...c, upvotes: data.upvoted ? [...(c.upvotes || []), currentUserId] : (c.upvotes || []).filter(id => id !== currentUserId) }
            : c
        ));
      }
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  const handleVolunteerSubmit = async (payload) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (k === "selfieFile" || k === "selfiePreview") return;
        formData.append(k, v);
      });
      if (payload.selfieFile) formData.append("selfie", payload.selfieFile);

      const res  = await fetch("https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/volunteer/apply", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      // ✅ mark as applied immediately — no page refresh needed
      setAppliedComplaints(prev => new Set([...prev, payload.complaintId]));
      return { success: true };
    } catch (err) {
      console.error("Volunteer apply failed:", err.message);
      alert(err.message || "Something went wrong");
      return { success: false };
    }
  };

  // ✅ single clean renderVolunteerButton — no duplicates
  const renderVolunteerButton = (post) => {
    if (!isVolunteer) {
      return (
        <button onClick={() => setInfoModal(true)}
          className="text-[10px] font-mono text-slate-500 hover:text-amber-400 transition px-3 py-1.5 border border-white/10 hover:border-amber-700/40 flex items-center gap-1.5">
          🙋 Become a Volunteer
        </button>
      );
    }
    const requiredSkill = (post.category || "").toLowerCase().trim();
    // const requiredSkill = (post.category || "").toLowerCase();
    // const requiredSkill   = (categoryMap[post.category] || post.category || "").toLowerCase();
    const categoryMatches = volunteerSkills.some(s => s?.toLowerCase() === requiredSkill);

    if (!categoryMatches) {
      return (
        <div className="relative group/tip">
          <button disabled className="text-[10px] font-mono text-slate-600 px-3 py-1.5 border border-white/5 cursor-not-allowed flex items-center gap-1.5">
            🙋 Volunteer
          </button>
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tip:block z-10 w-56 bg-[#0a1628] border border-white/10 px-3 py-2 text-[10px] font-mono text-slate-400 leading-relaxed shadow-xl">
            Your skills don't cover <span className="text-amber-400">{categoryMap[post.category] || post.category}</span>. Visit a JanSahayak centre to expand your categories.
          </div>
        </div>
      );
    }

    if (appliedComplaints.has(post._id)) {
      return (
        <div className="relative group/tip">
          <button disabled className="text-[10px] font-mono text-slate-600 px-3 py-1.5 border border-white/5 cursor-not-allowed flex items-center gap-1.5">
            ✓ Applied
          </button>
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tip:block z-10 w-48 bg-[#0a1628] border border-white/10 px-3 py-2 text-[10px] font-mono text-slate-400 leading-relaxed shadow-xl">
            You've already applied for this complaint.
          </div>
        </div>
      );
    }

    return (
      <button onClick={() => setApplyModal(post)}
        className="text-[10px] font-mono text-green-400 hover:text-green-300 transition px-3 py-1.5 border border-green-700/40 hover:border-green-600/60 bg-green-900/20 hover:bg-green-900/30 flex items-center gap-1.5">
        🙋 Volunteer for This
      </button>
    );
  };

  const isUpvoted = (c) => c.upvotes?.includes(currentUserId);

  const statusColor = {
    pending:    "text-slate-400 bg-slate-800 border-slate-700",
    resolved:   "text-green-400 bg-green-900/30 border-green-700/40",
    inProgress: "text-amber-400 bg-amber-900/30 border-amber-700/40",
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#060e1f] text-white flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
        .tricolor-bar       { background: linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%); }
        .gov-grid           { background-image: linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px); background-size:48px 48px; }
      `}</style>

      {infoModal  && <VolunteerInfoModal onClose={() => setInfoModal(false)} />}
      {applyModal && <VolunteerApplyModal complaint={applyModal} onClose={() => setApplyModal(null)} onSubmit={handleVolunteerSubmit} />}

      <UserSidebar />

      <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
        <div className="tricolor-bar h-1 w-full shrink-0" />

        <div className="bg-[#0a1628] border-b border-amber-700/30 px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-black font-serif-display text-white leading-tight">Community Feed</h1>
            <p className="text-[10px] text-slate-500 font-mono-gov">JanSahayak Portal &nbsp;|&nbsp; सामुदायिक शिकायत फीड</p>
          </div>
          <div className="flex items-center gap-3">
            {isVolunteer && (
              <div className="border border-green-700/40 bg-green-900/20 text-green-400 text-[10px] font-mono-gov uppercase tracking-widest px-3 py-1 flex items-center gap-1.5">
                🛡️ Volunteer Active
              </div>
            )}
            <div className="border border-amber-700/40 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-3 py-1">
              📡 Live Feed
            </div>
          </div>
        </div>

        <div className="flex-1 gov-grid p-6 overflow-auto">
          <div className="flex items-center gap-4 mb-5 text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">
            <span>Sort by:</span>
            {[{ label: "Most Upvoted", val: "upvotes" }, { label: "Newest", val: "newest" }].map(s => (
              <button key={s.val} onClick={() => setSortBy(s.val)}
                className={`transition ${sortBy === s.val ? "text-amber-400 underline underline-offset-2" : "hover:text-amber-400"}`}>
                {s.label}
              </button>
            ))}
          </div>

          {loading && <div className="text-center text-slate-500 font-mono-gov text-xs py-20">Loading complaints...</div>}

          {!loading && (
            <div className="max-w-4xl flex flex-col gap-5">
              {complaints.length === 0 && (
                <div className="text-center text-slate-500 font-mono-gov text-xs py-20 border border-white/5">No complaints found.</div>
              )}
              {complaints.map((post, i) => (
                <div key={post._id || i} className="border border-white/10 hover:border-amber-700/40 bg-[#0a1628] transition group">
                  {post.photo && (
                    <div className="relative h-44 overflow-hidden">
                      <img src={post.photo} alt={post.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent" />
                      <div className={`absolute top-3 right-3 text-[9px] font-mono-gov font-bold px-2 py-0.5 border ${statusColor[post.status] || statusColor.pending}`}>
                        {post.status}
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-mono-gov text-slate-500">{post._id?.slice(-6).toUpperCase() || "------"}</span>
                      <span className="text-[9px] font-mono-gov bg-[#060e1f] border border-white/10 text-slate-400 px-2 py-0.5">{post.category}</span>
                      {!post.photo && (
                        <div className={`ml-auto text-[9px] font-mono-gov font-bold px-2 py-0.5 border ${statusColor[post.status] || statusColor.pending}`}>
                          {post.status}
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-white font-serif-display text-base">{post.title}</h3>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">{post.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-[10px] font-mono-gov text-slate-500">
                      <span>📍 {post.location}</span>
                      <span>🕐 {timeAgo(post.createdAt)}</span>
                      {post.postedBy?.name && <span>👤 {post.postedBy.name}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <button onClick={() => handleUpvote(post._id)}
                        className={`flex items-center gap-2 text-[11px] font-mono-gov transition border px-3 py-1.5 ${
                          isUpvoted(post)
                            ? "border-amber-600 bg-amber-600/20 text-amber-400"
                            : "text-slate-400 hover:text-amber-400 border-white/10 hover:border-amber-700/40"
                        }`}>
                        ▲ {isUpvoted(post) ? "Upvoted" : "Upvote"}&nbsp;<strong className="text-amber-400">{post.upvotes?.length || 0}</strong>
                      </button>
                      <div className="flex gap-2 items-center">
                        {renderVolunteerButton(post)}
                        <button className="text-[10px] font-mono-gov text-slate-500 hover:text-amber-400 transition px-3 py-1.5 border border-white/10 hover:border-amber-700/40">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov max-w-4xl">
            Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free) &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
          </div>
        </div>

        <div className="tricolor-bar h-1 w-full shrink-0" />
      </div>
    </div>
  );
}