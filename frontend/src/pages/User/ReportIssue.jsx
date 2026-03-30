import { useState, useRef } from "react";
import UserSidebar from "../../components/UserSidebar";

// ── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
  .font-serif-display { font-family: 'Source Serif 4', Georgia, serif }
  .font-mono-gov      { font-family: 'JetBrains Mono', monospace }
  .tricolor-bar       { background: linear-gradient(to right, #FF9933 33.3%, white 33.3%, white 66.6%, #138808 66.6%) }
  .gov-grid           { background-image: linear-gradient(rgba(255,165,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,165,0,0.025) 1px, transparent 1px); background-size: 48px 48px }
  input, textarea, select { outline: none }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #060e1f inset !important; -webkit-text-fill-color: white !important }
`;

// ── Reverse geocode (Nominatim) ───────────────────────────────────────────────
// For production, replace with OpenCage (2500 free req/day, better India coverage):
//   https://opencagedata.com
//   const OPENCAGE_KEY = "YOUR_KEY";
//   const reverseGeocode = (lat, lon) =>
//     fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_KEY}&language=en&no_annotations=1`)
//     .then(r => r.json()).then(d => d.results[0]?.formatted ?? null);
const reverseGeocode = async (lat, lon) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const d = await res.json();
  return d?.display_name ?? null;
};

