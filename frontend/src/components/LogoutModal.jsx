// import { motion } from "framer-motion";

// export default function LogoutModal({ onConfirm, onCancel }) {
//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

//       <motion.div
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         className="bg-slate-900 text-white p-6 rounded-2xl w-full max-w-sm border border-white/10"
//       >
//         <h2 className="text-lg font-semibold mb-2">
//           Are you sure?
//         </h2>

//         <p className="text-sm text-gray-400 mb-6">
//           You will be logged out of your account.
//         </p>

//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 border border-white/30 rounded-xl hover:bg-white/10"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={onConfirm}
//             className="px-4 py-2 bg-red-600 rounded-xl"
//           >
//             Logout
//           </button>
//         </div>
//       </motion.div>

//     </div>
//   );
// }
import { motion } from "framer-motion";

export default function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-serif-display { font-family: 'Source Serif 4', Georgia, serif; }
        .font-mono-gov      { font-family: 'JetBrains Mono', monospace; }
        .tricolor-bar       { background: linear-gradient(to right,#FF9933 33.3%,white 33.3%,white 66.6%,#138808 66.6%); }
      `}</style>

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0a1628] border border-red-700/40 w-full max-w-sm overflow-hidden"
      >
        {/* Tricolor top */}
        <div className="tricolor-bar h-1 w-full" />

        {/* Header */}
        <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-red-700/50 bg-red-900/20 flex items-center justify-center text-base shrink-0">
            ⏻
          </div>
          <div>
            <h2 className="text-sm font-black font-serif-display text-white leading-tight">
              Confirm Logout
            </h2>
            <p className="text-[9px] font-mono-gov text-slate-500">
              JanSahayak Portal — Session Management
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="border border-red-700/20 bg-red-900/10 px-4 py-3 mb-4">
            <p className="text-xs font-mono-gov text-red-200/80 leading-relaxed">
              ⚠️ You are about to end your current session. Any unsaved progress will be lost. Please ensure all pending actions have been completed before logging out.
            </p>
          </div>
          <p className="text-[11px] font-mono-gov text-slate-500 leading-relaxed">
            For security, always log out when using a shared or public device. Your session data will be cleared immediately.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-white/10 text-slate-400 hover:border-white/20 hover:text-white transition text-[10px] font-mono-gov uppercase tracking-widest font-bold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 transition text-white text-[10px] font-mono-gov uppercase tracking-widest font-bold flex items-center justify-center gap-1.5"
          >
            <span>⏻</span> Logout
          </button>
        </div>

        {/* Tricolor bottom */}
        <div className="tricolor-bar h-0.5 w-full" />
      </motion.div>
    </div>
  );
}
