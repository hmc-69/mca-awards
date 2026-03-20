import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 3,
}))

const FEATURED = [
  { emoji: '😴', label: 'Mr / Ms Sleepy Head' },
  { emoji: '😂', label: 'Class Comedian' },
  { emoji: '⚡', label: 'Future CEO' },
  { emoji: '📸', label: 'Most Photogenic' },
]

const DEADLINE = new Date('2026-03-23T18:00:00+05:30')

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, target - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(Math.max(0, target - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])
  const d = Math.floor(timeLeft / 86400000)
  const h = Math.floor((timeLeft % 86400000) / 3600000)
  const m = Math.floor((timeLeft % 3600000) / 60000)
  const s = Math.floor((timeLeft % 60000) / 1000)
  return { d, h, m, s }
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { d, h, m, s } = useCountdown(DEADLINE.getTime())

  const handleStart = () => {
    if (localStorage.getItem('voted') === 'true') {
      navigate('/success')
    } else {
      navigate('/vote')
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030303] overflow-hidden">
      {/* Dynamic Glass Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 60, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-gold-500/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[40%] -right-[15%] w-[60%] h-[60%] bg-gold-600/5 blur-[100px] rounded-full"
        />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gold-200"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -40, 0], opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12">
            <span className="text-gold-500 text-xl">🏆</span>
          </div>
          <span className="text-gold-500 font-bold text-sm tracking-[0.3em] ml-1">FA'26</span>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="w-10 h-10 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-center text-gold-500 hover:bg-gold-500/10 transition-all duration-300"
          aria-label="Admin"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center px-6 pt-12 pb-10 text-center">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-gold-400 blur-3xl opacity-20 scale-150" />
            <div className="relative w-24 h-24 rounded-3xl glass-card flex items-center justify-center border-white/20 shadow-gold-500/10 shadow-2xl">
              <span className="text-6xl drop-shadow-2xl translate-y-[-2px]">🏆</span>
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl font-serif font-bold leading-[1.1] mb-4"
        >
          <span className="text-white/90">Farewell</span>
          <br />
          <span className="gold-gradient-text drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">Awards 2026</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/50 text-base mt-2 mb-10 leading-relaxed max-w-[280px]"
        >
          The official voting portal for the Class of 2026. Crown your{' '}
          <span className="text-gold-400/90 font-semibold italic">legends</span>.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gold-500/20 blur-2xl rounded-full" />
          <button
            onClick={handleStart}
            className="btn-gold relative px-10 py-4 text-lg group overflow-hidden"
            id="start-voting-btn"
          >
            <div className="absolute inset-0 glass-reflection opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10">Start Voting</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-col items-center"
        >
          <span className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Voting Ends In</span>
          <div className="flex gap-4">
            {[
              { val: d, unit: 'D' },
              { val: h, unit: 'H' },
              { val: m, unit: 'M' },
              { val: s, unit: 'S' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-white/80 font-mono font-bold text-xl leading-none">{item.val.toString().padStart(2, '0')}</span>
                <span className="text-gold-500/40 text-[9px] font-bold mt-1">{item.unit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Featured Categories */}
      <div className="relative z-10 px-6 pb-12 mt-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-6"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <h2 className="text-white/40 font-bold text-[10px] tracking-[0.3em] uppercase whitespace-nowrap">Featured Categories</h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4">
          {FEATURED.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.97 }}
              className="glass-card p-5 flex flex-col items-center gap-3 cursor-pointer group hover:bg-white/[0.06] transition-all border-white/5 active:border-gold-500/30"
              onClick={handleStart}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/[0.02] flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110">
                {cat.emoji}
              </div>
              <span className="text-white/60 text-[10px] text-center font-bold tracking-wide leading-tight px-1 group-hover:text-white/90 transition-colors uppercase">
                {cat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 px-6 pb-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-6 border-gold-500/10 flex items-center gap-5 bg-gradient-to-br from-white/[0.04] to-transparent"
        >
          <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center shrink-0 border border-gold-500/20">
            <span className="text-3xl">🎭</span>
          </div>
          <div>
            <p className="text-gold-500 text-[10px] font-black tracking-[0.2em] uppercase">The Grand Reveal</p>
            <p className="text-white/90 font-bold mt-1">Gala Night 2026</p>
            <p className="text-white/40 text-[11px] mt-1 leading-relaxed">Results ceremony and award handovers in the Ballroom on June 12th.</p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Blur */}
      <div className="fixed -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-gold-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  )
}
