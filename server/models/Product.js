const mongoose = require('mongoose')

const langSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		material: { type: String, required: true },
		season: { type: String, required: true },
		color: { type: String, required: true },
	},
	{ _id: false }
)

const CATEGORIES = [
	'sezon-yozgi',
	'sezon-qishki',
	'oyoq-kiyimlar',
	'himoya-vositalari',
	'ommaviy-kiyimlar',
]

const productSchema = new mongoose.Schema(
	{
		slug: { type: String, required: true, unique: true },
		category: { type: String, required: true, enum: CATEGORIES },
		price: { type: String, required: true },
		image: { type: String, required: true },
		translations: {
			uz: { type: langSchema, required: true },
			ru: { type: langSchema, required: true },
			en: { type: langSchema, required: true },
			tr: { type: langSchema, required: true },
			zh: { type: langSchema, required: true },
		},
	},
	{ timestamps: true }
)

productSchema.statics.CATEGORIES = CATEGORIES

module.exports = mongoose.model('Product', productSchema)
