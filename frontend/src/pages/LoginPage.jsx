import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 3,
}))

export default function LoginPage() {
  const navigate = useNavigate()
  const [rollNumber, setRollNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateRollNumber = (roll) => {
    const regex = /^chn24mca-20[0-9]{2}$/
    return regex.test(roll.toLowerCase().trim())
  }

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setError('')
    
    const formattedRoll = rollNumber.toLowerCase().trim()
    
    if (!formattedRoll) {
      setError('Please enter your roll number.')
      return
    }

    if (!validateRollNumber(formattedRoll)) {
      setError('Invalid format. Use chn24mca-20xx')
      return
    }

    setLoading(true)
    try {
      const res = await axios.get(`/api/vote-status?rollNumber=${formattedRoll}`)
      localStorage.setItem('rollNumber', formattedRoll)
      
      if (res.data.voted) {
        localStorage.setItem('voted', 'true')
        navigate('/success')
      } else {
        localStorage.removeItem('voted')
        navigate('/vote')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gold-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gold-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gold-200"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card p-10 w-full max-w-sm text-center relative z-10 border-white/10"
      >
        <div className="w-20 h-20 rounded-[2rem] bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <span className="text-5xl drop-shadow-2xl">🏆</span>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Farewell Awards</h1>
        <p className="text-gold-500/40 text-[10px] font-bold tracking-[0.3em] uppercase mb-10">Class of 2026 • Official Portal</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              className="glass-input pl-12 lowercase"
              placeholder="chn24mca-20xx"
              value={rollNumber}
              onChange={e => { setRollNumber(e.target.value); setError('') }}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-400 text-[10px] font-bold uppercase tracking-wider"
            >
              {error}
            </motion.p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full h-14 relative overflow-hidden group"
          >
            <div className="absolute inset-0 glass-reflection opacity-20 group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative font-black tracking-[0.2em] uppercase text-xs">
              {loading ? 'Authenticating...' : 'Continue to Vote'}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
            Verify your identity using your <br /> assigned student roll number.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
