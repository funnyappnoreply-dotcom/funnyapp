require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser') // npm install cookie-parser
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/database')

const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 10000 : 200
})

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // obrigatório para cookies cross-origin
}))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser()) // necessário para ler req.cookies
app.use('/api/', limiter)

app.use('/api/usuarios', require('./routes/auth'))
app.use('/api/posts', require('./routes/posts'))
app.use('/api/admin', require('./routes/admin'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Erro interno.' })
})

if (require.main === module) {
  connectDB()
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`✅ Servidor na porta ${PORT}`))
}

module.exports = app
