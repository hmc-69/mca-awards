import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const AWARDS = [
  { key: 'sleepy_head',          emoji: '😴', title: 'Mr / Ms Sleepy Head',       desc: 'The one who mastered the art of sleeping during lectures without getting caught.' },
  { key: 'class_comedian',       emoji: '😂', title: 'Class Comedian',             desc: 'The human antidepressant who kept the mood light during exams.' },
  { key: 'late_comer',           emoji: '⏰', title: 'Late Comer',                 desc: 'Always promising "I\'ll be there in 5 min" — adds 30 every time.' },
  { key: 'silent_assassin',      emoji: '😶', title: 'Silent Assassin',            desc: 'Quiet in the halls, but surprisingly loud with their achievements.' },
  { key: 'future_ceo',           emoji: '💼', title: 'Future CEO',                 desc: 'Already has a startup idea, a LinkedIn, and three side hustles.' },
  { key: 'fashion_icon',         emoji: '👑', title: 'Fashion Icon',               desc: 'Turns every campus day into a runway show.' },
  { key: 'photogenic',          emoji: '📸', title: 'Most Photogenic',            desc: 'Looks great from every angle — even candid shots.' },
  { key: 'friend_everyone_needs', emoji: '🤗', title: 'Friend Everyone Needs',      desc: 'Always there with advice, a snack, or a shoulder to lean on.' },
  { key: 'brain_of_batch',        emoji: '🧠', title: 'Brain of the Batch',         desc: 'The walking encyclopedia everyone texts before exams.' },
  { key: 'future_professor',     emoji: '📚', title: 'Most Likely to Become Prof', desc: 'Explains concepts better than the professors themselves.' },
]

export default function VotingPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [votes, setVotes] = useState({})
  const [inputVal, setInputVal] = useState('')
  const [error, setError] = useState('')
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)
  const rollNumber = localStorage.getItem('rollNumber')

  useEffect(() => {
    if (!rollNumber) {
      navigate('/', { replace: true })
      return
    }

    const checkVoteStatus = async () => {
      if (localStorage.getItem('voted') === 'true') {
        try {
          const docRef = doc(db, 'votes', rollNumber)
          const docSnap = await getDoc(docRef)
          if (!docSnap.exists() || docSnap.data().is_active === false) {
            localStorage.removeItem('voted')
            localStorage.removeItem('receiptId')
          } else {
            navigate('/success', { replace: true })
          }
        } catch (err) {
          console.error('Failed to verify vote status', err)
        }
      }
    }
    
    checkVoteStatus()
  }, [rollNumber, navigate])

  useEffect(() => {
    setInputVal(votes[AWARDS[current].key] || '')
    setError('')
  }, [current, votes])

  const award = AWARDS[current]
  const progress = ((current + 1) / AWARDS.length) * 100
  const isLast = current === AWARDS.length - 1

  const handleNext = async () => {
    const val = inputVal.trim()
    if (!val) { setError('Please nominate a classmate before continuing!'); return }
    const newVotes = { ...votes, [award.key]: val }
    setVotes(newVotes)

    if (isLast) {
      await submit(newVotes)
      return
    }
    setDirection(1)
    setCurrent(c => c + 1)
  }

  const handleBack = () => {
    if (current === 0) { navigate('/'); return }
    setDirection(-1)
    setCurrent(c => c - 1)
  }

  const submit = async (finalVotes) => {
    setLoading(true)
    setError('')
    try {
      const receiptId = `FA2026-${Math.floor(1000 + Math.random() * 9000)}`
      const voteData = {
        ...finalVotes,
        roll_number: rollNumber,
        receiptId: receiptId,
        created_at: serverTimestamp(),
        is_active: true
      }

      const docRef = doc(db, 'votes', rollNumber)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists() && docSnap.data().is_active !== false) {
        localStorage.setItem('voted', 'true')
        localStorage.setItem('receiptId', docSnap.data().receiptId || 'VOTE-SUBMITTED')
        navigate('/success')
        return
      }

      await setDoc(docRef, voteData)
      
      localStorage.setItem('voted', 'true')
      localStorage.setItem('receiptId', receiptId)
      navigate('/success')
    } catch (err) {
      console.error(err)
      setError('Failed to record votes. Please try again.')
      setLoading(false)
    }
  }

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0, scale: 0.98 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? -50 : 50, opacity: 0, scale: 0.98 }),
  }

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-gold-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-gold-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
        <button 
          onClick={handleBack} 
          className="w-10 h-10 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/[0.08] transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-gold-500 font-bold tracking-[0.3em] text-[10px] uppercase">Farewell 2026</span>
          <span className="text-white/20 text-[9px] font-bold mt-0.5 tracking-widest uppercase">Voting Portal</span>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center justify-center">
          <span className="text-gold-500/50 text-xs font-bold">{current + 1}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 px-6 mb-8">
        <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden backdrop-blur-sm">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-600 to-gold-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-6 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="flex-1 flex flex-col"
          >
            {/* Award Card */}
            <div className="glass-card flex-1 p-8 border-white/10 flex flex-col relative overflow-hidden mb-6">
              {/* Decorative Reflection */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex flex-col items-center text-center flex-1 justify-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={`emoji-${current}`}
                  className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center text-6xl mb-6 relative group"
                >
                  <div className="absolute inset-0 bg-gold-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative drop-shadow-2xl">{award.emoji}</span>
                </motion.div>
                
                <h2 className="text-white font-bold text-2xl tracking-tight mb-3 px-4">
                  {award.title}
                </h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-[240px]">
                  {award.desc}
                </p>
              </div>

              {/* Input Section */}
              <div className="mt-auto">
                <div className="relative">
                  <input
                    id={`vote-input-${award.key}`}
                    type="text"
                    className="glass-input pl-12"
                    placeholder="Nominate someone..."
                    value={inputVal}
                    onChange={e => { setInputVal(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    autoFocus
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/40">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-[11px] font-bold mt-3 text-center uppercase tracking-wider"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Footer Actions */}
      <div className="relative z-10 px-6 py-8 glass-panel">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-xl hover:bg-white/[0.08] transition-all"
          >
            🏠
          </button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            disabled={loading}
            className="flex-1 btn-gold relative h-12 overflow-hidden"
          >
            <div className="absolute inset-0 glass-reflection opacity-20" />
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Finalizing...
              </span>
            ) : isLast ? (
              <span className="flex items-center gap-2">
                Submit Votes <span className="text-xl">✨</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 font-black tracking-widest text-[11px] uppercase">
                Next Award
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
