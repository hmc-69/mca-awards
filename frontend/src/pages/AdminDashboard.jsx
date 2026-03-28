import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { db } from '../firebase'
import { collection, getDocs, query, orderBy, writeBatch, doc } from 'firebase/firestore'

const ADMIN_SECRET = 'farewell2026admin'
const ADMIN_KEY = 'farewell2026admin'

const AWARD_LABELS = {
  sleepy_head:          { label: 'Mr/Ms Sleepy Head',     emoji: '😴' },
  class_comedian:       { label: 'Class Comedian',         emoji: '😂' },
  late_comer:           { label: 'Late Comer',             emoji: '⏰' },
  silent_assassin:      { label: 'Silent Assassin',        emoji: '😶' },
  future_ceo:           { label: 'Future CEO',             emoji: '💼' },
  fashion_icon:         { label: 'Fashion Icon',           emoji: '👑' },
  photogenic:          { label: 'Most Photogenic',        emoji: '📸' },
  friend_everyone_needs: { label: 'Friend Everyone Needs',  emoji: '🤗' },
  brain_of_batch:        { label: 'Brain of the Batch',     emoji: '🧠' },
  future_professor:     { label: 'Future Professor',       emoji: '📚' },
}

const GOLD_SHADES = ['#D4AF37', '#fde68a', '#b8960c', '#fbbf24', '#92700a']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card bg-white/[0.05] border-gold-500/30 px-3 py-2 text-xs">
      <p className="text-gold-400 font-bold uppercase tracking-widest text-[10px] mb-1">{label}</p>
      <p className="text-white/90 font-mono">{payload[0]?.value} Votes</p>
    </div>
  )
}

