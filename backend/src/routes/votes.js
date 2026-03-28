const express = require('express')
const router = express.Router()
const { db } = require('../firebase')
const { v4: uuidv4 } = require('uuid')

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'farewell2026admin'
const ADMIN_KEY = process.env.ADMIN_KEY || ADMIN_SECRET
const VOTES_COLLECTION = 'votes'

const VOTE_FIELDS = [
  'sleepy_head', 'class_comedian', 'late_comer', 'silent_assassin',
  'future_ceo', 'fashion_icon', 'photogenic', 'friend_everyone_needs',
  'brain_of_batch', 'future_professor',
]

// ─── GET /api/vote-status  (check if roll_number already voted) ─────────────
router.get('/vote-status', async (req, res) => {
  try {
    const { rollNumber } = req.query
    if (!rollNumber) return res.status(400).json({ error: 'Missing rollNumber' })
    
    const formattedRoll = String(rollNumber).toLowerCase().trim()
    const doc = await db.collection(VOTES_COLLECTION).doc(formattedRoll).get()
    
    if (doc.exists && doc.data().is_active !== false) {
      return res.json({ voted: true })
    }
    
    return res.json({ voted: false })
  } catch (err) {
    console.error('GET /vote-status error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ─── POST /api/votes  (submit a vote) ──────────────────────────────────────
router.post('/votes', async (req, res) => {
  try {
    const { rollNumber, ...fields } = req.body

    if (!rollNumber) {
      return res.status(400).json({ error: 'Missing rollNumber' })
    }

    const formattedRoll = String(rollNumber).toLowerCase().trim()
    const rollRegex = /^chn24mca-20[0-9]{2}$/

    if (!rollRegex.test(formattedRoll)) {
      return res.status(400).json({ error: 'Invalid roll number format' })
    }

    // Check for duplicate (active votes only)
    const existing = await db.collection(VOTES_COLLECTION).doc(formattedRoll).get()
    if (existing.exists && existing.data().is_active !== false) {
      return res.status(409).json({
        error: 'You have already submitted your vote.',
        receiptId: existing.data().receiptId,
      })
    }

    // Build vote document (only permitted fields)
    const voteData = { 
      roll_number: formattedRoll, 
      created_at: new Date().toISOString(),
      is_active: true // For soft reset support
    }
    VOTE_FIELDS.forEach(f => { if (fields[f]) voteData[f] = String(fields[f]).trim().slice(0, 100) })

    // Generate receipt ID
    const receiptId = `FA2026-${Math.floor(1000 + Math.random() * 9000)}`
    voteData.receiptId = receiptId

    // Save — use formattedRoll as document ID for uniqueness
    await db.collection(VOTES_COLLECTION).doc(formattedRoll).set(voteData)

    return res.status(201).json({ success: true, receiptId })
  } catch (err) {
    console.error('POST /votes error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ─── GET /api/results  (aggregated counts per category, public) ─────────────
router.get('/results', async (req, res) => {
  try {
    const snapshot = await db.collection(VOTES_COLLECTION).get()
    // Include legacy votes (where is_active is undefined) and active votes
    const docs = snapshot.docs
      .map(d => d.data())
      .filter(doc => doc.is_active !== false)

    // Aggregate top names per category
    const results = {}
    VOTE_FIELDS.forEach(field => {
      const counts = {}
      docs.forEach(doc => {
        const name = doc[field]?.trim()
        if (name) counts[name] = (counts[name] || 0) + 1
      })
      results[field] = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    })

    return res.json(results)
  } catch (err) {
    console.error('GET /results error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ─── GET /api/votes  (admin only — all vote records) ───────────────────────
router.get('/votes', async (req, res) => {
  const secret = req.headers['x-admin-secret']
  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const snapshot = await db.collection(VOTES_COLLECTION)
      .orderBy('is_active', 'desc')
      .get()

    // Include legacy votes (is_active undefined) and active votes
    const votes = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(v => v.is_active !== false)
      .slice(0, 500)

    return res.json(votes)
  } catch (err) {
    console.error('GET /votes error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
})

// ─── DELETE /api/admin/reset  (hard or soft reset) ──────────────────────────
router.delete('/admin/reset', async (req, res) => {
  const key = req.headers['x-admin-key']
  
  if (!key || key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized Access' })
  }

  try {
    const { mode = 'hard' } = req.query // Default to hard reset as requested
    const snapshot = await db.collection(VOTES_COLLECTION).get()
    
    if (snapshot.empty) {
      return res.json({ success: true, message: 'No votes to reset' })
    }

    const batch = db.batch()
    
    if (mode === 'hard') {
      snapshot.docs.forEach(doc => batch.delete(doc.ref))
    } else {
      // Soft reset: set is_active to false
      snapshot.docs.forEach(doc => batch.update(doc.ref, { is_active: false }))
    }

    await batch.commit()
    return res.json({ 
      success: true, 
      message: mode === 'hard' ? 'All votes permanently deleted' : 'All votes deactivated (soft reset)' 
    })
  } catch (err) {
    console.error('DELETE /admin/reset error:', err)
    return res.status(500).json({ error: 'Failed to reset votes' })
  }
})

module.exports = router
