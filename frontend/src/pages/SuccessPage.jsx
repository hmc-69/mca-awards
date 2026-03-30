import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

export default function SuccessPage() {
  const navigate = useNavigate()
  const receiptId = localStorage.getItem('receiptId') || 'FA2026-XXXX'
  const rollNumber = localStorage.getItem('rollNumber') || 'Unknown Member'
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const colors = ['#D4AF37', '#fde68a', '#ffffff', '#b8960c']
    const fire = (particleRatio, opts) => confetti({
      origin: { y: 0.6 },
      colors,
      ...opts,
      particleCount: Math.floor(200 * particleRatio),
    })

    setTimeout(() => {
      fire(0.25, { spread: 26, startVelocity: 55 })
      fire(0.2, { spread: 60 })
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
      fire(0.1, { spread: 120, startVelocity: 45 })
    }, 400)
  }, [])

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -right-1/4 w-3/4 h-3/4 bg-gold-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-1/4 -left-1/4 w-3/4 h-3/4 bg-gold-600/5 blur-[150px] rounded-full" />

      {/* Confetti particles */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -10, x: Math.random() * 400, opacity: 0 }}
            animate={{
              y: 800,
              opacity: [0, 1, 0],
              rotate: 360
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-gold-400 rounded-full"
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card w-full max-w-sm p-10 flex flex-col items-center text-center relative z-10 border-white/10"
      >
        <div className="relative mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full"
          />
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10 }}
            className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/10 flex items-center justify-center text-5xl relative shadow-2xl backdrop-blur-md"
          >
            🏆
          </motion.div>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">Votes Locked</h1>
        <p className="text-gold-500/50 text-[10px] font-bold tracking-[0.3em] uppercase mb-10">Legend Registry Complete</p>

        <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-10 backdrop-blur-sm group">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">Transmission Receipt</p>
          <div className="flex flex-col items-center justify-center gap-1">
            <p className="text-white font-mono text-sm font-bold tracking-widest group-hover:text-gold-500 transition-colors uppercase">
              {receiptId}
            </p>
            <p className="text-gold-500/60 font-mono text-[10px] font-bold uppercase tracking-tight">
              {rollNumber}
            </p>
          </div>
        </div>

        <div className="space-y-4 w-full">
          <p className="text-green-400/80 text-[10px] font-black uppercase tracking-widest mb-4">
            "Your vote has been successfully recorded."
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.removeItem('voted')
              localStorage.removeItem('rollNumber')
              localStorage.removeItem('receiptId')
              navigate('/')
            }}
            className="btn-gold w-full h-14 relative overflow-hidden group"
          >
            <div className="absolute inset-0 glass-reflection opacity-20" />
            <span className="relative font-black tracking-[0.2em] uppercase text-xs">Return to Home</span>
          </motion.button>

          {/* <button
            onClick={() => navigate('/admin')}
            className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 font-bold text-[10px] tracking-widest uppercase hover:bg-white/[0.08] hover:text-white transition-all"
          >
            View Live Results
          </button> */}
        </div>

        <p className="text-white/10 text-[8px] font-bold uppercase tracking-[0.4em] mt-10">Class of 2026 • Immortalized</p>
      </motion.div>
    </div>
  )
}