function LeaderboardTab({ results }) {
  if (!results) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
      <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase">Calculating Standings...</p>
    </div>
  )
  const categories = Object.entries(AWARD_LABELS).filter(([key]) => results[key]?.length > 0)
  const featured = categories.slice(0, 3).map(([key]) => {
    const top = (results[key] || []).slice(0, 3)
    return { key, ...AWARD_LABELS[key], top }
  })

  return (
    <div className="space-y-8">
      {/* Top Contenders across all categories */}
      <div className="glass-card p-6 bg-gradient-to-br from-gold-500/[0.05] to-transparent border-gold-500/10">
        <h3 className="text-gold-500 font-black text-[10px] tracking-[0.3em] uppercase mb-6 text-center">🏆 Hall of Legends</h3>
        <div className="flex gap-4 justify-center items-end">
          {featured.flatMap(f => f.top).sort((a,b) => b.count - a.count).slice(0, 3).map((entry, i) => {
            const height = [100, 80, 65][i]
            const medal = ['🥇','🥈','🥉'][i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-3 flex-1 min-w-0"
              >
                <div className="relative group">
                  <div className={`w-16 h-16 rounded-3xl bg-white/[0.03] border ${i === 0 ? 'border-gold-500/50 shadow-lg shadow-gold-500/20' : 'border-white/10'} flex items-center justify-center text-3xl z-10 relative backdrop-blur-md`}>
                    {medal}
                  </div>
                  {i === 0 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl drop-shadow-lg">👑</div>}
                </div>
                <div className="text-center w-full">
                  <p className="text-white text-xs font-bold truncate px-1 uppercase tracking-tight">{entry.name}</p>
                  <p className="text-gold-500/50 font-mono text-[10px] font-bold mt-1">{entry.count} PTS</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-4">
        <h3 className="text-white/30 font-bold text-[10px] tracking-[0.3em] uppercase ml-1">Live Standings</h3>
        {categories.map(([key]) => {
          const cat = AWARD_LABELS[key]
          const entries = results[key] || []
          const total = entries.reduce((s, e) => s + e.count, 0)
          return (
            <motion.div 
              key={key} 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="glass-card p-5 hover:bg-white/[0.05] transition-all group"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.02] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {cat.emoji}
                  </div>
                  <span className="text-white/90 text-[11px] font-black uppercase tracking-wider">{cat.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-gold-500 font-mono text-[10px] font-bold block">{total}</span>
                  <span className="text-white/20 text-[8px] font-black uppercase tracking-tighter">TOTAL VOTES</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {entries.slice(0, 3).map((entry, i) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between text-[10px] font-bold mb-1.5 px-0.5">
                      <span className="text-white/50 uppercase tracking-tight">{entry.name}</span>
                      <span className="text-gold-500/80">{total > 0 ? Math.round((entry.count / total) * 100) : 0}%</span>
                    </div>
                    <div className="h-1 bg-white/[0.02] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: total > 0 ? `${(entry.count / total) * 100}%` : '0%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                        className={`h-full rounded-full ${i === 0 ? 'bg-gold-500' : 'bg-white/20'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function CategoriesTab({ results }) {
  if (!results) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
      <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase">Preparing Analytics...</p>
    </div>
  )
  const categories = Object.entries(AWARD_LABELS)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <h3 className="text-white/30 font-bold text-[10px] tracking-[0.3em] uppercase ml-1">Distribution Analysis</h3>
      </div>
      {categories.map(([key]) => {
        const cat = AWARD_LABELS[key]
        const entries = (results[key] || []).slice(0, 5)
        if (entries.length === 0) return null
        const chartData = entries.map(e => ({ name: e.name.split(' ')[0], votes: e.count }))
        return (
          <motion.div 
            key={key} 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 border-white/5 relative overflow-hidden group"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-white font-bold text-xs uppercase tracking-widest">{cat.label}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="votes" radius={[12, 12, 4, 4]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={GOLD_SHADES[i % GOLD_SHADES.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )
      })}
    </div>
  )
}

function AuditLogTab({ votes }) {
  if (!votes) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin" />
      <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase">Retrieving Audit Logs...</p>
    </div>
  )
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/30 font-bold text-[10px] tracking-[0.3em] uppercase ml-1">Transmission History</h3>
        <span className="text-gold-500/40 text-[9px] font-black uppercase tracking-widest">{votes.length} Records</span>
      </div>
      {votes.length === 0 && (
        <div className="glass-card p-12 text-center">
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest italic">No Data Stream Found</p>
        </div>
      )}
      <div className="space-y-3">
        {votes.slice(0, 50).map((vote, i) => (
          <motion.div
            key={vote.id || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="glass-card p-5 border-white/5 flex items-start gap-4 hover:bg-white/[0.04] transition-all group"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-gold-500/5">
              <span className="text-lg opacity-40 group-hover:opacity-100 transition-opacity">🔐</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className="text-white/90 text-[11px] font-black uppercase tracking-wider">Vote Packet Verified</p>
                <span className="text-white/20 font-mono text-[9px] font-bold">
                  {vote.created_at?.toDate ? vote.created_at.toDate().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                </span>
              </div>
              <p className="text-white/30 text-[9px] font-mono tracking-tighter truncate font-bold">
                TRACE: {(vote.roll_number || vote.id || '').toUpperCase()}
              </p>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[8px] font-bold text-gold-500/60 uppercase tracking-widest border border-white/5">
                  Secure
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[8px] font-bold text-white/30 uppercase tracking-widest border border-white/5">
                  Class'26
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [results, setResults] = useState(null)
  const [votes, setVotes] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [secretInput, setSecretInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' })

  const secretFromURL = searchParams.get('secret')

  useEffect(() => {
    if (secretFromURL === ADMIN_SECRET) setAuthenticated(true)
    else {
      const stored = sessionStorage.getItem('adminSecret')
      if (stored === ADMIN_SECRET) setAuthenticated(true)
    }
  }, [secretFromURL])

  useEffect(() => {
    if (!authenticated) return
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [authenticated])

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'votes'), orderBy('created_at', 'desc'))
      const snapshot = await getDocs(q)
      const allVotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter(v => v.is_active !== false)
      
      // Client-side aggregation
      const aggregatedResults = {}
      Object.keys(AWARD_LABELS).forEach(field => {
        const counts = {}
        allVotes.forEach(doc => {
          const name = doc[field]?.trim()
          if (name) counts[name] = (counts[name] || 0) + 1
        })
        aggregatedResults[field] = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      })

      setVotes(allVotes)
      setResults(aggregatedResults)
    } catch (err) {
      console.error('Failed to fetch firestore data', err)
    }
  }

  const handleAuth = () => {
    if (secretInput === ADMIN_SECRET) {
      sessionStorage.setItem('adminSecret', ADMIN_SECRET)
      setAuthenticated(true)
    } else {
      setAuthError('Invalid admin password!')
    }
  }

  const handleReset = async (mode = 'hard') => {
    setIsResetting(true)
    setResetMessage({ text: '', type: '' })
    try {
      const q = query(collection(db, 'votes'))
      const snapshot = await getDocs(q)
      const batch = writeBatch(db)
      
      snapshot.docs.forEach((docSnap) => {
        if (mode === 'hard') {
          batch.delete(docSnap.ref)
        } else {
          batch.update(docSnap.ref, { is_active: false })
        }
      })
      
      await batch.commit()
      
      setResetMessage({ text: 'Database Reset Successful!', type: 'success' })
      setTimeout(() => {
        setIsResetModalOpen(false)
        setResetMessage({ text: '', type: '' })
        fetchData()
      }, 2000)
    } catch (err) {
      console.error('Reset failed', err)
      setResetMessage({ text: 'Critical: Failed to reset database.', type: 'error' })
    } finally {
      setIsResetting(false)
    }
  }

  // Login gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gold-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gold-600/10 blur-[120px] rounded-full" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 w-full max-w-sm text-center relative z-10 border-white/10"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Admin Terminal</h1>
          <p className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-8">Authorizing Personnel Only</p>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                className="glass-input pl-12"
                placeholder="Access Key"
                value={secretInput}
                onChange={e => { setSecretInput(e.target.value); setAuthError('') }}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>
            
            {authError && <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">{authError}</p>}
            
            <button onClick={handleAuth} className="btn-gold w-full h-14 relative overflow-hidden group">
              <div className="absolute inset-0 glass-reflection opacity-20 group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative font-black tracking-[0.2em] uppercase text-xs">Initialize Dashboard</span>
            </button>
            
            <button onClick={() => navigate('/')} className="text-white/20 text-[10px] font-bold uppercase tracking-widest hover:text-white/40 transition-colors pt-4 block w-full">
              ← Return to Civilian Site
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const TABS = [
    { id: 'leaderboard', label: 'Rankings', icon: '🏆' },
    { id: 'categories',  label: 'Analytics', icon: '📊' },
    { id: 'auditlog',    label: 'History',   icon: '📋' },
  ]

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] -left-[5%] w-[40%] h-[40%] bg-gold-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] -right-[5%] w-[40%] h-[40%] bg-gold-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4 glass-panel border-b-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-3xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shadow-lg shadow-gold-500/10">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h1 className="text-white font-black text-sm uppercase tracking-widest leading-none mb-1">Command Center</h1>
            <p className="text-gold-500/40 text-[9px] font-bold uppercase tracking-[0.2em]">{votes?.length ?? '—'} Data Packets</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-all shadow-lg shadow-red-500/10"
            title="Wipe Database"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={fetchData}
            className="w-11 h-11 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:bg-white/[0.08] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 px-6 mt-6">
        <div className="flex p-1.5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] backdrop-blur-md">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-dark-800 shadow-xl shadow-gold-500/20'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 pb-32 scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            {activeTab === 'leaderboard' && <LeaderboardTab results={results} />}
            {activeTab === 'categories'  && <CategoriesTab  results={results} />}
            {activeTab === 'auditlog'    && <AuditLogTab    votes={votes} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Glass Bottom Nav */}
      <div className="fixed bottom-8 left-6 right-6 z-[60]">
        <div className="glass-panel p-2 flex items-center gap-2">
          {[
            { icon: '🏠', action: () => navigate('/') },
            { icon: '📊', action: () => setActiveTab('leaderboard') },
            { icon: '📋', action: () => setActiveTab('auditlog') },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className="flex-1 py-4 glass-card border-white/5 bg-white/[0.02] flex items-center justify-center text-xl hover:bg-white/[0.08] transition-all">
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isResetting && setIsResetModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm glass-card p-10 border-red-500/20 bg-gradient-to-b from-red-500/[0.03] to-transparent text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] border border-red-500/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/10">
                <span className="text-4xl">☣️</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Erase All Data?</h2>
              <p className="text-white/40 text-sm mb-10 leading-relaxed px-2 font-medium">
                {resetMessage.text ? (
                  <span className={resetMessage.type === 'success' ? 'text-green-400 font-black uppercase tracking-[0.2em] text-[10px]' : 'text-red-400'}>
                    {resetMessage.text}
                  </span>
                ) : (
                  "Initiating a hard reset will permanently purge all votes from the database archives."
                )}
              </p>

              {!resetMessage.text && (
                <div className="space-y-4">
                  <button
                    disabled={isResetting}
                    onClick={() => handleReset('hard')}
                    className={`w-full py-5 rounded-3xl font-black text-xs tracking-[0.3em] uppercase transition-all relative overflow-hidden group ${isResetting ? 'bg-red-500/20 text-red-500/50 cursor-not-allowed' : 'bg-red-600 text-white shadow-2xl shadow-red-600/40 hover:bg-red-500'}`}
                  >
                    {isResetting ? "Purging Archives..." : "Execute Wipe"}
                  </button>
                  <button
                    disabled={isResetting}
                    onClick={() => setIsResetModalOpen(false)}
                    className="w-full py-4 text-white/20 font-black text-[10px] tracking-widest uppercase hover:text-white/50 transition-colors"
                  >
                    Abort Mission
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
