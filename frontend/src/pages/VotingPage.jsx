import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { STUDENTS } from '../constants'

const AWARDS = [
  { key: 'kumbhakarnan', title: 'കുംഭകർണ്ണൻ 😴', subtitle: 'Kumbhakarnan', desc: 'ഉറക്കം ഒരു ഹോബിയല്ല, ജീവിതശൈലിയാക്കിയ ആൾ. ബെഞ്ചും ഡെസ്കും ഉണ്ടെങ്കിൽ പുള്ളി ഹാപ്പി!' },
  { key: 'maveli', title: 'മാവേലി 🎭', subtitle: 'Maveli', desc: 'അറ്റൻഡൻസ് ഷീറ്റിലെ അത്യപൂർവ്വ പ്രതിഭാസം. വർഷത്തിലൊരിക്കൽ മാത്രം കാണപ്പെടുന്ന പുണ്യജന്മം.' },
  { key: 'best_couple', title: 'Best Couple 🌈', subtitle: '', desc: 'You know whom to vote 😉' },
  { key: 'kozhi', title: 'ഗിരി രാജൻ കോഴി 🐔', subtitle: 'Giriraajan Kozhi', desc: 'വായിനോക്കി തളരാത്ത പോരാളി. കോളേജിലെ എല്ലാ ഡിപ്പാർട്മെന്റിലും ഓരോ CRUSH കാണും.' },
  { key: 'pavanaayi', title: 'പവനായി 📊', subtitle: 'Pavanaayi', desc: 'Planning 📈, Execution📉' },
  { key: 'neelakuyil', title: 'നീലക്കുയിൽ 📸', subtitle: 'Neelakkuyil', desc: 'ആവശ്യമായതും ഇല്ലാത്തതുമായിട്ടുള്ള എല്ലാ photos/videos ഇവരുടെ കയ്യിൽ കാണും.' },
  { key: 'nagavalli', title: 'നാഗവല്ലി 😶‍🌫️', subtitle: 'Nagavalli', desc: 'ഇപ്പോൾ ചിരിക്കും, അടുത്ത സെക്കൻഡിൽ കലിപ്പാവും! അസ്സൽ ഗംഗയെപ്പോലെ പാവമായി വന്നിട്ട് പെട്ടെന്ന് പൊട്ടിത്തെറിക്കും.' },
  { key: 'pakalmaanyan', title: 'പകൽ മാന്യൻ 🌙', subtitle: 'Pakal Maanyan', desc: 'സ്റ്റാഫിന് മുന്നിൽ \'അയ്യോ പാവം\', പക്ഷെ പുറത്ത് ...' },
  { key: 'jetairways', title: 'ജെറ്റ് എയർവേയ്സ് ✈️', subtitle: 'Jet Airways', desc: 'എപ്പോഴും AIR-ൽ. വാ തുറന്നാൽ അപ്പൊ തന്നെ പറക്കും!' },
  { key: 'valli', title: 'വള്ളി 🧠', subtitle: 'Valli', desc: 'വള്ളി പിടിക്കുന്ന കാര്യത്തിൽ ഒന്നൊന്നര എക്സ്പെർട്ട്. നോക്കി നിന്നാൽ മതി, പണി കിട്ടും!' }
]

