const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const upload = require('../middleware/upload')

// Barcha mahsulotlarni olish (ixtiyoriy: ?category=erkaklar)
router.get('/', async (req, res) => {
	try {
		const { category } = req.query
		const filter = category ? { category } : {}
		const products = await Product.find(filter).sort({ createdAt: -1 })
		res.json(products)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// Bitta mahsulotni slug orqali olish
router.get('/:slug', async (req, res) => {
	try {
		const product = await Product.findOne({ slug: req.params.slug })
		if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' })
		res.json(product)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// Matndan slug yasash yordamchi funksiyasi
function slugify(text) {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
}

// Yangi mahsulot qo'shish (slug avtomatik generatsiya qilinadi)
router.post('/', upload.single('image'), async (req, res) => {
	try {
		const { category, price, translations } = req.body

		if (!req.file) {
			return res.status(400).json({ message: 'Rasm majburiy' })
		}

		const parsedTranslations =
			typeof translations === 'string' ? JSON.parse(translations) : translations

		const baseTitle = parsedTranslations?.uz?.title || 'mahsulot'
		let slug = slugify(baseTitle)

		// Slug band bo'lsa, oxiriga tasodifiy raqam qo'shiladi
		let candidate = slug
		let counter = 1
		while (await Product.findOne({ slug: candidate })) {
			candidate = `${slug}-${counter}`
			counter++
		}
		slug = candidate

		const product = new Product({
			slug,
			category,
			price,
			image: `/uploads/${req.file.filename}`,
			translations: parsedTranslations,
		})

		await product.save()
		res.status(201).json(product)
	} catch (err) {
		res.status(400).json({ message: err.message })
	}
})

// Mahsulotni tahrirlash
router.put('/:id', upload.single('image'), async (req, res) => {
	try {
		const { category, price, translations } = req.body
		const parsedTranslations =
			typeof translations === 'string' ? JSON.parse(translations) : translations

		const updateData = { category, price, translations: parsedTranslations }
		if (req.file) updateData.image = `/uploads/${req.file.filename}`

		const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
			new: true,
			runValidators: true,
		})
		if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' })
		res.json(product)
	} catch (err) {
		res.status(400).json({ message: err.message })
	}
})

// Mahsulotni o'chirish
router.delete('/:id', async (req, res) => {
	try {
		const product = await Product.findByIdAndDelete(req.params.id)
		if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' })
		res.json({ message: "Mahsulot o'chirildi" })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

module.exports = router
