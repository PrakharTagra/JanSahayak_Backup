import { useState } from "react";
import UserSidebar from "../../components/UserSidebar";

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
  .font-serif-display { font-family: 'Source Serif 4', Georgia, serif }
  .font-mono-gov      { font-family: 'JetBrains Mono', monospace }
  .tricolor-bar       { background: linear-gradient(to right, #FF9933 33.3%, white 33.3%, white 66.6%, #138808 66.6%) }
  .gov-grid           { background-image: linear-gradient(rgba(255,165,0,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,165,0,0.025) 1px, transparent 1px);
                        background-size: 48px 48px }
  input, textarea { outline: none }
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #060e1f inset !important;
    -webkit-text-fill-color: white !important
  }
`;

// ── GPS accuracy hard limit ───────────────────────────────────────────────────
const GPS_ACCURACY_LIMIT_M = 200; // reject if worse than this

// ── Reverse geocode (Nominatim) ───────────────────────────────────────────────
const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const d = await res.json();
    return d?.display_name ?? null;
  } catch {
    return null;
  }
};

// ── Image compressor ──────────────────────────────────────────────────────────
const compressImage = (file, maxSizeMB = 1) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const maxDim = 1920;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = (height / width) * maxDim; width = maxDim; }
        else { width = (width / height) * maxDim; height = maxDim; }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const tryCompress = (q) =>
        canvas.toBlob(
          (blob) =>
            blob.size > maxSizeMB * 1024 * 1024 && q > 0.3
              ? tryCompress(q - 0.1)
              : resolve(new File([blob], file.name, { type: "image/jpeg" })),
          "image/jpeg", q
        );
      tryCompress(0.8);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

// ── GPS — hard 200m ceiling ───────────────────────────────────────────────────
// Returns { lat, lon, accuracy, address } or
//         { error: "denied" | "inaccurate" | "timeout" }
const getAccurateGPS = (onStatus) =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ error: "denied" });

    let settled = false;
    let watchId = null;

    const finish = async (pos) => {
      if (settled) return;

      // Hard accuracy gate — reject anything worse than 200 m
      if (pos.coords.accuracy > GPS_ACCURACY_LIMIT_M) {
        // Keep trying until the hard timeout fires
        onStatus(`GPS refining… ±${Math.round(pos.coords.accuracy)}m (need ≤${GPS_ACCURACY_LIMIT_M}m)`);
        return;
      }

      settled = true;
      clearTimeout(softT);
      clearTimeout(hardT);
      navigator.geolocation.clearWatch(watchId);

      onStatus("Getting street address…");
      const address = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      resolve({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
        address,
      });
    };

    const deny = () => {
      if (settled) return;
      settled = true;
      clearTimeout(softT);
      clearTimeout(hardT);
      navigator.geolocation.clearWatch(watchId);
      resolve({ error: "denied" });
    };

    onStatus("Waiting for GPS signal…");

    watchId = navigator.geolocation.watchPosition(finish, deny, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000,
    });

    // After 10s do an explicit check with a short timeout
    const softT = setTimeout(() => {
      navigator.geolocation.getCurrentPosition(finish, () => {}, {
        enableHighAccuracy: true, maximumAge: 0, timeout: 3000,
      });
    }, 10000);

    // Hard deadline at 15s — whatever we have is inaccurate → reject
    const hardT = setTimeout(() => {
      if (settled) return;
      settled = true;
      navigator.geolocation.clearWatch(watchId);
      resolve({ error: "inaccurate" });
    }, 15000);
  });

// ── Accuracy badge helper ─────────────────────────────────────────────────────
const badge = (acc) =>
  acc <= 50
    ? { label: "Street-level",    color: "text-green-400", border: "border-green-700/40",  bg: "bg-green-900/10"  }
    : { label: "Neighbourhood",   color: "text-blue-400",  border: "border-blue-700/40",   bg: "bg-blue-900/10"   };

// ─────────────────────────────────────────────────────────────────────────────
export default function ReportIssue() {
  const [title,         setTitle]         = useState("");
  const [desc,          setDesc]          = useState("");
  const [category,      setCategory]      = useState("");
  const [file,          setFile]          = useState(null);
  const [filePreview,   setFilePreview]   = useState(null);
  const [agreed,        setAgreed]        = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [loadingAI,     setLoadingAI]     = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [imageAnalyzed, setImageAnalyzed] = useState(false);
  const [gpsStatus,     setGpsStatus]     = useState(null);   // live message
  const [gpsData,       setGpsData]       = useState(null);   // good fix
  const [gpsError,      setGpsError]      = useState(null);   // "denied"|"inaccurate"|"timeout"|null
  const [complaintId,   setComplaintId]   = useState(null);

  // ── Camera capture handler ──────────────────────────────────────────────────
  const handleCapture = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Reset
    setFile(selected);
    setFilePreview(URL.createObjectURL(selected));
    setGpsData(null);
    setGpsError(null);
    setGpsStatus(null);
    setImageAnalyzed(false);
    setCategory("");

    try {
      setLoadingAI(true);

      // GPS + AI classify in parallel
      const [gpsResult, classifyData] = await Promise.all([
        getAccurateGPS((msg) => setGpsStatus(msg)),
        (async () => {
          const compressed = await compressImage(selected);
          const fd = new FormData();
          fd.append("image", compressed);
          const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/classify`, {
            method: "POST", body: fd,
          });
          return res.json();
        })(),
      ]);

      setGpsStatus(null);

      if (gpsResult.error) {
        setGpsError(gpsResult.error);  // "denied" | "inaccurate"
      } else {
        setGpsData(gpsResult);
      }

      setCategory(classifyData.category ?? "");
      setImageAnalyzed(true);
    } catch (err) {
      console.error(err);
      alert("Processing failed — please retake the photo.");
    } finally {
      setLoadingAI(false);
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed)  { alert("Please confirm the declaration."); return; }
    if (!gpsData) { alert("Valid GPS location is required."); return; }

    try {
      setLoadingSubmit(true);

      const fd = new FormData();
      fd.append("title",           title);
      fd.append("description",     desc);
      fd.append("category",        category);
      fd.append("latitude",        gpsData.lat);
      fd.append("longitude",       gpsData.lon);
      fd.append("gps_accuracy_m",  gpsData.accuracy);
      fd.append("location_address", gpsData.address ?? "");
      // Client-side capture time — backend MUST override with server time
      fd.append("captured_at_client", new Date().toISOString());
      fd.append("photo", file);

      const token = localStorage.getItem("token");
      const res   = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/complaint/create`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd }
      );
      const data = await res.json();

      if (data.success) {
        setComplaintId(data.complaintId ?? `JS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
        setSubmitted(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Submission failed — please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle(""); setDesc(""); setCategory("");
    setFile(null); setFilePreview(null); setAgreed(false); setSubmitted(false);
    setImageAnalyzed(false); setGpsData(null); setGpsError(null);
    setGpsStatus(null); setComplaintId(null);
  };

  const canSubmit = file && imageAnalyzed && gpsData && !loadingAI && !loadingSubmit;

  // ── GPS error copy ──────────────────────────────────────────────────────────
  const GPS_ERROR_COPY = {
    denied: {
      heading: "Location access denied",
      body: "Grant location permission to your browser / camera app in device Settings, then retake the photo.",
    },
    inaccurate: {
      heading: `GPS signal too weak (need ≤${GPS_ACCURACY_LIMIT_M}m accuracy)`,
      body: "Move to open sky — away from buildings, indoors, or underground — and retake the photo.",
    },
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // Success screen
  // ══════════════════════════════════════════════════════════════════════════════
  if (submitted) {
    const b = badge(gpsData.accuracy);
    return (
      <div className="min-h-screen bg-[#060e1f] text-white flex">
        <style>{STYLES}</style>
        <UserSidebar />
        <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
          <div className="tricolor-bar h-1 w-full shrink-0" />
          <div className="flex-1 gov-grid flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
              <div className="text-5xl mb-4">✅</div>
              <div className="border border-green-700/40 bg-green-900/10 p-8">
                <p className="text-[10px] font-mono-gov text-green-400 uppercase tracking-widest mb-2">
                  Complaint Registered
                </p>
                <h2 className="text-2xl font-black font-serif-display text-white">
                  Submission Successful
                </h2>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Your grievance has been logged and the exact GPS pin has been sent to the
                  relevant department.
                </p>

                {/* Complaint ID */}
                <div className="mt-5 border border-amber-700/30 bg-[#0a1628] px-5 py-4">
                  <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">
                    Complaint ID
                  </p>
                  <p className="text-xl font-black font-mono-gov text-amber-400 mt-1">
                    {complaintId}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
                    Save this for future reference
                  </p>
                </div>

                {/* Location summary */}
                <div className={`mt-4 border px-4 py-3 text-left ${b.border} ${b.bg}`}>
                  <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest mb-1">
                    Pinned Location
                  </p>
                  <p className={`text-[11px] font-mono-gov leading-relaxed ${b.color}`}>
                    {gpsData.address ?? "Address unavailable"}
                  </p>
                  <p className="text-[10px] font-mono-gov text-slate-600 mt-1">
                    {gpsData.lat.toFixed(6)}, {gpsData.lon.toFixed(6)}
                    &nbsp;·&nbsp; ±{gpsData.accuracy}m · {b.label}
                  </p>
                </div>

                <button
                  onClick={resetForm}
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

  // ══════════════════════════════════════════════════════════════════════════════
  // Main form
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#060e1f] text-white flex">
      <style>{STYLES}</style>
      <UserSidebar />

      <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
        <div className="tricolor-bar h-1 w-full shrink-0" />

        {/* ── Top bar ── */}
        <div className="bg-[#0a1628] border-b border-amber-700/30 px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-black font-serif-display text-white leading-tight">
              File a Complaint
            </h1>
            <p className="text-[10px] text-slate-500 font-mono-gov">
              JanSahayak Portal &nbsp;|&nbsp; शिकायत दर्ज करें
            </p>
          </div>
          <div className="border border-amber-700/40 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-3 py-1">
            📋 New Grievance
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 gov-grid p-6 overflow-auto">
          <div className="max-w-4xl">

            {/* Info banner */}
            <div className="border border-amber-700/30 bg-amber-900/10 text-amber-200/80 text-[11px] font-mono-gov px-4 py-3 mb-6 leading-relaxed">
              📸 <strong className="text-amber-400">You must take a live photo at the site</strong>{" "}
              to file a complaint — gallery uploads are not accepted.
              Your GPS coordinates (≤{GPS_ACCURACY_LIMIT_M}m accuracy required) are captured
              automatically and pinned to the civic map. Stand in open sky for best signal.
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* ────────────────────────────────────────────────────────────── */}
              {/* SECTION 01 — Camera capture                                   */}
              {/* ────────────────────────────────────────────────────────────── */}
              <div className="border border-white/10 bg-[#0a1628]">
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">01</span>
                  <span className="text-white font-bold text-sm">Take Photo at Location</span>
                  <span className="ml-auto text-[9px] font-mono-gov text-green-500 border border-green-700/30 bg-green-900/10 px-2 py-0.5">
                    Live Camera Only
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-4">

                  {/* ── Idle: big camera CTA ── */}
                  {!file && !loadingAI && (
                    <label
                      htmlFor="camera-input"
                      className="flex flex-col items-center justify-center border border-dashed border-amber-600/50 bg-amber-900/5 hover:border-amber-500 hover:bg-amber-900/10 transition cursor-pointer py-16 gap-3"
                    >
                      <span className="text-5xl">📸</span>
                      <span className="text-[15px] font-mono-gov text-amber-300 font-bold">
                        Open Camera
                      </span>
                      <span className="text-[11px] font-mono-gov text-amber-500/70 text-center leading-relaxed max-w-xs">
                        Stand at the issue site and take a photo. GPS location is captured
                        automatically — no manual entry needed.
                      </span>
                      <span className="text-[9px] font-mono-gov text-slate-500 border border-slate-700/40 px-3 py-0.5 mt-1">
                        Gallery uploads are blocked · GPS ≤{GPS_ACCURACY_LIMIT_M}m required
                      </span>
                    </label>
                  )}

                  {/* Single hidden camera input — no gallery fallback */}
                  <input
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleCapture}
                    // Reset value so the same file can trigger onChange again after retake
                    onClick={(e) => (e.target.value = null)}
                  />

                  {/* ── Processing spinner ── */}
                  {loadingAI && (
                    <div className="border border-amber-600/20 bg-amber-900/5 py-12 flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-amber-400 font-mono-gov font-bold">
                        {gpsStatus || "Processing…"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono-gov">
                        AI classification + GPS running simultaneously
                      </p>
                      {/* Live GPS progress bar — pulses until resolved */}
                      <div className="w-48 h-1 bg-slate-800 mt-1 overflow-hidden">
                        <div className="h-full bg-amber-500 animate-pulse w-full" />
                      </div>
                    </div>
                  )}

                  {/* ── Preview after capture ── */}
                  {file && !loadingAI && (
                    <>
                      {/* Photo thumbnail */}
                      <div className="relative w-full overflow-hidden border border-white/10">
                        <img
                          src={filePreview}
                          alt="Captured evidence"
                          className="w-full max-h-72 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                        {/* Overlay badges */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                          <span className="text-xs font-mono-gov text-white/70 truncate max-w-[55%]">
                            {file.name}
                          </span>
                          {gpsData && (
                            <span className={`text-[10px] font-mono-gov font-bold border px-2 py-0.5 shrink-0 ${badge(gpsData.accuracy).color} ${badge(gpsData.accuracy).border} ${badge(gpsData.accuracy).bg}`}>
                              📍 ±{gpsData.accuracy}m — {badge(gpsData.accuracy).label}
                            </span>
                          )}
                          {gpsError && (
                            <span className="text-[10px] font-mono-gov text-red-400 border border-red-700/40 bg-red-900/20 px-2 py-0.5 shrink-0">
                              ⚠ GPS failed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── GPS error block ── */}
                      {gpsError && GPS_ERROR_COPY[gpsError] && (
                        <div className="border border-red-700/40 bg-red-900/10 px-4 py-4">
                          <p className="text-[11px] font-mono-gov text-red-300 font-bold mb-1">
                            ⚠️ {GPS_ERROR_COPY[gpsError].heading}
                          </p>
                          <p className="text-[10px] font-mono-gov text-red-200/70 leading-relaxed">
                            {GPS_ERROR_COPY[gpsError].body}
                          </p>
                          <p className="text-[10px] font-mono-gov text-red-400/60 mt-3">
                            Complaints cannot be submitted without a verified GPS location.
                          </p>
                        </div>
                      )}

                      {/* ── GPS success card ── */}
                      {gpsData && (
                        <div className={`border px-4 py-3 ${badge(gpsData.accuracy).border} ${badge(gpsData.accuracy).bg}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest mb-1">
                                Verified GPS Location
                              </p>
                              <p className={`text-[11px] font-mono-gov leading-relaxed ${badge(gpsData.accuracy).color}`}>
                                {gpsData.address ?? "Address lookup unavailable"}
                              </p>
                              <p className="text-[10px] font-mono-gov text-slate-600 mt-1 tabular-nums">
                                {gpsData.lat.toFixed(6)}, {gpsData.lon.toFixed(6)}
                                &nbsp;·&nbsp; ±{gpsData.accuracy}m
                              </p>
                            </div>
                            <div className={`shrink-0 text-[10px] font-mono-gov font-bold px-2 py-1 border ${badge(gpsData.accuracy).color} ${badge(gpsData.accuracy).border}`}>
                              {badge(gpsData.accuracy).label}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Retake link */}
                      <div className="flex justify-center">
                        <label
                          htmlFor="camera-input"
                          className="text-[10px] font-mono-gov text-amber-500 hover:text-amber-400 cursor-pointer transition underline underline-offset-2"
                        >
                          📸 Retake Photo
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────────── */}
              {/* SECTION 02 — AI-detected category                             */}
              {/* ────────────────────────────────────────────────────────────── */}
              <div className={`border border-white/10 bg-[#0a1628] transition-all duration-500 ${!file ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">02</span>
                  <span className="text-white font-bold text-sm">AI-Detected Category</span>
                  {imageAnalyzed && (
                    <span className="ml-auto text-[10px] font-mono-gov text-green-400">✦ Auto-detected</span>
                  )}
                </div>
                <div className="p-5">
                  <div className={`w-full px-4 py-3 border text-sm font-mono-gov flex items-center gap-3 ${category ? "bg-green-900/10 border-green-700/40" : "bg-[#060e1f] border-white/10"}`}>
                    {loadingAI ? (
                      <>
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="text-amber-400 font-bold">Detecting category…</span>
                      </>
                    ) : category ? (
                      <>
                        <span className="text-green-400">🏷️</span>
                        <span className="text-green-300 font-bold">{category}</span>
                      </>
                    ) : (
                      <span className="text-slate-600">Category will appear after photo is taken</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────────── */}
              {/* SECTION 03 — Issue details                                    */}
              {/* ────────────────────────────────────────────────────────────── */}
              <div className={`border border-white/10 bg-[#0a1628] transition-all duration-500 ${!imageAnalyzed ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">03</span>
                  <span className="text-white font-bold text-sm">Issue Details</span>
                </div>
                <div className="p-5 flex flex-col gap-5">
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Complaint Title <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Brief title describing the issue"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      required
                      className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov transition"
                    />
                    <p className="text-[10px] text-slate-600 font-mono-gov mt-1">{title.length}/100</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Detailed Description <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="When did it start? How severe is it? How does it affect residents?"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      maxLength={500}
                      required
                      className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov resize-none transition"
                    />
                    <p className="text-[10px] text-slate-600 font-mono-gov mt-1">{desc.length}/500</p>
                  </div>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────────── */}
              {/* SECTION 04 — Declaration                                      */}
              {/* ────────────────────────────────────────────────────────────── */}
              <div className="border border-white/10 bg-[#0a1628]">
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">04</span>
                  <span className="text-white font-bold text-sm">Citizen Declaration</span>
                </div>
                <div className="p-5">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => setAgreed(!agreed)}
                      className={`mt-0.5 w-4 h-4 shrink-0 border-2 transition flex items-center justify-center ${agreed ? "border-amber-500 bg-amber-600" : "border-slate-600 group-hover:border-amber-700"}`}
                    >
                      {agreed && <span className="text-white text-[10px] leading-none">✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono-gov leading-relaxed">
                      I hereby declare that the information provided is true and correct to the
                      best of my knowledge. I understand that filing a false complaint is an offence
                      and may result in legal action. I consent to my complaint, photo, and GPS
                      location being shared with the relevant municipal department for resolution.
                    </p>
                  </label>
                </div>
              </div>

              {/* ── Submit button ── */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-3.5 font-bold tracking-widest uppercase text-sm font-mono-gov transition ${
                  canSubmit
                    ? "bg-amber-600 hover:bg-amber-500 active:scale-[0.99]"
                    : "bg-slate-700 cursor-not-allowed text-slate-500"
                }`}
              >
                {loadingAI
                  ? "Processing image + GPS…"
                  : gpsError
                  ? "GPS failed — Retake Photo"
                  : !file
                  ? "Take a Photo to Continue"
                  : !gpsData
                  ? "GPS pending…"
                  : loadingSubmit
                  ? "Submitting…"
                  : "Submit Complaint →"}
              </button>

              <p className="text-[10px] text-slate-600 font-mono-gov text-center -mt-2">
                GPS coordinates are embedded in this report and plotted on the civic map.
                Server timestamp is applied on receipt — client time is not trusted.
              </p>
            </form>

            <div className="mt-8 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov">
              Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free)
              &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
            </div>
          </div>
        </div>

        <div className="tricolor-bar h-1 w-full shrink-0" />
      </div>

      {/* ── Submit overlay ── */}
      {loadingSubmit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-amber-400 font-mono-gov text-sm tracking-widest">Submitting Complaint…</p>
            <p className="text-slate-500 text-xs font-mono-gov">Uploading photo and GPS pin</p>
          </div>
        </div>
      )}
    </div>
  );
}