// ── Address autocomplete (Nominatim search, India-scoped) ────────────────────
const searchAddress = async (query) => {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&countrycodes=in`,
      { headers: { "Accept-Language": "en" } }
    );
    return await res.json();
  } catch {
    return [];
  }
};

// ── EXIF GPS Extractor ────────────────────────────────────────────────────────
const extractGPS = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const view = new DataView(ev.target.result);
      if (view.getUint16(0, false) !== 0xffd8) return resolve(null);

      let offset = 2;
      while (offset < view.byteLength) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xffe1) {
          const exifLength = view.getUint16(offset, false);
          const exifData = new DataView(ev.target.result, offset + 2, exifLength - 2);
          if (exifData.getUint32(0, false) !== 0x45786966) return resolve(null);

          const littleEndian = exifData.getUint16(6) === 0x4949;
          const ifdOffset = exifData.getUint32(10, littleEndian) + 6;
          const numEntries = exifData.getUint16(ifdOffset, littleEndian);

          let gpsIFDOffset = null;
          for (let i = 0; i < numEntries; i++) {
            const entryOffset = ifdOffset + 2 + i * 12;
            const tag = exifData.getUint16(entryOffset, littleEndian);
            if (tag === 0x8825) {
              gpsIFDOffset = exifData.getUint32(entryOffset + 8, littleEndian) + 6;
              break;
            }
          }
          if (gpsIFDOffset === null) return resolve(null);

          const gpsEntries = exifData.getUint16(gpsIFDOffset, littleEndian);
          const gps = {};
          for (let i = 0; i < gpsEntries; i++) {
            const entryOffset = gpsIFDOffset + 2 + i * 12;
            const tag  = exifData.getUint16(entryOffset, littleEndian);
            const type = exifData.getUint16(entryOffset + 2, littleEndian);
            const valOffset = exifData.getUint32(entryOffset + 8, littleEndian) + 6;
            const readRational = (off) =>
              exifData.getUint32(off, littleEndian) / exifData.getUint32(off + 4, littleEndian);
            if (type === 5) {
              gps[tag] = [readRational(valOffset), readRational(valOffset + 8), readRational(valOffset + 16)];
            } else if (type === 2) {
              gps[tag] = String.fromCharCode(exifData.getUint8(entryOffset + 8));
            }
          }
          if (!gps[2] || !gps[4]) return resolve(null);
          const dmsToDD = ([d, m, s]) => d + m / 60 + s / 3600;
          let lat = dmsToDD(gps[2]);
          let lon = dmsToDD(gps[4]);
          if (gps[1] === "S") lat = -lat;
          if (gps[3] === "W") lon = -lon;
          return resolve({ lat, lon });
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      resolve(null);
    };
    reader.readAsArrayBuffer(file);
  });

// ── Image Compressor ──────────────────────────────────────────────────────────
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
      const tryCompress = (quality) => {
        canvas.toBlob(
          (blob) => {
            if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.3) {
              tryCompress(quality - 0.1);
            } else {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            }
          },
          "image/jpeg",
          quality
        );
      };
      tryCompress(0.8);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReportIssue() {
  const [title, setTitle]                     = useState("");
  const [desc, setDesc]                       = useState("");
  const [location, setLocation]               = useState("");
  const [category, setCategory]               = useState("");
  const [file, setFile]                       = useState(null);
  const [filePreview, setFilePreview]         = useState(null);
  const [submitted, setSubmitted]             = useState(false);
  const [agreed, setAgreed]                   = useState(false);
  const [loadingAI, setLoadingAI]             = useState(false);
  const [loadingSubmit, setLoadingSubmit]     = useState(false);
  const [imageAnalyzed, setImageAnalyzed]     = useState(false);

  // Location state
  const [locationSource, setLocationSource]           = useState(null); // "exif" | "gps" | "manual" | null
  const [locationUnavailable, setLocationUnavailable] = useState(false);
  const [suggestions, setSuggestions]                 = useState([]);
  const [showSuggestions, setShowSuggestions]         = useState(false);
  const searchTimeout                                 = useRef(null);

  // ── 3-layer location resolution ────────────────────────────────────────────
  const resolveLocation = async (selectedFile) => {
    const gpsResult = await extractGPS(selectedFile);

    // Layer 1: EXIF GPS from image (most accurate — exact photo location)
    if (gpsResult) {
      const address = await reverseGeocode(gpsResult.lat, gpsResult.lon);
      if (address) {
        setLocation(address);
        setLocationSource("exif");
        return;
      }
    }

    // Layer 2: Device GPS (only if accuracy ≤ 200m)
    const deviceAddress = await new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          if (pos.coords.accuracy > 200) {
            console.warn(`Device GPS too imprecise: ±${Math.round(pos.coords.accuracy)}m — skipping`);
            return resolve(null);
          }
          const address = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          resolve(address ?? null);
        },
        () => resolve(null),
        { timeout: 8000, maximumAge: 0, enableHighAccuracy: true }
      );
    });

    if (deviceAddress) {
      setLocation(deviceAddress);
      setLocationSource("gps");
      return;
    }

    // Layer 3: Both failed — ask user to type manually
    setLocationUnavailable(true);
    setLocationSource("manual");
  };

  // ── File change & AI analysis ───────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLocationSource(null);
    setLocationUnavailable(false);
    setImageAnalyzed(false);
    setCategory("");
    setLocation("");
    setSuggestions([]);
    setFilePreview(URL.createObjectURL(selectedFile));

    try {
      setLoadingAI(true);

      const [, classifyData] = await Promise.all([
        resolveLocation(selectedFile),
        (async () => {
          const compressed = await compressImage(selectedFile);
          const fd = new FormData();
          fd.append("image", compressed);
          const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/classify`, {
            method: "POST", body: fd,
          });
          const text = await res.text();
          try { return JSON.parse(text); }
          catch { throw new Error("Invalid JSON from server"); }
        })(),
      ]);

      setCategory(classifyData.category);
      setImageAnalyzed(true);
    } catch (err) {
      console.error("Error:", err);
      alert("Image processing failed");
    } finally {
      setLoadingAI(false);
    }
  };

  // ── Autocomplete ────────────────────────────────────────────────────────────
  const handleLocationInput = (value) => {
    setLocation(value);
    setLocationSource("manual");
    setLocationUnavailable(false);
    clearTimeout(searchTimeout.current);
    if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    searchTimeout.current = setTimeout(async () => {
      const results = await searchAddress(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 400);
  };

  const handleSuggestionPick = (suggestion) => {
    setLocation(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    setLocationSource("manual");
    setLocationUnavailable(false);
  };

  // ── Manual GPS button ───────────────────────────────────────────────────────
  const handleManualGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported by your browser.");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (pos.coords.accuracy > 200) {
          return alert(`GPS signal too weak (±${Math.round(pos.coords.accuracy)}m). Move to open sky and try again.`);
        }
        const address = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (address) {
          setLocation(address);
          setLocationSource("gps");
          setLocationUnavailable(false);
        }
      },
      () => alert("GPS access denied. Please allow location permissions in your browser settings."),
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { alert("Please confirm the declaration before submitting."); return; }
    try {
      setLoadingSubmit(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", desc);
      formData.append("location", location);
      formData.append("category", category);
      if (file) formData.append("photo", file);
      const token    = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/complaint/create`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      const data = await response.json();
      if (data.success) setSubmitted(true);
      else alert(data.message);
    } catch (error) {
      console.error("ERROR:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle(""); setDesc(""); setLocation(""); setCategory("");
    setFile(null); setFilePreview(null); setSubmitted(false);
    setAgreed(false); setImageAnalyzed(false);
    setLocationSource(null); setLocationUnavailable(false);
    setSuggestions([]);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
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
                  Your grievance has been registered on the JanSahayak Portal. A unique complaint
                  ID has been assigned and the relevant department has been notified.
                </p>
                <div className="mt-6 border border-amber-700/30 bg-[#0a1628] px-5 py-4">
                  <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">
                    Complaint ID
                  </p>
                  <p className="text-xl font-black font-mono-gov text-amber-400 mt-1">
                    JS-2026-{Math.floor(1000 + Math.random() * 9000)}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
                    Save this for future reference
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 font-mono-gov mt-4">
                  An acknowledgement has been sent to your registered email. You will receive SMS
                  updates at every stage of resolution.
                </p>
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

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060e1f] text-white flex">
      <style>{STYLES}</style>
      <UserSidebar />

      <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
        <div className="tricolor-bar h-1 w-full shrink-0" />

        {/* Top bar */}
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

        <div className="flex-1 gov-grid p-6 overflow-auto">
          <div className="max-w-4xl">

            {/* Info notice */}
            <div className="border border-amber-700/30 bg-amber-900/10 text-amber-200/80 text-[11px] font-mono-gov px-4 py-3 mb-6 leading-relaxed">
              ℹ️ All fields marked <span className="text-amber-500">*</span> are mandatory.
              Start by uploading a photo — category and location will be detected automatically.
              Complaints with photographic evidence are prioritised and resolved faster.
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* ── SECTION 01: Upload Evidence ── */}
              <div className="border border-white/10 bg-[#0a1628]">
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">01</span>
                  <span className="text-white font-bold text-sm">Upload Evidence</span>
                  <span className="ml-auto text-[10px] font-mono-gov text-slate-500">
                    Category &amp; location detected automatically from your photo
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="relative">
                    <label
                      htmlFor="evidence-upload"
                      className={`flex flex-col items-center justify-center border border-dashed transition cursor-pointer gap-2 ${
                        loadingAI
                          ? "border-amber-600/50 bg-amber-900/10"
                          : file
                          ? "border-green-600/40 bg-[#060e1f] hover:border-green-500/60"
                          : "border-amber-700/30 bg-[#060e1f] hover:border-amber-600/60 hover:bg-amber-600/5"
                      } ${filePreview ? "py-0 overflow-hidden" : "py-10"}`}
                    >
                      {filePreview && !loadingAI ? (
                        <div className="relative w-full">
                          <img
                            src={filePreview}
                            alt="Evidence preview"
                            className="w-full max-h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <span className="text-xs font-mono-gov text-white/90 truncate max-w-[70%]">
                              {file.name}
                            </span>
                            <span className="text-[10px] font-mono-gov text-green-400 border border-green-600/40 bg-green-900/30 px-2 py-0.5">
                              ✓ Uploaded
                            </span>
                          </div>
                        </div>
                      ) : loadingAI ? (
                        <div className="py-10 flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-amber-400 font-mono-gov">Analysing image with AI…</p>
                          <p className="text-[10px] text-slate-500 font-mono-gov">
                            Detecting category and extracting location
                          </p>
                        </div>
                      ) : (
                        <>
                          <span className="text-4xl">📷</span>
                          <span className="text-sm font-mono-gov text-slate-300 font-bold">
                            Click to upload photograph
                          </span>
                          <span className="text-[10px] font-mono-gov text-slate-500">
                            JPG, PNG up to 5MB — AI will auto-detect category &amp; location
                          </span>
                          <div className="flex items-center gap-4 mt-2">
                            {["🏷️ Category", "📍 Location"].map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-mono-gov text-amber-500/70 border border-amber-700/30 px-2 py-1"
                              >
                                {tag} auto-filled
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </label>
                    <input
                      id="evidence-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={loadingAI}
                      onChange={handleFileChange}
                    />
                  </div>

                  {file && !loadingAI && (
                    <label
                      htmlFor="evidence-upload"
                      className="text-center text-[10px] font-mono-gov text-slate-500 hover:text-amber-400 cursor-pointer transition underline underline-offset-2"
                    >
                      ↺ Change photo
                    </label>
                  )}
                </div>
              </div>

              {/* ── SECTION 02: Detected Details ── */}
              <div
                className={`border border-white/10 bg-[#0a1628] transition-all duration-500 ${
                  !file ? "opacity-40 pointer-events-none" : "opacity-100"
                }`}
              >
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">02</span>
                  <span className="text-white font-bold text-sm">Detected Details</span>
                  {imageAnalyzed && (
                    <span className="ml-auto text-[10px] font-mono-gov text-green-400 flex items-center gap-1">
                      <span>✦</span> Auto-filled from image
                    </span>
                  )}
                  {!file && (
                    <span className="ml-auto text-[10px] font-mono-gov text-slate-600">
                      Upload an image first
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col gap-5">

                  {/* AI-detected Category */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Issue Category <span className="text-amber-500">*</span>
                      {imageAnalyzed && (
                        <span className="ml-2 text-green-500 normal-case">— AI detected</span>
                      )}
                    </label>
                    <div
                      className={`w-full px-4 py-3 border text-sm font-mono-gov flex items-center gap-3 transition ${
                        category
                          ? "bg-green-900/10 border-green-700/40"
                          : "bg-[#060e1f] border-white/10"
                      }`}
                    >
                      {loadingAI ? (
                        <>
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-amber-400 font-bold">Detecting category…</span>
                        </>
                      ) : category ? (
                        <>
                          <span className="text-green-400 text-base">🏷️</span>
                          <span className="text-green-300 font-bold">{category}</span>
                        </>
                      ) : (
                        <span className="text-slate-600">Category will appear here after upload</span>
                      )}
                    </div>
                  </div>

                  {/* Location field */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Location / Address <span className="text-amber-500">*</span>
                      {locationSource === "exif" && (
                        <span className="ml-2 text-green-500 normal-case">
                          — from image GPS metadata
                        </span>
                      )}
                      {locationSource === "gps" && (
                        <span className="ml-2 text-blue-400 normal-case">
                          — from device GPS
                        </span>
                      )}
                    </label>

                    {loadingAI ? (
                      <div className="w-full px-4 py-3 bg-[#060e1f] border border-amber-600/40 flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="text-amber-400 text-sm font-mono-gov">
                          Detecting location from image…
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Start typing an address, landmark, or area…"
                            value={location}
                            onChange={(e) => handleLocationInput(e.target.value)}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            required
                            className={`flex-1 px-4 py-3 bg-[#060e1f] border text-white placeholder-slate-600 text-sm font-mono-gov transition ${
                              locationSource === "exif"
                                ? "border-green-600/70 focus:border-green-500"
                                : locationSource === "gps"
                                ? "border-blue-600/70 focus:border-blue-500"
                                : locationUnavailable
                                ? "border-amber-600/60 focus:border-amber-500"
                                : "border-white/10 focus:border-amber-600/60"
                            }`}
                          />
                          {/* Manual GPS override button */}
                          <button
                            type="button"
                            title="Use current device GPS"
                            onClick={handleManualGPS}
                            className="px-4 py-3 border border-amber-700/40 text-amber-400 hover:bg-amber-600/10 transition text-[10px] font-mono-gov uppercase tracking-wide whitespace-nowrap"
                          >
                            📍 GPS
                          </button>
                        </div>

                        {/* Autocomplete dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-12 bg-[#0a1628] border border-white/10 shadow-2xl mt-0.5 max-h-64 overflow-y-auto">
                            {suggestions.map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={() => handleSuggestionPick(s)}
                                className="w-full px-4 py-2.5 text-left text-[11px] font-mono-gov text-slate-300 hover:bg-amber-600/10 hover:text-amber-300 border-b border-white/5 last:border-0 transition"
                              >
                                <span className="text-amber-500/60 mr-2">📍</span>
                                <span className="line-clamp-1">{s.display_name}</span>
                              </button>
                            ))}
                            <p className="px-4 py-1.5 text-[9px] text-slate-600 font-mono-gov border-t border-white/5">
                              Powered by OpenStreetMap Nominatim
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status notes */}
                    {!loadingAI && (
                      <div className="mt-2">
                        {locationSource === "exif" && (
                          <p className="text-[10px] text-green-400 font-mono-gov flex items-center gap-1.5">
                            <span>✦</span>
                            Street-level address extracted from image GPS metadata — highly accurate
                          </p>
                        )}
                        {locationSource === "gps" && (
                          <p className="text-[10px] text-blue-400 font-mono-gov flex items-center gap-1.5">
                            <span>✦</span>
                            Address detected from your device GPS — verify it looks correct before submitting
                          </p>
                        )}
                        {locationUnavailable && (
                          <div className="border border-amber-700/40 bg-amber-900/10 px-3 py-2.5 mt-1">
                            <p className="text-[11px] text-amber-300 font-mono-gov font-bold mb-1">
                              ⚠️ Automatic location unavailable
                            </p>
                            <p className="text-[10px] text-amber-200/70 font-mono-gov leading-relaxed">
                              We could not detect your location automatically — the photo has no GPS
                              metadata and your device GPS is either unavailable or too imprecise.
                              Please type the full address, locality, or landmark name in the field
                              above. Autocomplete suggestions will appear as you type. A precise
                              address helps the authorities locate and resolve the issue faster.
                            </p>
                            <p className="text-[10px] text-amber-500/60 font-mono-gov mt-1.5">
                              Tip: You can also tap the 📍 GPS button to try again in open sky.
                            </p>
                          </div>
                        )}
                        {!locationSource && !locationUnavailable && (
                          <p className="text-[10px] text-slate-600 font-mono-gov">
                            Upload an image above — location will be detected automatically.
                            Or type an address to search with autocomplete.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION 03: Issue Details ── */}
              <div
                className={`border border-white/10 bg-[#0a1628] transition-all duration-500 ${
                  !imageAnalyzed && !loadingAI && !file
                    ? "opacity-40 pointer-events-none"
                    : "opacity-100"
                }`}
              >
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
                    <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
                      {title.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Detailed Description <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe the issue in detail — when it started, how severe it is, and any impact on residents…"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      maxLength={500}
                      required
                      className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov resize-none transition"
                    />
                    <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
                      {desc.length}/500 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* ── SECTION 04: Declaration ── */}
              <div className="border border-white/10 bg-[#0a1628]">
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">04</span>
                  <span className="text-white font-bold text-sm">Citizen Declaration</span>
                </div>
                <div className="p-5">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => setAgreed(!agreed)}
                      className={`mt-0.5 w-4 h-4 shrink-0 border-2 transition flex items-center justify-center ${
                        agreed
                          ? "border-amber-500 bg-amber-600"
                          : "border-slate-600 group-hover:border-amber-700"
                      }`}
                    >
                      {agreed && <span className="text-white text-[10px] leading-none">✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono-gov leading-relaxed">
                      I hereby declare that the information provided above is true and correct to the
                      best of my knowledge. I understand that filing a false complaint is an offence
                      and may result in legal action under applicable law. I consent to my complaint
                      being shared with the relevant municipal department for resolution.
                    </p>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loadingAI || loadingSubmit || !file}
                className={`w-full py-3.5 font-bold tracking-widest uppercase text-sm font-mono-gov transition ${
                  loadingAI || !file
                    ? "bg-slate-700 cursor-not-allowed text-slate-500"
                    : "bg-amber-600 hover:bg-amber-500 active:scale-[0.99]"
                }`}
              >
                {loadingAI
                  ? "Processing Image…"
                  : !file
                  ? "Upload an Image to Continue"
                  : loadingSubmit
                  ? "Submitting…"
                  : "Submit Complaint →"}
              </button>

              <p className="text-[10px] text-slate-600 font-mono-gov text-center -mt-2">
                You will receive an acknowledgement with a unique Complaint ID on your registered
                email &amp; mobile.
              </p>
            </form>

            {/* Footer */}
            <div className="mt-8 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov">
              Need help? Call{" "}
              <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free)
              &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
            </div>
          </div>
        </div>

        <div className="tricolor-bar h-1 w-full shrink-0" />
      </div>

      {/* Submit loader overlay */}
      {loadingSubmit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-amber-400 font-mono-gov text-sm tracking-widest">
              Submitting Complaint…
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