// components/ExportButton.jsx
// Drop this anywhere in AuthorityDashboard.
// Usage:  <ExportButton />
//
// It reads the JWT from localStorage (same as the rest of your dashboard),
// calls the export endpoint, and triggers a browser download.

import { useState } from "react";

const API = `${import.meta.env.VITE_API_URL}/api/v1`;

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleExport = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/authority/export`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || `Server error ${res.status}`);
      }

      // pull filename from Content-Disposition header if present
      const disposition = res.headers.get("Content-Disposition") || "";
      const match       = disposition.match(/filename="(.+?)"/);
      const filename    = match ? match[1] : `JanSahayak_Export_${new Date().toISOString().slice(0,10)}.xlsx`;

      // convert response to blob and trigger download
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Export failed:", err);
      setError(err.message || "Export failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          background:    loading ? "#334155" : "#22c55e",
          color:         loading ? "#64748b" : "#060e1f",
          border:        "none",
          fontFamily:    "'JetBrains Mono', monospace",
          fontWeight:    700,
          fontSize:      10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          padding:       "9px 18px",
          cursor:        loading ? "not-allowed" : "pointer",
          transition:    "background 0.15s",
          display:       "flex",
          alignItems:    "center",
          gap:           8,
        }}
      >
        {loading ? (
          <>
            <span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #64748b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            Generating…
          </>
        ) : (
          <>
            ⬇ Export Excel (5 Sheets)
          </>
        )}
      </button>

      {error && (
        <span style={{ fontSize: 9, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>
          ✗ {error}
        </span>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}