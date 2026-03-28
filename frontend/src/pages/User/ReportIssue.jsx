// import { useState, useEffect, useRef } from "react";
// import UserSidebar from "../../components/UserSidebar";

// // ── MapModal ────────────────────────────────────────────────────────────────
// function MapModal({ onConfirm, onClose }) {
//   const mapRef = useRef(null);
//   const leafletMap = useRef(null);
//   const markerRef = useRef(null);
//   const [coords, setCoords] = useState(null);
//   const [address, setAddress] = useState("");
//   const [locating, setLocating] = useState(true);
//   const [reverseLoading, setReverseLoading] = useState(false);

//   // Reverse-geocode with Nominatim (free, no key)
//   const reverseGeocode = async (lat, lng) => {
//     setReverseLoading(true);
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
//       );
//       const data = await res.json();
//       setAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
//     } catch {
//       setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
//     } finally {
//       setReverseLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Dynamically load Leaflet CSS + JS
//     const loadLeaflet = () =>
//       new Promise((resolve) => {
//         if (window.L) return resolve();
//         const link = document.createElement("link");
//         link.rel = "stylesheet";
//         link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
//         document.head.appendChild(link);

//         const script = document.createElement("script");
//         script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
//         script.onload = resolve;
//         document.head.appendChild(script);
//       });

//     loadLeaflet().then(() => {
//       const L = window.L;
//       if (leafletMap.current) return; // already initialized

//       // Default to India center
//       leafletMap.current = L.map(mapRef.current, { zoomControl: false }).setView(
//         [20.5937, 78.9629],
//         5
//       );

//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//         attribution: "© OpenStreetMap contributors",
//       }).addTo(leafletMap.current);

//       // Custom amber pin icon
//       const pinIcon = L.divIcon({
//         className: "",
//         html: `<div style="
//           width:32px;height:40px;position:relative;
//           filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5))
//         ">
//           <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
//             <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="#d97706"/>
//             <circle cx="16" cy="16" r="7" fill="#fff" opacity="0.9"/>
//           </svg>
//         </div>`,
//         iconSize: [32, 40],
//         iconAnchor: [16, 40],
//       });

//       // Add zoom controls styled
//       L.control.zoom({ position: "bottomright" }).addTo(leafletMap.current);

//       const placeMarker = (lat, lng) => {
//         if (markerRef.current) markerRef.current.remove();
//         markerRef.current = L.marker([lat, lng], {
//           icon: pinIcon,
//           draggable: true,
//         }).addTo(leafletMap.current);

//         markerRef.current.on("dragend", (e) => {
//           const { lat, lng } = e.target.getLatLng();
//           setCoords({ lat, lng });
//           reverseGeocode(lat, lng);
//         });

//         setCoords({ lat, lng });
//         reverseGeocode(lat, lng);
//       };

//       // Click to place pin
//       leafletMap.current.on("click", (e) => {
//         placeMarker(e.latlng.lat, e.latlng.lng);
//       });