export default function VotingPage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [votes, setVotes] = useState({})
  const [inputVal, setInputVal] = useState('')
  const [inputVal2, setInputVal2] = useState('')
  const [error, setError] = useState('')
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isOpen2, setIsOpen2] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeIndex2, setActiveIndex2] = useState(0)
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
    const existingVote = votes[AWARDS[current].key]
    if (AWARDS[current].key === 'best_couple' && existingVote) {
      const parts = existingVote.split(' & ')
      setInputVal(parts[0] || '')
      setInputVal2(parts[1] || '')
    } else {
      setInputVal(existingVote || '')
      setInputVal2('')
    }
    setError('')
  }, [current, votes])

  const award = AWARDS[current]
  const progress = ((current + 1) / AWARDS.length) * 100
  const isLast = current === AWARDS.length - 1

  const filteredStudents = STUDENTS.filter(s =>
    s.toLowerCase().includes(inputVal.toLowerCase())
  ).slice(0, 8)

  const filteredStudents2 = STUDENTS.filter(s =>
    s.toLowerCase().includes(inputVal2.toLowerCase())
  ).slice(0, 8)

  const handleSelect = (name, isSecond = false) => {
    if (isSecond) {
      setInputVal2(name)
      setIsOpen2(false)
      setActiveIndex2(0)
    } else {
      setInputVal(name)
      setIsOpen(false)
      setActiveIndex(0)
    }
  }

  const handleNext = async () => {
    let val
    if (award.key === 'best_couple') {
      const v1 = inputVal.trim()
      const v2 = inputVal2.trim()
      if (!v1 || !v2) {
        setError('Please select two classmates for Best Couple!')
        return
      }
      if (v1 === v2) {
        setError('Please select two different people!')
        return
      }
      val = `${v1} & ${v2}`
    } else {
      val = inputVal.trim()
      if (!val) {
        setError('Please nominate a classmate before continuing!')
        return
      }
    }

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
                  key={`media-${current}`}
                  className="w-32 h-32 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gold-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <video src={`/awards/${award.key}.mp4`} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover rounded-3xl z-10" onError={(e) => { e.target.parentElement.style.display = 'none'; }} />
                </motion.div>

                <h2 className="text-white font-bold text-2xl tracking-tight mb-1 px-4">
                  {award.title}
                </h2>
                {award.subtitle && (
                  <p className="text-gold-500/80 text-xs font-bold uppercase tracking-widest mb-4">
                    {award.subtitle}
                  </p>
                )}
                <p className="text-white/40 text-sm leading-relaxed max-w-[280px]">
                  {award.desc}
                </p>
              </div>

              {/* Input Section */}
              <div className="mt-auto relative w-full flex flex-col items-center">
                <div className={`w-full flex ${award.key === 'best_couple' ? 'flex-col sm:flex-row items-center gap-3' : 'flex-col'}`}>
                  {/* First Input */}
                  <div className="relative w-full flex-1">
                    <input
                      id={`vote-input-${award.key}-1`}
                      type="text"
                      className="glass-input pl-12 w-full"
                      placeholder="Search classmate..."
                      value={inputVal}
                      onFocus={() => { setIsOpen(true); setIsOpen2(false); }}
                      onChange={e => {
                        setInputVal(e.target.value)
                        setError('')
                        setIsOpen(true)
                        setActiveIndex(0)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault()
                          setActiveIndex(prev => (prev + 1) % filteredStudents.length)
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault()
                          setActiveIndex(prev => (prev - 1 + filteredStudents.length) % filteredStudents.length)
                        } else if (e.key === 'Enter') {
                          if (isOpen && filteredStudents.length > 0) {
                            e.preventDefault()
                            handleSelect(filteredStudents[activeIndex])
                          } else if (award.key !== 'best_couple') {
                            handleNext()
                          } else {
                            // move focus to second input
                            document.getElementById(`vote-input-${award.key}-2`)?.focus()
                          }
                        } else if (e.key === 'Escape') {
                          setIsOpen(false)
                        }
                      }}
                      autoFocus
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/40">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>

                    {/* First Dropdown */}
                    <AnimatePresence>
                      {isOpen && inputVal.length > 0 && filteredStudents.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          className="absolute bottom-full left-0 w-full mb-3 glass-card border-white/10 overflow-hidden z-50 shadow-2xl backdrop-blur-xl"
                        >
                          <div className="max-h-60 overflow-y-auto premium-scrollbar">
                            {filteredStudents.map((student, idx) => (
                              <button
                                key={student}
                                onClick={() => handleSelect(student)}
                                onMouseEnter={() => setActiveIndex(idx)}
                                className={`w-full text-left px-6 py-4 text-xs font-bold transition-all duration-200 border-b border-white/5 last:border-0 flex items-center justify-between group
                                  ${activeIndex === idx ? 'bg-gold-500/10 text-gold-500' : 'text-white/40 hover:text-white/60'}
                                `}
                              >
                                <span className="tracking-widest uppercase">{student}</span>
                                {activeIndex === idx && (
                                  <motion.span layoutId="active-indicator" className="text-gold-500 text-[10px]">SELECT</motion.span>
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {award.key === 'best_couple' && (
                    <>
                      <div className="text-gold-500/50 text-xl font-bold">+</div>

                      {/* Second Input */}
                      <div className="relative w-full flex-1">
                        <input
                          id={`vote-input-${award.key}-2`}
                          type="text"
                          className="glass-input pl-12 w-full"
                          placeholder="Search partner..."
                          value={inputVal2}
                          onFocus={() => { setIsOpen2(true); setIsOpen(false); }}
                          onChange={e => {
                            setInputVal2(e.target.value)
                            setError('')
                            setIsOpen2(true)
                            setActiveIndex2(0)
                          }}
                          onKeyDown={e => {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault()
                              setActiveIndex2(prev => (prev + 1) % filteredStudents2.length)
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault()
                              setActiveIndex2(prev => (prev - 1 + filteredStudents2.length) % filteredStudents2.length)
                            } else if (e.key === 'Enter') {
                              if (isOpen2 && filteredStudents2.length > 0) {
                                e.preventDefault()
                                handleSelect(filteredStudents2[activeIndex2], true)
                              } else {
                                handleNext()
                              }
                            } else if (e.key === 'Escape') {
                              setIsOpen2(false)
                            }
                          }}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/40">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>

                        {/* Second Dropdown */}
                        <AnimatePresence>
                          {isOpen2 && inputVal2.length > 0 && filteredStudents2.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              className="absolute bottom-full left-0 w-full mb-3 glass-card border-white/10 overflow-hidden z-50 shadow-2xl backdrop-blur-xl"
                            >
                              <div className="max-h-60 overflow-y-auto premium-scrollbar">
                                {filteredStudents2.map((student, idx) => (
                                  <button
                                    key={`second-${student}`}
                                    onClick={() => handleSelect(student, true)}
                                    onMouseEnter={() => setActiveIndex2(idx)}
                                    className={`w-full text-left px-6 py-4 text-xs font-bold transition-all duration-200 border-b border-white/5 last:border-0 flex items-center justify-between group
                                      ${activeIndex2 === idx ? 'bg-gold-500/10 text-gold-500' : 'text-white/40 hover:text-white/60'}
                                    `}
                                  >
                                    <span className="tracking-widest uppercase">{student}</span>
                                    {activeIndex2 === idx && (
                                      <motion.span layoutId="active-indicator-2" className="text-gold-500 text-[10px]">SELECT</motion.span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-[11px] font-bold mt-4 text-center uppercase tracking-wider block"
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
