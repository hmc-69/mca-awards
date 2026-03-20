const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

function getCleanPrivateKey(pk) {
  if (!pk) return pk
  let key = pk.replace(/\\n/g, '\n')
  const header = '-----BEGIN PRIVATE KEY-----'
  const footer = '-----END PRIVATE KEY-----'
  if (!key.includes(header) || !key.includes(footer)) {
    const cleanKey = key.replace(/---.*---/g, '').replace(/\s+/g, '')
    key = `${header}\n${cleanKey}\n${footer}`
  }
  key = key.trim()
  return key
}

if (!admin.apps.length) {
  try {
    const sapath = path.join(__dirname, '../service-account.json')
    if (fs.existsSync(sapath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(sapath, 'utf8'))
      serviceAccount.private_key = getCleanPrivateKey(serviceAccount.private_key)
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
      console.log('✅ Firebase initialized from service-account.json')
    } else {
      console.warn('⚠️ service-account.json not found, using env vars')
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: getCleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
        }),
      })
      console.log('✅ Firebase initialized from env vars')
    }
  } catch (err) {
    console.error('❌ Firebase initialization CRITICAL ERROR:', err)
    process.exit(1)
  }
}

const db = admin.firestore()
module.exports = { db }
