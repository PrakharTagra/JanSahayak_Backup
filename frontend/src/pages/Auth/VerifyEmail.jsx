import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "/favicon.png";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error" | "expired"
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/auth/verify-email?token=${token}`
        );
        const data = await res.json();

        if (data.success) {
          setStatus("success");
        } else if (data.message?.toLowerCase().includes("expired")) {
          setStatus("expired");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Invalid verification link.");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    })();
  }, [token]);

  const handleResend = async () => {
    // This only works if the user knows their email.
    // For simplicity, redirect to a resend page or prompt.
    navigate("/resend-verification");
  };

  return (
    <div className="min-h-screen bg-[#060e1f] text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
        .tricolor-bar       { background: linear-gradient(to right, #FF9933 33.3%, white 33.3%, white 66.6%, #138808 66.6%); }
      `}</style>

      <div className="tricolor-bar h-1.5 w-full shrink-0" />

      <header className="bg-[#0a1628] border-b border-amber-700/40 py-3 px-6 shrink-0">
        <div
          className="flex items-center gap-3 cursor-pointer w-fit"
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 rounded-full border border-amber-600 bg-amber-900/20 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="logo" className="w-6 h-6 object-cover" />
          </div>
          <div>
            <p className="text-white font-black font-serif-display text-base leading-tight">JanSahayak</p>
            <p className="text-amber-700/80 text-[9px] tracking-wide" style={{ fontFamily: "serif" }}>
              जन सहायक — नागरिक शिकायत निवारण पोर्टल
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md border border-amber-700/40 bg-[#0a1628]/95 backdrop-blur-xl"
        >
          <div className="border-b border-amber-700/30 px-8 py-5 text-center">
            <h2 className="text-xl font-black font-serif-display text-white tracking-tight">
              Email Verification
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-mono-gov">ईमेल सत्यापन</p>
          </div>

          <div className="px-8 py-10 text-center">
            {/* Loading */}
            {status === "loading" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm font-mono-gov">Verifying your email…</p>
              </div>
            )}

            {/* Success */}
            {status === "success" && (
              <div className="flex flex-col items-center gap-5">
                <div className="text-5xl">✅</div>
                <div>
                  <p className="text-green-400 font-bold font-mono-gov text-sm uppercase tracking-widest">
                    Email Verified!
                  </p>
                  <p className="text-slate-400 text-xs mt-2 font-mono-gov leading-relaxed">
                    Your account is now active. You can log in to JanSahayak.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 transition font-bold tracking-widest uppercase text-sm font-mono-gov"
                >
                  Login to Portal →
                </button>
              </div>
            )}

            {/* Expired */}
            {status === "expired" && (
              <div className="flex flex-col items-center gap-5">
                <div className="text-5xl">⏱</div>
                <div>
                  <p className="text-amber-400 font-bold font-mono-gov text-sm uppercase tracking-widest">
                    Link Expired
                  </p>
                  <p className="text-slate-400 text-xs mt-2 font-mono-gov leading-relaxed">
                    {message}
                  </p>
                </div>
                <button
                  onClick={handleResend}
                  className="w-full py-3 border border-amber-700/50 text-amber-400 hover:bg-amber-600/10 transition font-bold tracking-widest uppercase text-sm font-mono-gov"
                >
                  Resend Verification Email
                </button>
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className="flex flex-col items-center gap-5">
                <div className="text-5xl">✗</div>
                <div>
                  <p className="text-red-400 font-bold font-mono-gov text-sm uppercase tracking-widest">
                    Verification Failed
                  </p>
                  <p className="text-slate-400 text-xs mt-2 font-mono-gov leading-relaxed">
                    {message}
                  </p>
                </div>
                <button
                  onClick={handleResend}
                  className="w-full py-3 border border-amber-700/50 text-amber-400 hover:bg-amber-600/10 transition font-bold tracking-widest uppercase text-sm font-mono-gov"
                >
                  Resend Verification Email
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs text-slate-500 hover:text-amber-400 font-mono-gov transition underline"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <footer className="bg-[#060c18] border-t border-amber-700/20 py-3 px-6 text-center shrink-0">
        <p className="text-[10px] text-slate-600 font-mono-gov">
          © 2026 JanSahayak — Government of India
        </p>
      </footer>
      <div className="tricolor-bar h-1 w-full shrink-0" />
    </div>
  );
}