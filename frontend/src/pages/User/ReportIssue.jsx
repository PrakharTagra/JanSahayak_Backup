import { useState } from "react";
import UserSidebar from "../../components/UserSidebar";

export default function ReportIssue() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) {
      alert("Please confirm the declaration before submitting.");
      return;
    }

    try {
      setLoadingSubmit(true); // ✅ START LOADER

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", desc);
      formData.append("location", location);
      formData.append("category", category);

      if (file) {
        formData.append("photo", file);
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/complaint/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log("ERROR:", error);
      alert("Submission failed");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#060e1f] text-white flex">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
          .font-serif-display{font-family:'Source Serif 4',Georgia,serif}
          .font-mono-gov{font-family:'JetBrains Mono',monospace}
          .tricolor-bar{background:linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)}
          .gov-grid{background-image:linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px);background-size:48px 48px}
        `}</style>
        <UserSidebar />
        <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
          <div className="tricolor-bar h-1 w-full shrink-0" />
          <div className="flex-1 gov-grid flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
              <div className="text-5xl mb-4">✅</div>
              <div className="border border-green-700/40 bg-green-900/10 p-8">
                <p className="text-[10px] font-mono-gov text-green-400 uppercase tracking-widest mb-2">Complaint Registered</p>
                <h2 className="text-2xl font-black font-serif-display text-white">Submission Successful</h2>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Your grievance has been registered on the JanSahayak Portal. A unique complaint ID has been assigned and the relevant department has been notified.
                </p>
                <div className="mt-6 border border-amber-700/30 bg-[#0a1628] px-5 py-4">
                  <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">Complaint ID</p>
                  <p className="text-xl font-black font-mono-gov text-amber-400 mt-1">JS-2026-{Math.floor(1000 + Math.random() * 9000)}</p>
                  <p className="text-[10px] text-slate-600 font-mono-gov mt-1">Save this for future reference</p>
                </div>
                <p className="text-[10px] text-slate-500 font-mono-gov mt-4">
                  An acknowledgement has been sent to your registered email. You will receive SMS updates at every stage of resolution.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 transition font-bold tracking-widest uppercase text-sm font-mono-gov"
                >
                  File Another Complaint
                </button>
              </div>
            </div>
          </div>
          <div className="tricolor-bar h-1 w-full shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060e1f] text-white flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif-display{font-family:'Source Serif 4',Georgia,serif}
        .font-mono-gov{font-family:'JetBrains Mono',monospace}
        .tricolor-bar{background:linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)}
        .gov-grid{background-image:linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px);background-size:48px 48px}
        input,textarea,select{outline:none}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #060e1f inset!important;-webkit-text-fill-color:white!important}
      `}</style>

      <UserSidebar />

      <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
        <div className="tricolor-bar h-1 w-full shrink-0" />

        {/* Top bar */}
        <div className="bg-[#0a1628] border-b border-amber-700/30 px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-black font-serif-display text-white leading-tight">File a Complaint</h1>
            <p className="text-[10px] text-slate-500 font-mono-gov">JanSahayak Portal &nbsp;|&nbsp; शिकायत दर्ज करें</p>
          </div>
          <div className="border border-amber-700/40 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-3 py-1">
            📋 New Grievance
          </div>
        </div>

        <div className="flex-1 gov-grid p-6 overflow-auto">
          <div className="max-w-4xl">

            {/* Info notice */}
            <div className="border border-amber-700/30 bg-amber-900/10 text-amber-200/80 text-[11px] font-mono-gov px-4 py-3 mb-6 leading-relaxed">
              ℹ️ All fields marked <span className="text-amber-500">*</span> are mandatory. Complaints with photographic evidence are prioritised and resolved faster. False or misleading complaints may result in account suspension.
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-6 text-[10px] font-mono-gov">
              {["Issue Details", "Location & Evidence", "Declaration"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 border ${i === 0 ? "border-amber-600 bg-amber-600/20 text-amber-400" : "border-white/10 text-slate-600"}`}>
                    <span>{i + 1}.</span> {step}
                  </div>
                  {i < 2 && <div className="text-slate-700">›</div>}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* ── SECTION 1: Issue Details ── */}
              <div className="border border-white/10 bg-[#0a1628]">
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">01</span>
                  <span className="text-white font-bold text-sm">Issue Details</span>
                </div>
                <div className="p-5 flex flex-col gap-5">

                  {/* Title */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Complaint Title <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Brief title describing the issue"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov transition"
                    />
                    <p className="text-[10px] text-slate-600 font-mono-gov mt-1">{title.length}/100 characters</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Detailed Description <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe the issue in detail — when it started, how severe it is, and any impact on residents..."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov resize-none transition"
                    />
                    <p className="text-[10px] text-slate-600 font-mono-gov mt-1">{desc.length}/500 characters</p>
                  </div>
                  <div className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 text-sm font-mono-gov flex items-center gap-3">
                    {loadingAI ? (
                      <>
                        {/* Spinner */}
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>

                        {/* Loading text */}
                        <span className="text-amber-400 font-bold">
                          Analyzing image...
                        </span>
                      </>
                    ) : (
                      <span
                        className={`font-bold transition-all duration-300 ${
                          category ? "text-green-400 opacity-100" : "text-slate-500 opacity-70"
                        }`}
                      >
                        {category || "Upload image to detect category"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: Location & Evidence ── */}
              <div className="border border-white/10 bg-[#0a1628]">
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">02</span>
                  <span className="text-white font-bold text-sm">Location & Evidence</span>
                </div>
                <div className="p-5 flex flex-col gap-5">

                  {/* Location */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Location / Address <span className="text-amber-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Street, Sector, Landmark, City"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="flex-1 px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov transition"
                      />
                      <button
                        type="button"
                        className="px-4 py-3 border border-amber-700/40 text-amber-400 hover:bg-amber-600/10 transition text-[10px] font-mono-gov uppercase tracking-wide whitespace-nowrap"
                      >
                        📍 Use GPS
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
                      Precise location helps authorities locate and resolve the issue faster.
                    </p>
                  </div>

                  {/* File upload */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Upload Photograph / Evidence
                    </label>
                    <div className="relative">
                      <label
                        htmlFor="evidence-upload"
                        className="flex flex-col items-center justify-center border border-dashed border-amber-700/30 bg-[#060e1f] hover:border-amber-600/60 hover:bg-amber-600/5 transition cursor-pointer py-8 gap-2"
                      >
                        <span className="text-2xl">{file ? "📎" : "📷"}</span>
                        <span className="text-xs font-mono-gov text-slate-400">
                          {file ? file.name : "Click to upload image or drag & drop"}
                        </span>
                        <span className="text-[10px] font-mono-gov text-slate-600">
                          JPG, PNG up to 5MB — Strongly recommended
                        </span>
                      </label>

                      {/* 🔥 LOADER OVERLAY */}
                      {loadingAI && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-amber-400 font-mono-gov">
                              AI is analyzing image...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      id="evidence-upload"
                      disabled={loadingAI}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const selectedFile = e.target.files[0];
                        setFile(selectedFile);

                        if (!selectedFile) return;

                        try {
                          setLoadingAI(true);

                          const formData = new FormData();
                          formData.append("image", selectedFile);

                          // 👉 CALL YOUR ML API
                          const res = await fetch("https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/classify", {
                            method: "POST",
                            body: formData,
                          });

                          const text = await res.text();

                          let data;
                          try {
                            data = JSON.parse(text);
                          } catch (err) {
                            console.error("Not JSON →", text);
                            throw new Error("Invalid JSON from server");
                          }
                          setCategory(data.category);

                        } catch (err) {
                          console.error("ML Error:", err);
                          alert("AI analysis failed");
                        } finally {
                          setLoadingAI(false);
                        }
                      }}
                    />
                  </div>

                </div>
              </div>

              {/* ── SECTION 3: Declaration ── */}
              <div className="border border-white/10 bg-[#0a1628]">
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">03</span>
                  <span className="text-white font-bold text-sm">Citizen Declaration</span>
                </div>
                <div className="p-5">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => setAgreed(!agreed)}
                      className={`mt-0.5 w-4 h-4 shrink-0 border-2 transition flex items-center justify-center ${
                        agreed ? "border-amber-500 bg-amber-600" : "border-slate-600 group-hover:border-amber-700"
                      }`}
                    >
                      {agreed && <span className="text-white text-[10px] leading-none">✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono-gov leading-relaxed">
                      I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that filing a false complaint is an offence and may result in legal action under applicable law. I consent to my complaint being shared with the relevant municipal department for resolution.
                    </p>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loadingAI || loadingSubmit}
                className={`w-full py-3.5 font-bold tracking-widest uppercase text-sm font-mono-gov transition ${
                  loadingAI
                    ? "bg-slate-700 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-500 active:scale-[0.99]"
                }`}
              >
                {loadingAI ? "Processing Image..." : "Submit Complaint →"}
              </button>

              <p className="text-[10px] text-slate-600 font-mono-gov text-center -mt-2">
                You will receive an acknowledgement with a unique Complaint ID on your registered email & mobile.
              </p>

            </form>

            {/* Footer strip */}
            <div className="mt-8 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov">
              Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free) &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
            </div>
          </div>
        </div>
        <div className="tricolor-bar h-1 w-full shrink-0" />
      </div>
      {loadingSubmit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            
            {/* Text */}
            <p className="text-amber-400 font-mono-gov text-sm tracking-widest">
              Submitting Complaint...
            </p>

            <p className="text-slate-500 text-xs font-mono-gov">
              Please wait while we register your grievance
            </p>
          </div>
        </div>
      )}
    </div>
  );
}