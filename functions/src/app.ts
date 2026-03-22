import express, { Request, Response } from 'express';
import cors from 'cors';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'farewell2026admin';
const ADMIN_KEY = process.env.ADMIN_KEY || ADMIN_SECRET;
const VOTES_COLLECTION = 'votes';

const VOTE_FIELDS = [
  'sleepyHead', 'classComedian', 'lateComer', 'silentAssassin',
  'futureCeo', 'fashionIcon', 'photogenic', 'friendEveryoneNeeds',
  'brainOfBatch', 'futureProfessor',
];

app.use(cors({ origin: true }));
app.use(express.json());

// ─── GET /api/health ────────────────────────────────────────────────────────
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── GET /api/vote-status  (check if user already voted) ───────────────────
app.get('/api/vote-status', async (req: Request, res: Response) => {
  try {
    const { visitorId } = req.query;
    if (!visitorId) return res.json({ voted: false });
    
    const doc = await db.collection(VOTES_COLLECTION).doc(visitorId as string).get();
    
    if (doc.exists && doc.data()?.is_active !== false) {
      return res.json({ voted: true });
    }
    
    return res.json({ voted: false });
  } catch (err) {
    console.error('GET /vote-status error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/votes  (submit a vote) ──────────────────────────────────────
app.post('/api/votes', async (req: Request, res: Response) => {
  try {
    const { visitorId, ...fields } = req.body;

    if (!visitorId) {
      return res.status(400).json({ error: 'Missing visitorId' });
    }

    // Check for duplicate (active votes only)
    const existing = await db.collection(VOTES_COLLECTION).doc(visitorId).get();
    if (existing.exists && existing.data()?.is_active !== false) {
      return res.status(409).json({
        error: 'Already voted',
        receiptId: existing.data()?.receiptId,
      });
    }

    // Build vote document (only permitted fields)
    const voteData: any = { 
      visitorId, 
      createdAt: new Date().toISOString(),
      is_active: true // For soft reset support
    };
    VOTE_FIELDS.forEach(f => { if (fields[f]) voteData[f] = String(fields[f]).trim().slice(0, 100); });

    // Generate receipt ID
    const receiptId = `FA2026-${Math.floor(1000 + Math.random() * 9000)}`;
    voteData.receiptId = receiptId;

    // Save — use visitorId as document ID for uniqueness
    await db.collection(VOTES_COLLECTION).doc(visitorId).set(voteData);

    return res.status(201).json({ success: true, receiptId });
  } catch (err) {
    console.error('POST /votes error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/results  (aggregated counts per category, public) ─────────────
app.get('/api/results', async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection(VOTES_COLLECTION).get();
    // Include legacy votes (where is_active is undefined) and active votes
    const docs = snapshot.docs
      .map(d => d.data())
      .filter(doc => doc.is_active !== false);

    // Aggregate top names per category
    const results: any = {};
    VOTE_FIELDS.forEach(field => {
      const counts: any = {};
      docs.forEach(doc => {
        const name = (doc[field] as string)?.trim();
        if (name) counts[name] = (counts[name] || 0) + 1;
      });
      results[field] = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10);
    });

    return res.json(results);
  } catch (err) {
    console.error('GET /results error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/votes  (admin only — all vote records) ───────────────────────
app.get('/api/votes', async (req: Request, res: Response) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const snapshot = await db.collection(VOTES_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    // Include legacy votes (is_active undefined) and active votes
    const votes = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(v => (v as any).is_active !== false)
      .slice(0, 200);

    return res.json(votes);
  } catch (err) {
    console.error('GET /votes error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/admin/reset  (hard or soft reset) ──────────────────────────
app.delete('/api/admin/reset', async (req: Request, res: Response) => {
  const key = req.headers['x-admin-key'];
  
  if (!key || key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized Access' });
  }

  try {
    const mode = req.query.mode || 'hard'; // Default to hard reset as requested
    const snapshot = await db.collection(VOTES_COLLECTION).get();
    
    if (snapshot.empty) {
      return res.json({ success: true, message: 'No votes to reset' });
    }

    const batch = db.batch();
    
    if (mode === 'hard') {
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
    } else {
      // Soft reset: set is_active to false
      snapshot.docs.forEach(doc => batch.update(doc.ref, { is_active: false }));
    }

    await batch.commit();
    return res.json({ 
      success: true, 
      message: mode === 'hard' ? 'All votes permanently deleted' : 'All votes deactivated (soft reset)' 
    });
  } catch (err) {
    console.error('DELETE /admin/reset error:', err);
    return res.status(500).json({ error: 'Failed to reset votes' });
  }
});

export { app };
