require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const productsRouter = require('./routes/products')

const app = express()

// FRONTEND_URL .env'da ko'rsatilgan bo'lsa faqat o'shanga ruxsat beriladi,
// bo'lmasa (lokal ishlash uchun) hammaga ruxsat beriladi
const allowedOrigin = process.env.FRONTEND_URL
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/products', productsRouter)

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
	console.error('MONGO_URI .env faylida topilmadi. .env.example ni nusxalab .env yarating.')
	process.exit(1)
}

mongoose
	.connect(MONGO_URI)
	.then(() => {
		console.log('MongoDB ulandi')
		app.listen(PORT, () => console.log(`Server http://localhost:${PORT} da ishga tushdi`))
	})
	.catch(err => console.error('MongoDB ulanish xatosi:', err))