//       // Try GPS
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => {
//             const { latitude, longitude } = pos.coords;
//             leafletMap.current.setView([latitude, longitude], 16);
//             placeMarker(latitude, longitude);
//             setLocating(false);
//           },
//           () => {
//             setLocating(false);
//           },
//           { timeout: 8000 }
//         );
//       } else {
//         setLocating(false);
//       }
//     });

//     return () => {
//       if (leafletMap.current) {
//         leafletMap.current.remove();
//         leafletMap.current = null;
//         markerRef.current = null;
//       }
//     };
//   }, []);

//   return (
//     <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
//       <div
//         className="w-full max-w-2xl flex flex-col"
//         style={{
//           fontFamily: "'JetBrains Mono', monospace",
//           background: "#0a1628",
//           border: "1px solid rgba(180,120,0,0.3)",
//         }}
//       >
//         {/* Header */}
//         <div
//           style={{
//             borderBottom: "1px solid rgba(255,255,255,0.08)",
//             padding: "12px 20px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <div>
//             <p style={{ color: "#f59e0b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>
//               📍 Pin Your Location
//             </p>
//             <p style={{ color: "#64748b", fontSize: 10, margin: "2px 0 0" }}>
//               Tap the map or drag the pin to set exact location
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             style={{
//               background: "transparent",
//               border: "1px solid rgba(255,255,255,0.1)",
//               color: "#94a3b8",
//               cursor: "pointer",
//               padding: "4px 10px",
//               fontSize: 12,
//             }}
//           >
//             ✕ Close
//           </button>
//         </div>

//         {/* Map */}
//         <div style={{ position: "relative" }}>
//           <div ref={mapRef} style={{ height: 380, width: "100%" }} />

//           {/* GPS locating overlay */}
//           {locating && (
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 background: "rgba(6,14,31,0.85)",
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: 12,
//                 zIndex: 1000,
//               }}
//             >
//               <div
//                 style={{
//                   width: 36,
//                   height: 36,
//                   border: "3px solid #f59e0b",
//                   borderTopColor: "transparent",
//                   borderRadius: "50%",
//                   animation: "spin 0.8s linear infinite",
//                 }}
//               />
//               <p style={{ color: "#f59e0b", fontSize: 11, margin: 0 }}>Detecting your location…</p>
//               <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//             </div>
//           )}

//           {/* Hint */}
//           {!locating && !coords && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: 12,
//                 left: "50%",
//                 transform: "translateX(-50%)",
//                 background: "rgba(6,14,31,0.9)",
//                 border: "1px solid rgba(245,158,11,0.3)",
//                 color: "#f59e0b",
//                 fontSize: 10,
//                 padding: "6px 14px",
//                 zIndex: 999,
//                 whiteSpace: "nowrap",
//                 letterSpacing: "0.08em",
//               }}
//             >
//               Tap anywhere on the map to drop a pin
//             </div>
//           )}
//         </div>

//         {/* Address bar */}
//         <div
//           style={{
//             borderTop: "1px solid rgba(255,255,255,0.08)",
//             padding: "12px 20px",
//             minHeight: 64,
//             display: "flex",
//             alignItems: "center",
//             gap: 12,
//           }}
//         >
//           {reverseLoading ? (
//             <>
//               <div
//                 style={{
//                   width: 14,
//                   height: 14,
//                   border: "2px solid #f59e0b",
//                   borderTopColor: "transparent",
//                   borderRadius: "50%",
//                   animation: "spin 0.8s linear infinite",
//                   flexShrink: 0,
//                 }}
//               />
//               <span style={{ color: "#f59e0b", fontSize: 11 }}>Fetching address…</span>
//             </>
//           ) : coords ? (
//             <div style={{ flex: 1, minWidth: 0 }}>
//               <p style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>
//                 Selected Address
//               </p>
//               <p style={{ color: "#e2e8f0", fontSize: 11, margin: 0, lineHeight: 1.5, wordBreak: "break-word" }}>
//                 {address}
//               </p>
//               <p style={{ color: "#475569", fontSize: 9, margin: "4px 0 0" }}>
//                 {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
//               </p>
//             </div>
//           ) : (
//             <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>No location selected</p>
//           )}
//         </div>

//         {/* Footer actions */}
//         <div
//           style={{
//             borderTop: "1px solid rgba(255,255,255,0.08)",
//             padding: "12px 20px",
//             display: "flex",
//             gap: 10,
//           }}
//         >
//           <button
//             onClick={onClose}
//             style={{
//               flex: 1,
//               padding: "10px",
//               background: "transparent",
//               border: "1px solid rgba(255,255,255,0.1)",
//               color: "#94a3b8",
//               cursor: "pointer",
//               fontSize: 11,
//               textTransform: "uppercase",
//               letterSpacing: "0.1em",
//               fontFamily: "inherit",
//             }}
//           >
//             Cancel
//           </button>
//           <button
//             disabled={!coords}
//             onClick={() => coords && onConfirm({ coords, address })}
//             style={{
//               flex: 2,
//               padding: "10px",
//               background: coords ? "#d97706" : "#1e293b",
//               border: "none",
//               color: coords ? "#fff" : "#475569",
//               cursor: coords ? "pointer" : "not-allowed",
//               fontSize: 11,
//               fontWeight: "bold",
//               textTransform: "uppercase",
//               letterSpacing: "0.12em",
//               fontFamily: "inherit",
//               transition: "background 0.2s",
//             }}
//           >
//             ✓ Confirm This Location
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main Page ────────────────────────────────────────────────────────────────
// export default function ReportIssue() {
//   const [title, setTitle] = useState("");
//   const [desc, setDesc] = useState("");
//   const [location, setLocation] = useState("");
//   const [pinnedCoords, setPinnedCoords] = useState(null);
//   const [category, setCategory] = useState("");
//   const [priority, setPriority] = useState("");
//   const [file, setFile] = useState(null);
//   const [submitted, setSubmitted] = useState(false);
//   const [agreed, setAgreed] = useState(false);
//   const [loadingAI, setLoadingAI] = useState(false);
//   const [loadingSubmit, setLoadingSubmit] = useState(false);
//   const [showMap, setShowMap] = useState(false);

//   const handleLocationConfirm = ({ coords, address }) => {
//     setPinnedCoords(coords);
//     setLocation(address);
//     setShowMap(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!agreed) {
//       alert("Please confirm the declaration before submitting.");
//       return;
//     }

//     try {
//       setLoadingSubmit(true);

//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", desc);
//       formData.append("location", location);
//       formData.append("category", category);
//       if (pinnedCoords) {
//         formData.append("latitude", pinnedCoords.lat);
//         formData.append("longitude", pinnedCoords.lng);
//       }
//       if (file) formData.append("photo", file);

//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/v1/complaint/create`,
//         { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
//       );
//       const data = await response.json();
//       if (data.success) setSubmitted(true);
//       else alert(data.message);
//     } catch (error) {
//       console.log("ERROR:", error);
//       alert("Submission failed");
//     } finally {
//       setLoadingSubmit(false);
//     }
//   };

//   if (submitted) {
//     return (
//       <div className="min-h-screen bg-[#060e1f] text-white flex">
//         <style>{`
//           @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
//           .font-serif-display{font-family:'Source Serif 4',Georgia,serif}
//           .font-mono-gov{font-family:'JetBrains Mono',monospace}
//           .tricolor-bar{background:linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)}
//           .gov-grid{background-image:linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px);background-size:48px 48px}
//         `}</style>
//         <UserSidebar />
//         <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
//           <div className="tricolor-bar h-1 w-full shrink-0" />
//           <div className="flex-1 gov-grid flex items-center justify-center px-6">
//             <div className="max-w-md w-full text-center">
//               <div className="text-5xl mb-4">✅</div>
//               <div className="border border-green-700/40 bg-green-900/10 p-8">
//                 <p className="text-[10px] font-mono-gov text-green-400 uppercase tracking-widest mb-2">Complaint Registered</p>
//                 <h2 className="text-2xl font-black font-serif-display text-white">Submission Successful</h2>
//                 <p className="text-slate-400 text-sm mt-3 leading-relaxed">
//                   Your grievance has been registered on the JanSahayak Portal. A unique complaint ID has been assigned and the relevant department has been notified.
//                 </p>
//                 {pinnedCoords && (
//                   <div className="mt-4 border border-blue-700/30 bg-[#0a1628] px-4 py-3 text-left">
//                     <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">Pinned Location</p>
//                     <p className="text-[10px] text-slate-400 font-mono-gov mt-1 leading-relaxed">{location}</p>
//                     <p className="text-[9px] text-slate-600 font-mono-gov mt-1">
//                       {pinnedCoords.lat.toFixed(6)}, {pinnedCoords.lng.toFixed(6)}
//                     </p>
//                   </div>
//                 )}
//                 <div className="mt-4 border border-amber-700/30 bg-[#0a1628] px-5 py-4">
//                   <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">Complaint ID</p>
//                   <p className="text-xl font-black font-mono-gov text-amber-400 mt-1">JS-2026-{Math.floor(1000 + Math.random() * 9000)}</p>
//                   <p className="text-[10px] text-slate-600 font-mono-gov mt-1">Save this for future reference</p>
//                 </div>
//                 <p className="text-[10px] text-slate-500 font-mono-gov mt-4">
//                   An acknowledgement has been sent to your registered email. You will receive SMS updates at every stage of resolution.
//                 </p>
//                 <button
//                   onClick={() => { setSubmitted(false); setPinnedCoords(null); setLocation(""); }}
//                   className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 transition font-bold tracking-widest uppercase text-sm font-mono-gov"
//                 >
//                   File Another Complaint
//                 </button>
//               </div>
//             </div>
//           </div>
//           <div className="tricolor-bar h-1 w-full shrink-0" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#060e1f] text-white flex">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
//         .font-serif-display{font-family:'Source Serif 4',Georgia,serif}
//         .font-mono-gov{font-family:'JetBrains Mono',monospace}
//         .tricolor-bar{background:linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)}
//         .gov-grid{background-image:linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px);background-size:48px 48px}
//         input,textarea,select{outline:none}
//         input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #060e1f inset!important;-webkit-text-fill-color:white!important}
//       `}</style>

//       <UserSidebar />

//       <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
//         <div className="tricolor-bar h-1 w-full shrink-0" />

//         {/* Top bar */}
//         <div className="bg-[#0a1628] border-b border-amber-700/30 px-6 py-3 flex items-center justify-between shrink-0">
//           <div>
//             <h1 className="text-base font-black font-serif-display text-white leading-tight">File a Complaint</h1>
//             <p className="text-[10px] text-slate-500 font-mono-gov">JanSahayak Portal &nbsp;|&nbsp; शिकायत दर्ज करें</p>
//           </div>
//           <div className="border border-amber-700/40 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-3 py-1">
//             📋 New Grievance
//           </div>
//         </div>

//         <div className="flex-1 gov-grid p-6 overflow-auto">
//           <div className="max-w-4xl">

//             {/* Info notice */}
//             <div className="border border-amber-700/30 bg-amber-900/10 text-amber-200/80 text-[11px] font-mono-gov px-4 py-3 mb-6 leading-relaxed">
//               ℹ️ All fields marked <span className="text-amber-500">*</span> are mandatory. Complaints with photographic evidence are prioritised and resolved faster. False or misleading complaints may result in account suspension.
//             </div>

//             {/* Steps indicator */}
//             <div className="flex items-center gap-2 mb-6 text-[10px] font-mono-gov">
//               {["Issue Details", "Location & Evidence", "Declaration"].map((step, i) => (
//                 <div key={step} className="flex items-center gap-2">
//                   <div className={`flex items-center gap-1.5 px-3 py-1.5 border ${i === 0 ? "border-amber-600 bg-amber-600/20 text-amber-400" : "border-white/10 text-slate-600"}`}>
//                     <span>{i + 1}.</span> {step}
//                   </div>
//                   {i < 2 && <div className="text-slate-700">›</div>}
//                 </div>
//               ))}
//             </div>

//             <form onSubmit={handleSubmit} className="flex flex-col gap-6">

//               {/* ── SECTION 1: Issue Details ── */}
//               <div className="border border-white/10 bg-[#0a1628]">
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">01</span>
//                   <span className="text-white font-bold text-sm">Issue Details</span>
//                 </div>
//                 <div className="p-5 flex flex-col gap-5">
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Complaint Title <span className="text-amber-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Brief title describing the issue"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       required
//                       className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov transition"
//                     />
//                     <p className="text-[10px] text-slate-600 font-mono-gov mt-1">{title.length}/100 characters</p>
//                   </div>

//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Detailed Description <span className="text-amber-500">*</span>
//                     </label>
//                     <textarea
//                       rows={4}
//                       placeholder="Describe the issue in detail — when it started, how severe it is, and any impact on residents..."
//                       value={desc}
//                       onChange={(e) => setDesc(e.target.value)}
//                       required
//                       className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov resize-none transition"
//                     />
//                     <p className="text-[10px] text-slate-600 font-mono-gov mt-1">{desc.length}/500 characters</p>
//                   </div>

//                   <div className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 text-sm font-mono-gov flex items-center gap-3">
//                     {loadingAI ? (
//                       <>
//                         <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
//                         <span className="text-amber-400 font-bold">Analyzing image...</span>
//                       </>
//                     ) : (
//                       <span className={`font-bold transition-all duration-300 ${category ? "text-green-400 opacity-100" : "text-slate-500 opacity-70"}`}>
//                         {category || "Upload image to detect category"}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── SECTION 2: Location & Evidence ── */}
//               <div className="border border-white/10 bg-[#0a1628]">
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">02</span>
//                   <span className="text-white font-bold text-sm">Location & Evidence</span>
//                 </div>
//                 <div className="p-5 flex flex-col gap-5">

//                   {/* Location input row */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Location / Address <span className="text-amber-500">*</span>
//                     </label>
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         placeholder="Street, Sector, Landmark, City"
//                         value={location}
//                         onChange={(e) => { setLocation(e.target.value); setPinnedCoords(null); }}
//                         required
//                         className="flex-1 px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov transition"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowMap(true)}
//                         className="px-4 py-3 border border-amber-700/40 text-amber-400 hover:bg-amber-600/10 transition text-[10px] font-mono-gov uppercase tracking-wide whitespace-nowrap"
//                       >
//                         📍 Pin on Map
//                       </button>
//                     </div>

//                     {/* Pinned confirmation badge */}
//                     {pinnedCoords && (
//                       <div className="mt-2 flex items-start gap-2 border border-green-700/30 bg-green-900/10 px-3 py-2">
//                         <span className="text-green-400 text-xs mt-0.5">✓</span>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-[10px] font-mono-gov text-green-400 uppercase tracking-widest">Location Pinned on Map</p>
//                           <p className="text-[10px] text-slate-400 font-mono-gov mt-0.5 leading-relaxed line-clamp-2">{location}</p>
//                           <div className="flex items-center gap-3 mt-1">
//                             <p className="text-[9px] text-slate-600 font-mono-gov">
//                               {pinnedCoords.lat.toFixed(6)}, {pinnedCoords.lng.toFixed(6)}
//                             </p>
//                             <button
//                               type="button"
//                               onClick={() => setShowMap(true)}
//                               className="text-[9px] text-amber-500 hover:text-amber-400 font-mono-gov underline underline-offset-2"
//                             >
//                               Edit pin
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => { setPinnedCoords(null); setLocation(""); }}
//                               className="text-[9px] text-slate-500 hover:text-red-400 font-mono-gov underline underline-offset-2"
//                             >
//                               Remove
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {!pinnedCoords && (
//                       <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
//                         Type an address or click <span className="text-amber-500">Pin on Map</span> to mark the exact location.
//                       </p>
//                     )}
//                   </div>

//                   {/* File upload */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Upload Photograph / Evidence
//                     </label>
//                     <div className="relative">
//                       <label
//                         htmlFor="evidence-upload"
//                         className="flex flex-col items-center justify-center border border-dashed border-amber-700/30 bg-[#060e1f] hover:border-amber-600/60 hover:bg-amber-600/5 transition cursor-pointer py-8 gap-2"
//                       >
//                         <span className="text-2xl">{file ? "📎" : "📷"}</span>
//                         <span className="text-xs font-mono-gov text-slate-400">
//                           {file ? file.name : "Click to upload image or drag & drop"}
//                         </span>
//                         <span className="text-[10px] font-mono-gov text-slate-600">
//                           JPG, PNG up to 5MB — Strongly recommended
//                         </span>
//                       </label>
//                       {loadingAI && (
//                         <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded">
//                           <div className="flex flex-col items-center gap-3">
//                             <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
//                             <p className="text-xs text-amber-400 font-mono-gov">AI is analyzing image...</p>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                     <input
//                       id="evidence-upload"
//                       disabled={loadingAI}
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={async (e) => {
//                         const selectedFile = e.target.files[0];
//                         setFile(selectedFile);
//                         if (!selectedFile) return;
//                         try {
//                           setLoadingAI(true);
//                           const formData = new FormData();
//                           formData.append("image", selectedFile);
//                           const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/classify`, {
//                             method: "POST",
//                             body: formData,
//                           });
//                           const text = await res.text();
//                           let data;
//                           try { data = JSON.parse(text); }
//                           catch (err) { throw new Error("Invalid JSON from server"); }
//                           setCategory(data.category);
//                         } catch (err) {
//                           console.error("ML Error:", err);
//                           alert("AI analysis failed");
//                         } finally {
//                           setLoadingAI(false);
//                         }
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* ── SECTION 3: Declaration ── */}
//               <div className="border border-white/10 bg-[#0a1628]">
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">03</span>
//                   <span className="text-white font-bold text-sm">Citizen Declaration</span>
//                 </div>
//                 <div className="p-5">
//                   <label className="flex items-start gap-3 cursor-pointer group">
//                     <div
//                       onClick={() => setAgreed(!agreed)}
//                       className={`mt-0.5 w-4 h-4 shrink-0 border-2 transition flex items-center justify-center ${agreed ? "border-amber-500 bg-amber-600" : "border-slate-600 group-hover:border-amber-700"}`}
//                     >
//                       {agreed && <span className="text-white text-[10px] leading-none">✓</span>}
//                     </div>
//                     <p className="text-[11px] text-slate-400 font-mono-gov leading-relaxed">
//                       I hereby declare that the information provided above is true and correct to the best of my knowledge. I understand that filing a false complaint is an offence and may result in legal action under applicable law. I consent to my complaint being shared with the relevant municipal department for resolution.
//                     </p>
//                   </label>
//                 </div>
//               </div>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={loadingAI || loadingSubmit}
//                 className={`w-full py-3.5 font-bold tracking-widest uppercase text-sm font-mono-gov transition ${
//                   loadingAI ? "bg-slate-700 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-500 active:scale-[0.99]"
//                 }`}
//               >
//                 {loadingSubmit ? "Submitting..." : loadingAI ? "Processing Image..." : "Submit Complaint →"}
//               </button>

//               <p className="text-[10px] text-slate-600 font-mono-gov text-center -mt-2">
//                 You will receive an acknowledgement with a unique Complaint ID on your registered email & mobile.
//               </p>
//             </form>

//             <div className="mt-8 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov">
//               Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free) &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
//             </div>
//           </div>
//         </div>
//         <div className="tricolor-bar h-1 w-full shrink-0" />
//       </div>

//       {/* Map Modal */}
//       {showMap && (
//         <MapModal
//           onConfirm={handleLocationConfirm}
//           onClose={() => setShowMap(false)}
//         />
//       )}

//       {/* Submit loader overlay */}
//       {loadingSubmit && (
//         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
//           <div className="flex flex-col items-center gap-4">
//             <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-amber-400 font-mono-gov text-sm tracking-widest">Submitting Complaint...</p>
//             <p className="text-slate-500 text-xs font-mono-gov">Please wait while we register your grievance</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import { useState } from "react";
// import UserSidebar from "../../components/UserSidebar";

// export default function ReportIssue() {
//   const [title, setTitle] = useState("");
//   const [desc, setDesc] = useState("");
//   const [location, setLocation] = useState("");
//   const [category, setCategory] = useState("");
//   const [priority, setPriority] = useState("");
//   const [file, setFile] = useState(null);
//   const [submitted, setSubmitted] = useState(false);
//   const [agreed, setAgreed] = useState(false);
//   const [loadingAI, setLoadingAI] = useState(false);
//   const [loadingSubmit, setLoadingSubmit] = useState(false);
//   const [locationAutoFilled, setLocationAutoFilled] = useState(false);

//   // ── EXIF GPS Extractor (no library needed) ───────────────────────────────
//   const extractGPS = (file) =>
//     new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = (ev) => {
//         const view = new DataView(ev.target.result);

//         if (view.getUint16(0, false) !== 0xffd8) return resolve(null); // Must be JPEG

//         let offset = 2;
//         while (offset < view.byteLength) {
//           const marker = view.getUint16(offset, false);
//           offset += 2;

//           if (marker === 0xffe1) {
//             const exifLength = view.getUint16(offset, false);
//             const exifData = new DataView(ev.target.result, offset + 2, exifLength - 2);

//             if (exifData.getUint32(0, false) !== 0x45786966) return resolve(null); // "Exif"

//             const littleEndian = exifData.getUint16(6) === 0x4949;
//             const ifdOffset = exifData.getUint32(10, littleEndian) + 6;
//             const numEntries = exifData.getUint16(ifdOffset, littleEndian);

//             let gpsIFDOffset = null;
//             for (let i = 0; i < numEntries; i++) {
//               const entryOffset = ifdOffset + 2 + i * 12;
//               const tag = exifData.getUint16(entryOffset, littleEndian);
//               if (tag === 0x8825) {
//                 gpsIFDOffset = exifData.getUint32(entryOffset + 8, littleEndian) + 6;
//                 break;
//               }
//             }

//             if (gpsIFDOffset === null) return resolve(null);

//             const gpsEntries = exifData.getUint16(gpsIFDOffset, littleEndian);
//             const gps = {};

//             for (let i = 0; i < gpsEntries; i++) {
//               const entryOffset = gpsIFDOffset + 2 + i * 12;
//               const tag = exifData.getUint16(entryOffset, littleEndian);
//               const type = exifData.getUint16(entryOffset + 2, littleEndian);
//               const valOffset = exifData.getUint32(entryOffset + 8, littleEndian) + 6;

//               const readRational = (off) =>
//                 exifData.getUint32(off, littleEndian) /
//                 exifData.getUint32(off + 4, littleEndian);

//               if (type === 5) {
//                 gps[tag] = [
//                   readRational(valOffset),
//                   readRational(valOffset + 8),
//                   readRational(valOffset + 16),
//                 ];
//               } else if (type === 2) {
//                 gps[tag] = String.fromCharCode(exifData.getUint8(entryOffset + 8));
//               }
//             }

//             if (!gps[2] || !gps[4]) return resolve(null);

//             const dmsToDD = ([d, m, s]) => d + m / 60 + s / 3600;
//             let lat = dmsToDD(gps[2]);
//             let lon = dmsToDD(gps[4]);
//             if (gps[1] === "S") lat = -lat;
//             if (gps[3] === "W") lon = -lon;

//             return resolve({ lat, lon });
//           } else {
//             offset += view.getUint16(offset, false);
//           }
//         }
//         resolve(null);
//       };
//       reader.readAsArrayBuffer(file);
//     });

//   // ── Form Submit ──────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!agreed) {
//       alert("Please confirm the declaration before submitting.");
//       return;
//     }

//     try {
//       setLoadingSubmit(true);

//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", desc);
//       formData.append("location", location);
//       formData.append("category", category);

//       if (file) formData.append("photo", file);

//       const token = localStorage.getItem("token");

//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/v1/complaint/create`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData,
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         setSubmitted(true);
//       } else {
//         alert(data.message);
//       }
//     } catch (error) {
//       console.log("ERROR:", error);
//       alert("Submission failed");
//     } finally {
//       setLoadingSubmit(false);
//     }
//   };

//   // ── Success Screen ───────────────────────────────────────────────────────
//   if (submitted) {
//     return (
//       <div className="min-h-screen bg-[#060e1f] text-white flex">
//         <style>{`
//           @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
//           .font-serif-display{font-family:'Source Serif 4',Georgia,serif}
//           .font-mono-gov{font-family:'JetBrains Mono',monospace}
//           .tricolor-bar{background:linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)}
//           .gov-grid{background-image:linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px);background-size:48px 48px}
//         `}</style>
//         <UserSidebar />
//         <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
//           <div className="tricolor-bar h-1 w-full shrink-0" />
//           <div className="flex-1 gov-grid flex items-center justify-center px-6">
//             <div className="max-w-md w-full text-center">
//               <div className="text-5xl mb-4">✅</div>
//               <div className="border border-green-700/40 bg-green-900/10 p-8">
//                 <p className="text-[10px] font-mono-gov text-green-400 uppercase tracking-widest mb-2">
//                   Complaint Registered
//                 </p>
//                 <h2 className="text-2xl font-black font-serif-display text-white">
//                   Submission Successful
//                 </h2>
//                 <p className="text-slate-400 text-sm mt-3 leading-relaxed">
//                   Your grievance has been registered on the JanSahayak Portal. A unique
//                   complaint ID has been assigned and the relevant department has been notified.
//                 </p>
//                 <div className="mt-6 border border-amber-700/30 bg-[#0a1628] px-5 py-4">
//                   <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">
//                     Complaint ID
//                   </p>
//                   <p className="text-xl font-black font-mono-gov text-amber-400 mt-1">
//                     JS-2026-{Math.floor(1000 + Math.random() * 9000)}
//                   </p>
//                   <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
//                     Save this for future reference
//                   </p>
//                 </div>
//                 <p className="text-[10px] text-slate-500 font-mono-gov mt-4">
//                   An acknowledgement has been sent to your registered email. You will receive
//                   SMS updates at every stage of resolution.
//                 </p>
//                 <button
//                   onClick={() => {
//                     setSubmitted(false);
//                     setLocationAutoFilled(false);
//                   }}
//                   className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 transition font-bold tracking-widest uppercase text-sm font-mono-gov"
//                 >
//                   File Another Complaint
//                 </button>
//               </div>
//             </div>
//           </div>
//           <div className="tricolor-bar h-1 w-full shrink-0" />
//         </div>
//       </div>
//     );
//   }

//   // ── Main Form ────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-[#060e1f] text-white flex">
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
//         .font-serif-display{font-family:'Source Serif 4',Georgia,serif}
//         .font-mono-gov{font-family:'JetBrains Mono',monospace}
//         .tricolor-bar{background:linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)}
//         .gov-grid{background-image:linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px);background-size:48px 48px}
//         input,textarea,select{outline:none}
//         input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #060e1f inset!important;-webkit-text-fill-color:white!important}
//       `}</style>

//       <UserSidebar />

//       <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
//         <div className="tricolor-bar h-1 w-full shrink-0" />

//         {/* Top bar */}
//         <div className="bg-[#0a1628] border-b border-amber-700/30 px-6 py-3 flex items-center justify-between shrink-0">
//           <div>
//             <h1 className="text-base font-black font-serif-display text-white leading-tight">
//               File a Complaint
//             </h1>
//             <p className="text-[10px] text-slate-500 font-mono-gov">
//               JanSahayak Portal &nbsp;|&nbsp; शिकायत दर्ज करें
//             </p>
//           </div>
//           <div className="border border-amber-700/40 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-3 py-1">
//             📋 New Grievance
//           </div>
//         </div>

//         <div className="flex-1 gov-grid p-6 overflow-auto">
//           <div className="max-w-4xl">

//             {/* Info notice */}
//             <div className="border border-amber-700/30 bg-amber-900/10 text-amber-200/80 text-[11px] font-mono-gov px-4 py-3 mb-6 leading-relaxed">
//               ℹ️ All fields marked <span className="text-amber-500">*</span> are mandatory.
//               Complaints with photographic evidence are prioritised and resolved faster. False
//               or misleading complaints may result in account suspension.
//             </div>

//             {/* Steps indicator */}
//             <div className="flex items-center gap-2 mb-6 text-[10px] font-mono-gov">
//               {["Issue Details", "Location & Evidence", "Declaration"].map((step, i) => (
//                 <div key={step} className="flex items-center gap-2">
//                   <div
//                     className={`flex items-center gap-1.5 px-3 py-1.5 border ${
//                       i === 0
//                         ? "border-amber-600 bg-amber-600/20 text-amber-400"
//                         : "border-white/10 text-slate-600"
//                     }`}
//                   >
//                     <span>{i + 1}.</span> {step}
//                   </div>
//                   {i < 2 && <div className="text-slate-700">›</div>}
//                 </div>
//               ))}
//             </div>

//             <form onSubmit={handleSubmit} className="flex flex-col gap-6">

//               {/* ── SECTION 1: Issue Details ── */}
//               <div className="border border-white/10 bg-[#0a1628]">
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">01</span>
//                   <span className="text-white font-bold text-sm">Issue Details</span>
//                 </div>
//                 <div className="p-5 flex flex-col gap-5">

//                   {/* Title */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Complaint Title <span className="text-amber-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Brief title describing the issue"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       required
//                       className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov transition"
//                     />
//                     <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
//                       {title.length}/100 characters
//                     </p>
//                   </div>

//                   {/* Description */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Detailed Description <span className="text-amber-500">*</span>
//                     </label>
//                     <textarea
//                       rows={4}
//                       placeholder="Describe the issue in detail — when it started, how severe it is, and any impact on residents..."
//                       value={desc}
//                       onChange={(e) => setDesc(e.target.value)}
//                       required
//                       className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov resize-none transition"
//                     />
//                     <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
//                       {desc.length}/500 characters
//                     </p>
//                   </div>

//                   {/* AI Category Display */}
//                   <div className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 text-sm font-mono-gov flex items-center gap-3">
//                     {loadingAI ? (
//                       <>
//                         <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
//                         <span className="text-amber-400 font-bold">Analyzing image...</span>
//                       </>
//                     ) : (
//                       <span
//                         className={`font-bold transition-all duration-300 ${
//                           category ? "text-green-400 opacity-100" : "text-slate-500 opacity-70"
//                         }`}
//                       >
//                         {category || "Upload image to detect category"}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* ── SECTION 2: Location & Evidence ── */}
//               <div className="border border-white/10 bg-[#0a1628]">
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">02</span>
//                   <span className="text-white font-bold text-sm">Location & Evidence</span>
//                 </div>
//                 <div className="p-5 flex flex-col gap-5">

//                   {/* Location */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Location / Address <span className="text-amber-500">*</span>
//                     </label>
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         placeholder="Street, Sector, Landmark, City"
//                         value={location}
//                         onChange={(e) => {
//                           setLocation(e.target.value);
//                           setLocationAutoFilled(false); // user editing manually
//                         }}
//                         required
//                         className={`flex-1 px-4 py-3 bg-[#060e1f] border text-white placeholder-slate-600 text-sm font-mono-gov transition ${
//                           locationAutoFilled
//                             ? "border-green-600/70 focus:border-green-500"
//                             : "border-white/10 focus:border-amber-600/60"
//                         }`}
//                       />
//                       <button
//                         type="button"
//                         className="px-4 py-3 border border-amber-700/40 text-amber-400 hover:bg-amber-600/10 transition text-[10px] font-mono-gov uppercase tracking-wide whitespace-nowrap"
//                         onClick={async () => {
//                           if (!navigator.geolocation) {
//                             alert("Geolocation is not supported by your browser.");
//                             return;
//                           }
//                           navigator.geolocation.getCurrentPosition(
//                             async (pos) => {
//                               const { latitude, longitude } = pos.coords;
//                               try {
//                                 const res = await fetch(
//                                   `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
//                                   { headers: { "Accept-Language": "en" } }
//                                 );
//                                 const data = await res.json();
//                                 if (data?.display_name) {
//                                   setLocation(data.display_name);
//                                   setLocationAutoFilled(true);
//                                 }
//                               } catch {
//                                 alert("Could not fetch address from GPS.");
//                               }
//                             },
//                             () => alert("GPS access denied. Please allow location access.")
//                           );
//                         }}
//                       >
//                         📍 Use GPS
//                       </button>
//                     </div>

//                     {/* Auto-fill badge */}
//                     {locationAutoFilled ? (
//                       <p className="text-[10px] text-green-400 font-mono-gov mt-1 flex items-center gap-1">
//                         <span>✦</span>
//                         <span>Location auto-filled from image metadata</span>
//                       </p>
//                     ) : (
//                       <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
//                         Precise location helps authorities locate and resolve the issue faster.
//                       </p>
//                     )}
//                   </div>

//                   {/* File upload */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Upload Photograph / Evidence
//                     </label>
//                     <div className="relative">
//                       <label
//                         htmlFor="evidence-upload"
//                         className="flex flex-col items-center justify-center border border-dashed border-amber-700/30 bg-[#060e1f] hover:border-amber-600/60 hover:bg-amber-600/5 transition cursor-pointer py-8 gap-2"
//                       >
//                         <span className="text-2xl">{file ? "📎" : "📷"}</span>
//                         <span className="text-xs font-mono-gov text-slate-400">
//                           {file ? file.name : "Click to upload image or drag & drop"}
//                         </span>
//                         <span className="text-[10px] font-mono-gov text-slate-600">
//                           JPG, PNG up to 5MB — Strongly recommended
//                         </span>
//                       </label>

//                       {/* Loader overlay */}
//                       {loadingAI && (
//                         <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded">
//                           <div className="flex flex-col items-center gap-3">
//                             <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
//                             <p className="text-xs text-amber-400 font-mono-gov">
//                               AI is analyzing image...
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     <input
//                       id="evidence-upload"
//                       disabled={loadingAI}
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={async (e) => {
//                         const selectedFile = e.target.files[0];
//                         setFile(selectedFile);
//                         setLocationAutoFilled(false);

//                         if (!selectedFile) return;

//                         try {
//                           setLoadingAI(true);

//                           // Run GPS extraction + AI classification in parallel
//                           const [gpsResult, classifyData] = await Promise.all([
//                             extractGPS(selectedFile),
//                             (async () => {
//                               const fd = new FormData();
//                               fd.append("image", selectedFile);
//                               const res = await fetch(
//                                 `${import.meta.env.VITE_API_URL}/api/v1/classify`,
//                                 { method: "POST", body: fd }
//                               );
//                               const text = await res.text();
//                               try {
//                                 return JSON.parse(text);
//                               } catch {
//                                 throw new Error("Invalid JSON from server");
//                               }
//                             })(),
//                           ]);

//                           // Reverse geocode if GPS metadata found in image
//                           if (gpsResult) {
//                             const { lat, lon } = gpsResult;
//                             const geoRes = await fetch(
//                               `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
//                               { headers: { "Accept-Language": "en" } }
//                             );
//                             const geoData = await geoRes.json();
//                             if (geoData?.display_name) {
//                               setLocation(geoData.display_name);
//                               setLocationAutoFilled(true);
//                             }
//                           }

//                           // Set AI detected category
//                           setCategory(classifyData.category);

//                         } catch (err) {
//                           console.error("Error:", err);
//                           alert("Processing failed");
//                         } finally {
//                           setLoadingAI(false);
//                         }
//                       }}
//                     />
//                   </div>

//                 </div>
//               </div>

//               {/* ── SECTION 3: Declaration ── */}
//               <div className="border border-white/10 bg-[#0a1628]">
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">03</span>
//                   <span className="text-white font-bold text-sm">Citizen Declaration</span>
//                 </div>
//                 <div className="p-5">
//                   <label className="flex items-start gap-3 cursor-pointer group">
//                     <div
//                       onClick={() => setAgreed(!agreed)}
//                       className={`mt-0.5 w-4 h-4 shrink-0 border-2 transition flex items-center justify-center ${
//                         agreed
//                           ? "border-amber-500 bg-amber-600"
//                           : "border-slate-600 group-hover:border-amber-700"
//                       }`}
//                     >
//                       {agreed && <span className="text-white text-[10px] leading-none">✓</span>}
//                     </div>
//                     <p className="text-[11px] text-slate-400 font-mono-gov leading-relaxed">
//                       I hereby declare that the information provided above is true and correct to
//                       the best of my knowledge. I understand that filing a false complaint is an
//                       offence and may result in legal action under applicable law. I consent to my
//                       complaint being shared with the relevant municipal department for resolution.
//                     </p>
//                   </label>
//                 </div>
//               </div>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={loadingAI || loadingSubmit}
//                 className={`w-full py-3.5 font-bold tracking-widest uppercase text-sm font-mono-gov transition ${
//                   loadingAI
//                     ? "bg-slate-700 cursor-not-allowed"
//                     : "bg-amber-600 hover:bg-amber-500 active:scale-[0.99]"
//                 }`}
//               >
//                 {loadingAI ? "Processing Image..." : "Submit Complaint →"}
//               </button>

//               <p className="text-[10px] text-slate-600 font-mono-gov text-center -mt-2">
//                 You will receive an acknowledgement with a unique Complaint ID on your registered
//                 email & mobile.
//               </p>

//             </form>

//             {/* Footer strip */}
//             <div className="mt-8 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov">
//               Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll
//               Free) &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
//             </div>
//           </div>
//         </div>

//         <div className="tricolor-bar h-1 w-full shrink-0" />
//       </div>

//       {/* Submit loader overlay */}
//       {loadingSubmit && (
//         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
//           <div className="flex flex-col items-center gap-4">
//             <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
//             <p className="text-amber-400 font-mono-gov text-sm tracking-widest">
//               Submitting Complaint...
//             </p>
//             <p className="text-slate-500 text-xs font-mono-gov">
//               Please wait while we register your grievance
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import { useState } from "react";
// import UserSidebar from "../../components/UserSidebar";

// export default function ReportIssue() {
//   const [title, setTitle] = useState("");
//   const [desc, setDesc] = useState("");
//   const [location, setLocation] = useState("");
//   const [category, setCategory] = useState("");
//   const [file, setFile] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);
//   const [submitted, setSubmitted] = useState(false);
//   const [agreed, setAgreed] = useState(false);
//   const [loadingAI, setLoadingAI] = useState(false);
//   const [loadingSubmit, setLoadingSubmit] = useState(false);
//   const [locationAutoFilled, setLocationAutoFilled] = useState(false);
//   const [imageAnalyzed, setImageAnalyzed] = useState(false);

//   // ── EXIF GPS Extractor ───────────────────────────────────────────────────
//   const extractGPS = (file) =>
//     new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = (ev) => {
//         const view = new DataView(ev.target.result);
//         if (view.getUint16(0, false) !== 0xffd8) return resolve(null);

//         let offset = 2;
//         while (offset < view.byteLength) {
//           const marker = view.getUint16(offset, false);
//           offset += 2;

//           if (marker === 0xffe1) {
//             const exifLength = view.getUint16(offset, false);
//             const exifData = new DataView(ev.target.result, offset + 2, exifLength - 2);
//             if (exifData.getUint32(0, false) !== 0x45786966) return resolve(null);

//             const littleEndian = exifData.getUint16(6) === 0x4949;
//             const ifdOffset = exifData.getUint32(10, littleEndian) + 6;
//             const numEntries = exifData.getUint16(ifdOffset, littleEndian);

//             let gpsIFDOffset = null;
//             for (let i = 0; i < numEntries; i++) {
//               const entryOffset = ifdOffset + 2 + i * 12;
//               const tag = exifData.getUint16(entryOffset, littleEndian);
//               if (tag === 0x8825) {
//                 gpsIFDOffset = exifData.getUint32(entryOffset + 8, littleEndian) + 6;
//                 break;
//               }
//             }
//             if (gpsIFDOffset === null) return resolve(null);

//             const gpsEntries = exifData.getUint16(gpsIFDOffset, littleEndian);
//             const gps = {};
//             for (let i = 0; i < gpsEntries; i++) {
//               const entryOffset = gpsIFDOffset + 2 + i * 12;
//               const tag = exifData.getUint16(entryOffset, littleEndian);
//               const type = exifData.getUint16(entryOffset + 2, littleEndian);
//               const valOffset = exifData.getUint32(entryOffset + 8, littleEndian) + 6;
//               const readRational = (off) =>
//                 exifData.getUint32(off, littleEndian) /
//                 exifData.getUint32(off + 4, littleEndian);
//               if (type === 5) {
//                 gps[tag] = [readRational(valOffset), readRational(valOffset + 8), readRational(valOffset + 16)];
//               } else if (type === 2) {
//                 gps[tag] = String.fromCharCode(exifData.getUint8(entryOffset + 8));
//               }
//             }
//             if (!gps[2] || !gps[4]) return resolve(null);
//             const dmsToDD = ([d, m, s]) => d + m / 60 + s / 3600;
//             let lat = dmsToDD(gps[2]);
//             let lon = dmsToDD(gps[4]);
//             if (gps[1] === "S") lat = -lat;
//             if (gps[3] === "W") lon = -lon;
//             return resolve({ lat, lon });
//           } else {
//             offset += view.getUint16(offset, false);
//           }
//         }
//         resolve(null);
//       };
//       reader.readAsArrayBuffer(file);
//     });

//   // ── Form Submit ──────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!agreed) { alert("Please confirm the declaration before submitting."); return; }
//     try {
//       setLoadingSubmit(true);
//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", desc);
//       formData.append("location", location);
//       formData.append("category", category);
//       if (file) formData.append("photo", file);
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/v1/complaint/create`,
//         { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
//       );
//       const data = await response.json();
//       if (data.success) { setSubmitted(true); }
//       else { alert(data.message); }
//     } catch (error) {
//       console.log("ERROR:", error);
//       alert("Submission failed");
//     } finally {
//       setLoadingSubmit(false);
//     }
//   };

//   // ── Handle file selection & AI analysis ─────────────────────────────────
//   const handleFileChange = async (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) return;

//     setFile(selectedFile);
//     setLocationAutoFilled(false);
//     setImageAnalyzed(false);
//     setCategory("");
//     setLocation("");

//     // Preview
//     const previewURL = URL.createObjectURL(selectedFile);
//     setFilePreview(previewURL);

//     try {
//       setLoadingAI(true);

//       const [gpsResult, classifyData] = await Promise.all([
//         extractGPS(selectedFile),
//         (async () => {
//           const fd = new FormData();
//           fd.append("image", selectedFile);
//           const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/classify`, {
//             method: "POST", body: fd,
//           });
//           const text = await res.text();
//           try { return JSON.parse(text); }
//           catch { throw new Error("Invalid JSON from server"); }
//         })(),
//       ]);

//       if (gpsResult) {
//         const { lat, lon } = gpsResult;
//         const geoRes = await fetch(
//           `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
//           { headers: { "Accept-Language": "en" } }
//         );
//         const geoData = await geoRes.json();
//         if (geoData?.display_name) {
//           setLocation(geoData.display_name);
//           setLocationAutoFilled(true);
//         }
//       }

//       setCategory(classifyData.category);
//       setImageAnalyzed(true);
//     } catch (err) {
//       console.error("Error:", err);
//       alert("Image processing failed");
//     } finally {
//       setLoadingAI(false);
//     }
//   };

//   // ── Success Screen ───────────────────────────────────────────────────────
//   if (submitted) {
//     return (
//       <div className="min-h-screen bg-[#060e1f] text-white flex">
//         <style>{STYLES}</style>
//         <UserSidebar />
//         <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
//           <div className="tricolor-bar h-1 w-full shrink-0" />
//           <div className="flex-1 gov-grid flex items-center justify-center px-6">
//             <div className="max-w-md w-full text-center">
//               <div className="text-5xl mb-4">✅</div>
//               <div className="border border-green-700/40 bg-green-900/10 p-8">
//                 <p className="text-[10px] font-mono-gov text-green-400 uppercase tracking-widest mb-2">Complaint Registered</p>
//                 <h2 className="text-2xl font-black font-serif-display text-white">Submission Successful</h2>
//                 <p className="text-slate-400 text-sm mt-3 leading-relaxed">
//                   Your grievance has been registered on the JanSahayak Portal. A unique complaint ID has been assigned and the relevant department has been notified.
//                 </p>
//                 <div className="mt-6 border border-amber-700/30 bg-[#0a1628] px-5 py-4">
//                   <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">Complaint ID</p>
//                   <p className="text-xl font-black font-mono-gov text-amber-400 mt-1">
//                     JS-2026-{Math.floor(1000 + Math.random() * 9000)}
//                   </p>
//                   <p className="text-[10px] text-slate-600 font-mono-gov mt-1">Save this for future reference</p>
//                 </div>
//                 <p className="text-[10px] text-slate-500 font-mono-gov mt-4">
//                   An acknowledgement has been sent to your registered email. You will receive SMS updates at every stage of resolution.
//                 </p>
//                 <button
//                   onClick={() => { setSubmitted(false); setLocationAutoFilled(false); setImageAnalyzed(false); setFilePreview(null); }}
//                   className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 transition font-bold tracking-widest uppercase text-sm font-mono-gov"
//                 >
//                   File Another Complaint
//                 </button>
//               </div>
//             </div>
//           </div>
//           <div className="tricolor-bar h-1 w-full shrink-0" />
//         </div>
//       </div>
//     );
//   }

//   // ── Main Form ────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-[#060e1f] text-white flex">
//       <style>{STYLES}</style>
//       <UserSidebar />

//       <div className="ml-[30%] flex-1 flex flex-col min-h-screen">
//         <div className="tricolor-bar h-1 w-full shrink-0" />

//         {/* Top bar */}
//         <div className="bg-[#0a1628] border-b border-amber-700/30 px-6 py-3 flex items-center justify-between shrink-0">
//           <div>
//             <h1 className="text-base font-black font-serif-display text-white leading-tight">File a Complaint</h1>
//             <p className="text-[10px] text-slate-500 font-mono-gov">JanSahayak Portal &nbsp;|&nbsp; शिकायत दर्ज करें</p>
//           </div>
//           <div className="border border-amber-700/40 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-3 py-1">
//             📋 New Grievance
//           </div>
//         </div>

//         <div className="flex-1 gov-grid p-6 overflow-auto">
//           <div className="max-w-4xl">

//             {/* Info notice */}
//             <div className="border border-amber-700/30 bg-amber-900/10 text-amber-200/80 text-[11px] font-mono-gov px-4 py-3 mb-6 leading-relaxed">
//               ℹ️ All fields marked <span className="text-amber-500">*</span> are mandatory.
//               Start by uploading a photo — category and location will be detected automatically.
//               Complaints with photographic evidence are prioritised and resolved faster.
//             </div>

//             <form onSubmit={handleSubmit} className="flex flex-col gap-6">

//               {/* ── SECTION 1: Upload Evidence FIRST ── */}
//               <div className="border border-white/10 bg-[#0a1628]">
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">01</span>
//                   <span className="text-white font-bold text-sm">Upload Evidence</span>
//                   <span className="ml-auto text-[10px] font-mono-gov text-slate-500">
//                     Category & location detected automatically from your photo
//                   </span>
//                 </div>
//                 <div className="p-5 flex flex-col gap-4">

//                   {/* Upload area */}
//                   <div className="relative">
//                     <label
//                       htmlFor="evidence-upload"
//                       className={`flex flex-col items-center justify-center border border-dashed transition cursor-pointer gap-2 ${
//                         loadingAI
//                           ? "border-amber-600/50 bg-amber-900/10"
//                           : file
//                           ? "border-green-600/40 bg-[#060e1f] hover:border-green-500/60"
//                           : "border-amber-700/30 bg-[#060e1f] hover:border-amber-600/60 hover:bg-amber-600/5"
//                       } ${filePreview ? "py-0 overflow-hidden" : "py-10"}`}
//                     >
//                       {filePreview && !loadingAI ? (
//                         /* Image preview */
//                         <div className="relative w-full">
//                           <img
//                             src={filePreview}
//                             alt="Evidence preview"
//                             className="w-full max-h-64 object-cover"
//                           />
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                           <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
//                             <span className="text-xs font-mono-gov text-white/90 truncate max-w-[70%]">{file.name}</span>
//                             <span className="text-[10px] font-mono-gov text-green-400 border border-green-600/40 bg-green-900/30 px-2 py-0.5">
//                               ✓ Uploaded
//                             </span>
//                           </div>
//                         </div>
//                       ) : loadingAI ? (
//                         /* Loading state */
//                         <div className="py-10 flex flex-col items-center gap-3">
//                           <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
//                           <p className="text-sm text-amber-400 font-mono-gov">Analysing image with AI...</p>
//                           <p className="text-[10px] text-slate-500 font-mono-gov">Detecting category and extracting location</p>
//                         </div>
//                       ) : (
//                         /* Default empty state */
//                         <>
//                           <span className="text-4xl">📷</span>
//                           <span className="text-sm font-mono-gov text-slate-300 font-bold">Click to upload photograph</span>
//                           <span className="text-[10px] font-mono-gov text-slate-500">JPG, PNG up to 5MB — AI will auto-detect category & location</span>
//                           <div className="flex items-center gap-4 mt-2">
//                             {["🏷️ Category", "📍 Location"].map((tag) => (
//                               <span key={tag} className="text-[10px] font-mono-gov text-amber-500/70 border border-amber-700/30 px-2 py-1">
//                                 {tag} auto-filled
//                               </span>
//                             ))}
//                           </div>
//                         </>
//                       )}
//                     </label>
//                     <input
//                       id="evidence-upload"
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       disabled={loadingAI}
//                       onChange={handleFileChange}
//                     />
//                   </div>

//                   {/* Change photo button (shown after upload) */}
//                   {file && !loadingAI && (
//                     <label
//                       htmlFor="evidence-upload"
//                       className="text-center text-[10px] font-mono-gov text-slate-500 hover:text-amber-400 cursor-pointer transition underline underline-offset-2"
//                     >
//                       ↺ Change photo
//                     </label>
//                   )}
//                 </div>
//               </div>

//               {/* ── SECTION 2: Auto-detected Fields (revealed after image) ── */}
//               <div className={`border border-white/10 bg-[#0a1628] transition-all duration-500 ${
//                 !file ? "opacity-40 pointer-events-none" : "opacity-100"
//               }`}>
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">02</span>
//                   <span className="text-white font-bold text-sm">Detected Details</span>
//                   {imageAnalyzed && (
//                     <span className="ml-auto text-[10px] font-mono-gov text-green-400 flex items-center gap-1">
//                       <span>✦</span> Auto-filled from image
//                     </span>
//                   )}
//                   {!file && (
//                     <span className="ml-auto text-[10px] font-mono-gov text-slate-600">Upload an image first</span>
//                   )}
//                 </div>
//                 <div className="p-5 flex flex-col gap-5">

//                   {/* AI-detected Category */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Issue Category <span className="text-amber-500">*</span>
//                       {imageAnalyzed && <span className="ml-2 text-green-500 normal-case">— AI detected</span>}
//                     </label>
//                     <div className={`w-full px-4 py-3 border text-sm font-mono-gov flex items-center gap-3 transition ${
//                       category
//                         ? "bg-green-900/10 border-green-700/40"
//                         : "bg-[#060e1f] border-white/10"
//                     }`}>
//                       {loadingAI ? (
//                         <>
//                           <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
//                           <span className="text-amber-400 font-bold">Detecting category...</span>
//                         </>
//                       ) : category ? (
//                         <>
//                           <span className="text-green-400 text-base">🏷️</span>
//                           <span className="text-green-300 font-bold">{category}</span>
//                         </>
//                       ) : (
//                         <span className="text-slate-600">Category will appear here after upload</span>
//                       )}
//                     </div>
//                   </div>

//                   {/* Location */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Location / Address <span className="text-amber-500">*</span>
//                       {locationAutoFilled && <span className="ml-2 text-green-500 normal-case">— extracted from image metadata</span>}
//                     </label>
//                     <div className="flex gap-2">
//                       <input
//                         type="text"
//                         placeholder={loadingAI ? "Extracting location from image..." : "Will auto-fill from image, or enter manually"}
//                         value={location}
//                         onChange={(e) => { setLocation(e.target.value); setLocationAutoFilled(false); }}
//                         required
//                         className={`flex-1 px-4 py-3 bg-[#060e1f] border text-white placeholder-slate-600 text-sm font-mono-gov transition ${
//                           locationAutoFilled
//                             ? "border-green-600/70 focus:border-green-500"
//                             : "border-white/10 focus:border-amber-600/60"
//                         }`}
//                       />
//                       <button
//                         type="button"
//                         className="px-4 py-3 border border-amber-700/40 text-amber-400 hover:bg-amber-600/10 transition text-[10px] font-mono-gov uppercase tracking-wide whitespace-nowrap"
//                         onClick={async () => {
//                           if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
//                           navigator.geolocation.getCurrentPosition(
//                             async (pos) => {
//                               const { latitude, longitude } = pos.coords;
//                               try {
//                                 const res = await fetch(
//                                   `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
//                                   { headers: { "Accept-Language": "en" } }
//                                 );
//                                 const data = await res.json();
//                                 if (data?.display_name) { setLocation(data.display_name); setLocationAutoFilled(true); }
//                               } catch { alert("Could not fetch address from GPS."); }
//                             },
//                             () => alert("GPS access denied.")
//                           );
//                         }}
//                       >
//                         📍 Use GPS
//                       </button>
//                     </div>
//                     {locationAutoFilled ? (
//                       <p className="text-[10px] text-green-400 font-mono-gov mt-1 flex items-center gap-1">
//                         <span>✦</span> Location auto-filled from image EXIF metadata
//                       </p>
//                     ) : (
//                       <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
//                         Precise location helps authorities find and resolve the issue faster.
//                       </p>
//                     )}
//                   </div>

//                 </div>
//               </div>

//               {/* ── SECTION 3: Issue Details ── */}
//               <div className={`border border-white/10 bg-[#0a1628] transition-all duration-500 ${
//                 !imageAnalyzed && !loadingAI && !file ? "opacity-40 pointer-events-none" : "opacity-100"
//               }`}>
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">03</span>
//                   <span className="text-white font-bold text-sm">Issue Details</span>
//                 </div>
//                 <div className="p-5 flex flex-col gap-5">
//                   {/* Title */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Complaint Title <span className="text-amber-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Brief title describing the issue"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       required
//                       className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov transition"
//                     />
//                     <p className="text-[10px] text-slate-600 font-mono-gov mt-1">{title.length}/100 characters</p>
//                   </div>

//                   {/* Description */}
//                   <div>
//                     <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
//                       Detailed Description <span className="text-amber-500">*</span>
//                     </label>
//                     <textarea
//                       rows={4}
//                       placeholder="Describe the issue in detail — when it started, how severe it is, and any impact on residents..."
//                       value={desc}
//                       onChange={(e) => setDesc(e.target.value)}
//                       required
//                       className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 text-white placeholder-slate-600 text-sm font-mono-gov resize-none transition"
//                     />
//                     <p className="text-[10px] text-slate-600 font-mono-gov mt-1">{desc.length}/500 characters</p>
//                   </div>
//                 </div>
//               </div>

//               {/* ── SECTION 4: Declaration ── */}
//               <div className="border border-white/10 bg-[#0a1628]">
//                 <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
//                   <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">04</span>
//                   <span className="text-white font-bold text-sm">Citizen Declaration</span>
//                 </div>
//                 <div className="p-5">
//                   <label className="flex items-start gap-3 cursor-pointer group">
//                     <div
//                       onClick={() => setAgreed(!agreed)}
//                       className={`mt-0.5 w-4 h-4 shrink-0 border-2 transition flex items-center justify-center ${
//                         agreed ? "border-amber-500 bg-amber-600" : "border-slate-600 group-hover:border-amber-700"
//                       }`}
//                     >
//                       {agreed && <span className="text-white text-[10px] leading-none">✓</span>}
//                     </div>
//                     <p className="text-[11px] text-slate-400 font-mono-gov leading-relaxed">
//                       I hereby declare that the information provided above is true and correct to the best of my knowledge.
//                       I understand that filing a false complaint is an offence and may result in legal action under applicable law.
//                       I consent to my complaint being shared with the relevant municipal department for resolution.
//                     </p>
//                   </label>
//                 </div>
//               </div>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={loadingAI || loadingSubmit || !file}
//                 className={`w-full py-3.5 font-bold tracking-widest uppercase text-sm font-mono-gov transition ${
//                   loadingAI || !file
//                     ? "bg-slate-700 cursor-not-allowed text-slate-500"
//                     : "bg-amber-600 hover:bg-amber-500 active:scale-[0.99]"
//                 }`}
//               >
//                 {loadingAI ? "Processing Image..." : !file ? "Upload an Image to Continue" : "Submit Complaint →"}
//               </button>

//               <p className="text-[10px] text-slate-600 font-mono-gov text-center -mt-2">
//                 You will receive an acknowledgement with a unique Complaint ID on your registered email & mobile.
//               </p>
//             </form>

//             {/* Footer */}
//             <div className="mt-8 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov">
//               Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free) &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
//             </div>
//           </div>
//         </div>

//         <div className="tricolor-bar h-1 w-full shrink-0" />
//       </div>

//       {/* Submit loader overlay */}
//       {loadingSubmit && (
//         <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
//           <div className="flex flex-col items-center gap-4">
//             <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
//             <p className="text-amber-400 font-mono-gov text-sm tracking-widest">Submitting Complaint...</p>
//             <p className="text-slate-500 text-xs font-mono-gov">Please wait while we register your grievance</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// const STYLES = `
//   @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
//   .font-serif-display{font-family:'Source Serif 4',Georgia,serif}
//   .font-mono-gov{font-family:'JetBrains Mono',monospace}
//   .tricolor-bar{background:linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)}
//   .gov-grid{background-image:linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px);background-size:48px 48px}
//   input,textarea,select{outline:none}
//   input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #060e1f inset!important;-webkit-text-fill-color:white!important}
// `;
import { useState } from "react";
import UserSidebar from "../../components/UserSidebar";

export default function ReportIssue() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [locationAutoFilled, setLocationAutoFilled] = useState(false);
  const [imageAnalyzed, setImageAnalyzed] = useState(false);

  // ── EXIF GPS Extractor ───────────────────────────────────────────────────
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
              const tag = exifData.getUint16(entryOffset, littleEndian);
              const type = exifData.getUint16(entryOffset + 2, littleEndian);
              const valOffset = exifData.getUint32(entryOffset + 8, littleEndian) + 6;
              const readRational = (off) =>
                exifData.getUint32(off, littleEndian) /
                exifData.getUint32(off + 4, littleEndian);
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

  // ── Form Submit ──────────────────────────────────────────────────────────
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
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/complaint/create`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      const data = await response.json();
      if (data.success) { setSubmitted(true); }
      else { alert(data.message); }
    } catch (error) {
      console.log("ERROR:", error);
      alert("Submission failed");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ── Handle file selection & AI analysis ─────────────────────────────────
  // const handleFileChange = async (e) => {
  //   const selectedFile = e.target.files[0];
  //   if (!selectedFile) return;

  //   setFile(selectedFile);
  //   setLocationAutoFilled(false);
  //   setImageAnalyzed(false);
  //   setCategory("");
  //   setLocation("");

  //   // Preview
  //   const previewURL = URL.createObjectURL(selectedFile);
  //   setFilePreview(previewURL);

  //   try {
  //     setLoadingAI(true);

  //     const [gpsResult, classifyData] = await Promise.all([
  //       extractGPS(selectedFile),
  //       (async () => {
  //         const fd = new FormData();
  //         fd.append("image", selectedFile);
  //         const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/classify`, {
  //           method: "POST", body: fd,
  //         });
  //         const text = await res.text();
  //         try { return JSON.parse(text); }
  //         catch { throw new Error("Invalid JSON from server"); }
  //       })(),
  //     ]);

  //     if (gpsResult) {
  //       const { lat, lon } = gpsResult;
  //       const geoRes = await fetch(
  //         `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
  //         { headers: { "Accept-Language": "en" } }
  //       );
  //       const geoData = await geoRes.json();
  //       if (geoData?.display_name) {
  //         setLocation(geoData.display_name);
  //         setLocationAutoFilled(true);
  //       }
  //     }

  //     setCategory(classifyData.category);
  //     setImageAnalyzed(true);
  //   } catch (err) {
  //     console.error("Error:", err);
  //     alert("Image processing failed");
  //   } finally {
  //     setLoadingAI(false);
  //   }
  // };
  const handleFileChange = async (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;

  setFile(selectedFile);
  setLocationAutoFilled(false);
  setImageAnalyzed(false);
  setCategory("");
  setLocation("");

  const previewURL = URL.createObjectURL(selectedFile);
  setFilePreview(previewURL);

  try {
    setLoadingAI(true);

    const [gpsResult, classifyData] = await Promise.all([
      extractGPS(selectedFile),
      (async () => {
        const fd = new FormData();
        fd.append("image", selectedFile);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/classify`, {
          method: "POST", body: fd,
        });
        const text = await res.text();
        try { return JSON.parse(text); }
        catch { throw new Error("Invalid JSON from server"); }
      })(),
    ]);

    if (gpsResult) {
      // ── EXIF GPS found in image ──
      const { lat, lon } = gpsResult;
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const geoData = await geoRes.json();
      if (geoData?.display_name) {
        setLocation(geoData.display_name);
        setLocationAutoFilled(true);
      }
    } else {
      // ── No EXIF GPS — fallback to device GPS ──
      await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve();
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                { headers: { "Accept-Language": "en" } }
              );
              const geoData = await geoRes.json();
              if (geoData?.display_name) {
                setLocation(geoData.display_name);
                setLocationAutoFilled(true);
              }
            } catch {
              // silently fail — user can type manually
            } finally {
              resolve();
            }
          },
          () => resolve(), // user denied GPS — silently fail
          { timeout: 8000, maximumAge: 60000 }
        );
      });
    }

    setCategory(classifyData.category);
    setImageAnalyzed(true);
  } catch (err) {
    console.error("Error:", err);
    alert("Image processing failed");
  } finally {
    setLoadingAI(false);
  }
};

  // ── Success Screen ───────────────────────────────────────────────────────
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
                <p className="text-[10px] font-mono-gov text-green-400 uppercase tracking-widest mb-2">Complaint Registered</p>
                <h2 className="text-2xl font-black font-serif-display text-white">Submission Successful</h2>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Your grievance has been registered on the JanSahayak Portal. A unique complaint ID has been assigned and the relevant department has been notified.
                </p>
                <div className="mt-6 border border-amber-700/30 bg-[#0a1628] px-5 py-4">
                  <p className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">Complaint ID</p>
                  <p className="text-xl font-black font-mono-gov text-amber-400 mt-1">
                    JS-2026-{Math.floor(1000 + Math.random() * 9000)}
                  </p>
                  <p className="text-[10px] text-slate-600 font-mono-gov mt-1">Save this for future reference</p>
                </div>
                <p className="text-[10px] text-slate-500 font-mono-gov mt-4">
                  An acknowledgement has been sent to your registered email. You will receive SMS updates at every stage of resolution.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setLocationAutoFilled(false); setImageAnalyzed(false); setFilePreview(null); }}
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

  // ── Main Form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060e1f] text-white flex">
      <style>{STYLES}</style>
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
              ℹ️ All fields marked <span className="text-amber-500">*</span> are mandatory.
              Start by uploading a photo — category and location will be detected automatically.
              Complaints with photographic evidence are prioritised and resolved faster.
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* ── SECTION 1: Upload Evidence FIRST ── */}
              <div className="border border-white/10 bg-[#0a1628]">
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">01</span>
                  <span className="text-white font-bold text-sm">Upload Evidence</span>
                  <span className="ml-auto text-[10px] font-mono-gov text-slate-500">
                    Category & location detected automatically from your photo
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-4">

                  {/* Upload area */}
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
                        /* Image preview */
                        <div className="relative w-full">
                          <img
                            src={filePreview}
                            alt="Evidence preview"
                            className="w-full max-h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <span className="text-xs font-mono-gov text-white/90 truncate max-w-[70%]">{file.name}</span>
                            <span className="text-[10px] font-mono-gov text-green-400 border border-green-600/40 bg-green-900/30 px-2 py-0.5">
                              ✓ Uploaded
                            </span>
                          </div>
                        </div>
                      ) : loadingAI ? (
                        /* Loading state */
                        <div className="py-10 flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-amber-400 font-mono-gov">Analysing image with AI...</p>
                          <p className="text-[10px] text-slate-500 font-mono-gov">Detecting category and extracting location</p>
                        </div>
                      ) : (
                        /* Default empty state */
                        <>
                          <span className="text-4xl">📷</span>
                          <span className="text-sm font-mono-gov text-slate-300 font-bold">Click to upload photograph</span>
                          <span className="text-[10px] font-mono-gov text-slate-500">JPG, PNG up to 5MB — AI will auto-detect category & location</span>
                          <div className="flex items-center gap-4 mt-2">
                            {["🏷️ Category", "📍 Location"].map((tag) => (
                              <span key={tag} className="text-[10px] font-mono-gov text-amber-500/70 border border-amber-700/30 px-2 py-1">
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

                  {/* Change photo button (shown after upload) */}
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

              {/* ── SECTION 2: Auto-detected Fields ── */}
              <div className={`border border-white/10 bg-[#0a1628] transition-all duration-500 ${
                !file ? "opacity-40 pointer-events-none" : "opacity-100"
              }`}>
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">02</span>
                  <span className="text-white font-bold text-sm">Detected Details</span>
                  {imageAnalyzed && (
                    <span className="ml-auto text-[10px] font-mono-gov text-green-400 flex items-center gap-1">
                      <span>✦</span> Auto-filled from image
                    </span>
                  )}
                  {!file && (
                    <span className="ml-auto text-[10px] font-mono-gov text-slate-600">Upload an image first</span>
                  )}
                </div>
                <div className="p-5 flex flex-col gap-5">

                  {/* AI-detected Category */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Issue Category <span className="text-amber-500">*</span>
                      {imageAnalyzed && <span className="ml-2 text-green-500 normal-case">— AI detected</span>}
                    </label>
                    <div className={`w-full px-4 py-3 border text-sm font-mono-gov flex items-center gap-3 transition ${
                      category
                        ? "bg-green-900/10 border-green-700/40"
                        : "bg-[#060e1f] border-white/10"
                    }`}>
                      {loadingAI ? (
                        <>
                          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-amber-400 font-bold">Detecting category...</span>
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

                  {/* Location */}
<div>
  <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
    Location / Address <span className="text-amber-500">*</span>
    {locationAutoFilled && <span className="ml-2 text-green-500 normal-case">— extracted from image metadata</span>}
  </label>

  {loadingAI ? (
    /* Loader while AI is processing */
    <div className="w-full px-4 py-3 bg-[#060e1f] border border-amber-600/40 flex items-center gap-3">
      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
      <span className="text-amber-400 text-sm font-mono-gov">Extracting location from image...</span>
    </div>
  ) : (
    <input
      type="text"
      placeholder="Will auto-fill from image, or enter manually"
      value={location}
      onChange={(e) => { setLocation(e.target.value); setLocationAutoFilled(false); }}
      required
      className={`w-full px-4 py-3 bg-[#060e1f] border text-white placeholder-slate-600 text-sm font-mono-gov transition ${
        locationAutoFilled
          ? "border-green-600/70 focus:border-green-500"
          : "border-white/10 focus:border-amber-600/60"
      }`}
    />
  )}

  {locationAutoFilled ? (
    <p className="text-[10px] text-green-400 font-mono-gov mt-1 flex items-center gap-1">
      <span>✦</span> Location auto-filled from image EXIF metadata
    </p>
  ) : !loadingAI ? (
    <p className="text-[10px] text-slate-600 font-mono-gov mt-1">
      Precise location helps authorities find and resolve the issue faster.
    </p>
  ) : null}
</div>

                </div>
              </div>

              {/* ── SECTION 3: Issue Details ── */}
              <div className={`border border-white/10 bg-[#0a1628] transition-all duration-500 ${
                !imageAnalyzed && !loadingAI && !file ? "opacity-40 pointer-events-none" : "opacity-100"
              }`}>
                <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                  <span className="text-amber-400 font-mono-gov font-bold text-[10px] uppercase tracking-widest">03</span>
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
                </div>
              </div>

              {/* ── SECTION 4: Declaration ── */}
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
                        agreed ? "border-amber-500 bg-amber-600" : "border-slate-600 group-hover:border-amber-700"
                      }`}
                    >
                      {agreed && <span className="text-white text-[10px] leading-none">✓</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono-gov leading-relaxed">
                      I hereby declare that the information provided above is true and correct to the best of my knowledge.
                      I understand that filing a false complaint is an offence and may result in legal action under applicable law.
                      I consent to my complaint being shared with the relevant municipal department for resolution.
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
                {loadingAI ? "Processing Image..." : !file ? "Upload an Image to Continue" : "Submit Complaint →"}
              </button>

              <p className="text-[10px] text-slate-600 font-mono-gov text-center -mt-2">
                You will receive an acknowledgement with a unique Complaint ID on your registered email & mobile.
              </p>
            </form>

            {/* Footer */}
            <div className="mt-8 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-600 font-mono-gov">
              Need help? Call <strong className="text-slate-400">1800-XXX-XXXX</strong> (Toll Free) &nbsp;|&nbsp; © 2026 JanSahayak — Government of India
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
            <p className="text-amber-400 font-mono-gov text-sm tracking-widest">Submitting Complaint...</p>
            <p className="text-slate-500 text-xs font-mono-gov">Please wait while we register your grievance</p>
          </div>
        </div>
      )}
    </div>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
  .font-serif-display{font-family:'Source Serif 4',Georgia,serif}
  .font-mono-gov{font-family:'JetBrains Mono',monospace}
  .tricolor-bar{background:linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%)}
  .gov-grid{background-image:linear-gradient(rgba(255,165,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.025) 1px,transparent 1px);background-size:48px 48px}
  input,textarea,select{outline:none}
  input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #060e1f inset!important;-webkit-text-fill-color:white!important}
`;