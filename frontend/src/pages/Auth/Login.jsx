import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/favicon.png";

export function Login() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  // ── Math CAPTCHA ──────────────────────────────────────────────────────────
  const genCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const ops = [
      { label: `${a} + ${b}`, answer: a + b },
      { label: `${a} × ${b}`, answer: a * b },
      { label: `${Math.max(a,b)} − ${Math.min(a,b)}`, answer: Math.max(a,b) - Math.min(a,b) },
    ];
    return ops[Math.floor(Math.random() * ops.length)];
  };
  const [captcha, setCaptcha] = useState(genCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loginError, setLoginError] = useState("");

  const refreshCaptcha = () => {
    setCaptcha(genCaptcha());
    setCaptchaInput("");
    setCaptchaError(false);
    setCaptchaVerified(false);
  };

  const verifyCaptcha = () => {
    if (parseInt(captchaInput, 10) === captcha.answer) {
      setCaptchaVerified(true);
      setCaptchaError(false);
    } else {
      setCaptchaError(true);
      setCaptchaVerified(false);
      refreshCaptcha();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!captchaVerified) {
      setCaptchaError(true);
      return;
    }
    try {
      const res = await fetch("https://candelaria-uninsinuative-obstructedly.ngrok-free.dev/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!data.success) {
        setLoginError(data.message || "Login failed. Please try again.");
        refreshCaptcha();
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.role === "user") navigate("/user/userdashboard");
      else navigate("/authoritydashboard");
    } catch (err) {
      console.error(err);
      setLoginError("Something went wrong. Please try again.");
      refreshCaptcha();
    }
  };

  return (
    <div className="min-h-screen bg-[#060e1f] text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
        .font-hindi         { font-family: serif; }
        .tricolor-bar       { background: linear-gradient(to right, #FF9933 33.3%, white 33.3%, white 66.6%, #138808 66.6%); }
        .gov-grid           { background-image: linear-gradient(rgba(255,165,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.03) 1px,transparent 1px); background-size:48px 48px; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0d1f3c inset !important; -webkit-text-fill-color: white !important; }
      `}</style>

      {/* Tricolor top */}
      <div className="tricolor-bar h-1.5 w-full shrink-0" />

      {/* Mini header */}
      <header className="bg-[#0a1628] border-b border-amber-700/40 py-3 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-full border border-amber-600 bg-amber-900/20 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="logo" className="w-6 h-6 object-cover" />
            </div>
            <div>
              <p className="text-white font-black font-serif-display text-base leading-tight">JanSahayak</p>
              <p className="text-amber-700/80 text-[9px] font-hindi tracking-wide">जन सहायक — नागरिक शिकायत निवारण पोर्टल</p>
            </div>
          </div>
          <div className="text-slate-500 text-[10px] font-mono-gov hidden md:block">
            Ministry of Housing & Urban Affairs &nbsp;|&nbsp; Government of India
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-amber-400 border border-amber-700/40 px-3 py-1.5 hover:bg-amber-600/10 transition font-mono-gov uppercase tracking-wide"
          >
            ← Home
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 gov-grid flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Official notice badge */}
          <div className="flex justify-center mb-6">
            <div className="border border-amber-700/50 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-4 py-1.5 flex items-center gap-2">
              <span>🔒</span> Secure Government Portal
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-amber-700/40 bg-[#0a1628]/95 backdrop-blur-xl"
          >
            {/* Card header */}
            <div className="border-b border-amber-700/30 px-8 py-5 text-center">
              <h2 className="text-xl font-black font-serif-display text-white tracking-tight">
                Citizen / Authority Login
              </h2>
              <p className="text-slate-400 text-xs mt-1 font-mono-gov">
                नागरिक / प्राधिकरण लॉगिन
              </p>
            </div>

            <div className="px-8 py-8">
              {/* Role toggle */}
              <div className="mb-6">
                <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-2">
                  Login As
                </label>
                <div className="grid grid-cols-2 border border-amber-700/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`py-2.5 text-xs font-bold tracking-widest uppercase font-mono-gov transition flex items-center justify-center gap-2 ${
                      role === "user"
                        ? "bg-amber-600 text-white"
                        : "text-slate-400 hover:bg-amber-600/10 hover:text-amber-400"
                    }`}
                  >
                    👤 Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("authority")}
                    className={`py-2.5 text-xs font-bold tracking-widest uppercase font-mono-gov transition flex items-center justify-center gap-2 border-l border-amber-700/40 ${
                      role === "authority"
                        ? "bg-amber-600 text-white"
                        : "text-slate-400 hover:bg-amber-600/10 hover:text-amber-400"
                    }`}
                  >
                    🏛️ Authority
                  </button>
                </div>
                {/* role description */}
                <p className="text-[10px] text-slate-500 mt-2 font-mono-gov text-center">
                  {role === "user"
                    ? "For residents reporting or tracking civic issues"
                    : "For municipal officers managing grievances"}
                </p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-5">
                {/* Email */}
                <div>
                  <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                    Registered Email ID
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
                    required
                    className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 focus:outline-none text-white placeholder-slate-600 text-sm font-mono-gov transition"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">
                      Password
                    </label>
                    <span className="text-[10px] text-amber-500 cursor-pointer hover:underline font-mono-gov">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 focus:outline-none text-white placeholder-slate-600 text-sm font-mono-gov transition pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition text-xs font-mono-gov"
                    >
                      {showPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                {/* ── Math CAPTCHA ── */}
                <div className={`border bg-[#060e1f] px-4 py-3 transition ${
                  captchaVerified
                    ? "border-green-700/50"
                    : captchaError
                    ? "border-red-700/50"
                    : "border-white/10"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest">
                      Security Verification <span className="text-amber-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="text-[10px] font-mono-gov text-slate-600 hover:text-amber-400 transition"
                      title="Refresh"
                    >
                      ↺ Refresh
                    </button>
                  </div>

                  {captchaVerified ? (
                    <div className="flex items-center gap-2 py-1">
                      <span className="text-green-400 text-base">✅</span>
                      <span className="text-green-400 text-xs font-mono-gov font-bold">Verification successful</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {/* Problem display */}
                      <div className="border border-amber-700/30 bg-amber-900/10 px-4 py-2 font-mono-gov font-black text-amber-300 text-lg tracking-widest select-none min-w-[90px] text-center"
                        style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.15em" }}>
                        {captcha.label} = ?
                      </div>
                      <input
                        type="number"
                        placeholder="Answer"
                        value={captchaInput}
                        onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(false); }}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), verifyCaptcha())}
                        className="w-24 px-3 py-2 bg-[#0a1628] border border-white/10 focus:border-amber-600/60 focus:outline-none text-white text-sm font-mono-gov text-center transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={verifyCaptcha}
                        className="px-3 py-2 border border-amber-700/40 text-amber-400 hover:bg-amber-600/10 transition text-[10px] font-mono-gov uppercase tracking-widest font-bold"
                      >
                        Verify
                      </button>
                    </div>
                  )}

                  {captchaError && !captchaVerified && (
                    <p className="text-red-400 text-[10px] font-mono-gov mt-2">
                      ✗ Incorrect answer. A new challenge has been generated.
                    </p>
                  )}
                </div>

                {/* Login error banner */}
                {loginError && (
                  <div className="border border-red-700/50 bg-red-900/15 px-4 py-3 flex items-start gap-2">
                    <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                    <div>
                      <p className="text-red-300 text-xs font-mono-gov font-bold">Login Failed</p>
                      <p className="text-red-400/80 text-[11px] font-mono-gov mt-0.5">{loginError}</p>
                      {loginError.toLowerCase().includes("email") && (
                        <p className="text-amber-500/80 text-[10px] font-mono-gov mt-1.5">
                          💡 Check your inbox and click the verification link sent at registration.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="relative mt-1 w-full py-3 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] transition font-bold tracking-widest uppercase text-sm font-mono-gov overflow-hidden group"
                >
                  <span className="relative z-10">Login to Portal →</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-20 transition duration-300" />
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] text-slate-600 font-mono-gov uppercase tracking-widest">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Register link */}
              <p className="text-xs text-slate-400 text-center font-mono-gov">
                New citizen?{" "}
                <span
                  onClick={() => navigate("/signup")}
                  className="text-amber-400 cursor-pointer hover:underline"
                >
                  Register on JanSahayak →
                </span>
              </p>
            </div>
          </motion.div>

          {/* Legal note */}
          <p className="text-center text-[10px] text-slate-600 mt-5 font-mono-gov leading-relaxed max-w-sm mx-auto">
            By logging in you agree to the{" "}
            <span className="text-amber-700 cursor-pointer hover:underline">Terms of Use</span> and{" "}
            <span className="text-amber-700 cursor-pointer hover:underline">Privacy Policy</span> of the
            Government of India's JanSahayak Portal.
          </p>

          {/* Helpline */}
          <div className="mt-5 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-500 font-mono-gov">
            Need help? Call <strong className="text-slate-300">1800-XXX-XXXX</strong> (Toll Free · Mon–Sat · 9AM–6PM)
          </div>
        </div>
      </main>

      {/* Footer strip */}
      <footer className="bg-[#060c18] border-t border-amber-700/20 py-3 px-6 text-center shrink-0">
        <p className="text-[10px] text-slate-600 font-mono-gov">
          © 2026 JanSahayak — Government of India &nbsp;|&nbsp;
          <span className="hover:text-amber-700 cursor-pointer"> Privacy Policy</span> &nbsp;|&nbsp;
          <span className="hover:text-amber-700 cursor-pointer"> Accessibility</span>
        </p>
      </footer>
      <div className="tricolor-bar h-1 w-full shrink-0" />
    </div>
  );
}