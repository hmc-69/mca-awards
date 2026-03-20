require('dotenv').config()
const express = require('express')
const cors = require('cors')
const votesRouter = require('./routes/votes')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', votesRouter)

app.listen(PORT, () => {
  console.log(`🚀 Farewell Awards API running on port ${PORT}`)
})
