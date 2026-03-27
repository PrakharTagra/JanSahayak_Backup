import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "/favicon.png";

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("Please agree to the Terms of Use to proceed.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }
      // ✅ Don't navigate to dashboard — show "check your email" state
      setSignupDone(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      alert(data.message || "Verification email resent!");
    } catch {
      alert("Could not resend. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#060e1f] text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
        .gov-grid { background-image: linear-gradient(rgba(255,165,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,165,0,0.03) 1px,transparent 1px); background-size:48px 48px; }
        .tricolor-bar { background: linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #060e1f inset !important; -webkit-text-fill-color: white !important; }
      `}</style>

      {/* Tricolor top */}
      <div className="tricolor-bar h-1.5 w-full shrink-0" />

      {/* Mini header */}
      <header className="bg-[#0a1628] border-b border-amber-700/40 py-3 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="w-full max-w-md relative z-10">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="border border-amber-700/50 bg-amber-900/20 text-amber-300 text-[10px] font-mono-gov uppercase tracking-widest px-4 py-1.5 flex items-center gap-2">
              {signupDone ? <><span>📧</span> Verification Pending</> : <><span>📋</span> New Citizen Registration</>}
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
                {signupDone ? "Check Your Inbox" : "Register as Citizen"}
              </h2>
              <p className="text-slate-400 text-xs mt-1 font-mono-gov">
                {signupDone ? "ईमेल सत्यापन आवश्यक है" : "नागरिक पंजीकरण फॉर्म"}
              </p>
            </div>

            {/* ── POST-SIGNUP: Check your email screen ── */}
            {signupDone ? (
              <div className="px-8 py-10 flex flex-col items-center gap-5 text-center">
                <div className="text-6xl">📧</div>

                <div>
                  <p className="text-amber-400 font-bold font-mono-gov text-sm uppercase tracking-widest">
                    Verification Email Sent
                  </p>
                  <p className="text-slate-400 text-xs mt-3 font-mono-gov leading-relaxed">
                    A verification link has been sent to{" "}
                    <span className="text-white font-bold">{email}</span>.
                    <br /><br />
                    Please click the link in that email to activate your account.
                    You will not be able to log in until your email is verified.
                  </p>
                </div>

                {/* Resend option */}
                <div className="w-full border border-white/5 bg-white/5 px-4 py-3 text-[10px] text-slate-500 font-mono-gov text-center leading-relaxed">
                  Didn't receive it? Check your spam folder or{" "}
                  <span
                    onClick={handleResend}
                    className="text-amber-500 cursor-pointer hover:underline"
                  >
                    click here to resend
                  </span>
                  .<br />
                  The link expires in <span className="text-slate-400">24 hours</span>.
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] transition font-bold tracking-widest uppercase text-sm font-mono-gov"
                >
                  Go to Login →
                </button>

                <button
                  onClick={() => { setSignupDone(false); setEmail(""); setName(""); setPassword(""); setAgreed(false); }}
                  className="text-[10px] text-slate-600 hover:text-amber-500 font-mono-gov transition cursor-pointer underline"
                >
                  Use a different email? Register again
                </button>
              </div>

            ) : (

              /* ── SIGNUP FORM ── */
              <div className="px-8 py-8">
                {/* Info note */}
                <div className="border border-amber-700/30 bg-amber-900/10 text-amber-200/80 text-[10px] font-mono-gov px-4 py-2.5 mb-6 leading-relaxed">
                  ℹ️ Registration is free and open to all Indian citizens. Your details are stored
                  securely as per the IT Act, 2000.
                </div>

                <form onSubmit={handleSignup} className="flex flex-col gap-5">

                  {/* Full Name */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="As per Aadhaar card"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 focus:outline-none text-white placeholder-slate-600 text-sm font-mono-gov transition"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Email Address <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      required
                      className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 focus:outline-none text-white placeholder-slate-600 text-sm font-mono-gov transition"
                    />
                    <p className="text-[10px] text-slate-600 mt-1 font-mono-gov">
                      A verification link will be sent to this email.
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-[10px] font-mono-gov text-slate-500 uppercase tracking-widest block mb-1.5">
                      Create Password <span className="text-amber-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#060e1f] border border-white/10 focus:border-amber-600/60 focus:outline-none text-white placeholder-slate-600 text-sm font-mono-gov transition pr-16"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition text-[10px] font-mono-gov"
                      >
                        {showPass ? "HIDE" : "SHOW"}
                      </button>
                    </div>
                    {/* Password strength bar */}
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-0.5 flex-1 transition-colors duration-300 ${
                            password.length === 0 ? "bg-white/10"
                            : password.length < 6 && i <= 1 ? "bg-red-500"
                            : password.length < 8 && i <= 2 ? "bg-orange-500"
                            : password.length < 12 && i <= 3 ? "bg-amber-400"
                            : "bg-green-500"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1 font-mono-gov">
                      Use letters, numbers and special characters for a strong password.
                    </p>
                  </div>

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      onClick={() => setAgreed(!agreed)}
                      className={`mt-0.5 w-4 h-4 shrink-0 border transition flex items-center justify-center ${
                        agreed ? "border-amber-500 bg-amber-600" : "border-slate-600 bg-transparent group-hover:border-amber-700"
                      }`}
                    >
                      {agreed && <span className="text-white text-[10px] leading-none">✓</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono-gov leading-relaxed">
                      I agree to the{" "}
                      <span className="text-amber-500 hover:underline cursor-pointer">Terms of Use</span> and{" "}
                      <span className="text-amber-500 hover:underline cursor-pointer">Privacy Policy</span>{" "}
                      of the JanSahayak Portal, Government of India.
                    </p>
                  </label>

                  {/* Error banner */}
                  {error && (
                    <div className="border border-red-700/50 bg-red-900/15 px-4 py-3 flex items-start gap-2">
                      <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                      <p className="text-red-300 text-xs font-mono-gov">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative mt-1 w-full py-3 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition font-bold tracking-widest uppercase text-sm font-mono-gov overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {loading ? "Registering…" : "Register Now →"}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-20 transition duration-300" />
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] text-slate-600 font-mono-gov uppercase tracking-widest">or</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <p className="text-xs text-slate-400 text-center font-mono-gov">
                  Already registered?{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-amber-400 cursor-pointer hover:underline"
                  >
                    Login to Portal →
                  </span>
                </p>
              </div>
            )}
          </motion.div>

          {/* Helpline */}
          <div className="mt-5 border border-white/5 bg-white/5 py-2 px-4 text-center text-[10px] text-slate-500 font-mono-gov">
            Need help? Call <strong className="text-slate-300">1800-XXX-XXXX</strong> (Toll Free · Mon–Sat · 9AM–6PM)
          </div>
        </div>
      </main>

      {/* Footer */}
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
