import { useState } from 'react'
import { API_BASE_URL, API_URL } from '../../config/api'
import './productForm.css'

const emptyLang = { title: '', description: '', material: '', season: '', color: '' }
const formatPrice = value => {

	return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

}


const langs = [
	{ code: 'uz', label: "O'zbekcha" },
	{ code: 'ru', label: 'Русский' },
	{ code: 'en', label: 'English' },
	{ code: 'tr', label: 'Türkçe' },
	{ code: 'zh', label: '中文' },
]

// MyMemory tarjima xizmati kutgan til kodlari (zh uchun zh-CN kerak)
const translateLangCodes = {
	ru: 'ru',
	en: 'en',
	tr: 'tr',
	zh: 'zh-CN',
}

const categories = [
	{ value: 'sezon-yozgi', label: 'Sezon - Yozgi' },
	{ value: 'sezon-qishki', label: 'Sezon - Qishki' },
	{ value: 'oyoq-kiyimlar', label: 'Oyoq kiyimlar' },
	{ value: 'himoya-vositalari', label: 'Himoya vositalari' },
	{ value: 'ommaviy-kiyimlar', label: 'Ommaviy kiyimlar' },
]

const createEmptyTranslations = () => ({
	uz: { ...emptyLang },
	ru: { ...emptyLang },
	en: { ...emptyLang },
	tr: { ...emptyLang },
	zh: { ...emptyLang },
})

// Bepul MyMemory tarjima API orqali bitta matnni tarjima qiladi
async function translateText(text, targetLangCode) {
	if (!text || !text.trim()) return ''
	try {
		const res = await fetch(
			`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=uz|${targetLangCode}`
		)
		const data = await res.json()
		return data?.responseData?.translatedText || text
	} catch {
		// Tarmoq xatosi bo'lsa, tarjima qilinmagan matnni qaytaradi (nusxalashga o'xshab)
		return text
	}
}

// mode: 'create' | 'edit'
// product: tahrirlash uchun mavjud mahsulot obyekti (edit rejimida majburiy)
// onSuccess: muvaffaqiyatli yuborilgandan keyin chaqiriladi
// onCancel: tahrirlashni bekor qilish uchun (faqat edit rejimida ko'rsatiladi)
function ProductForm({ mode = 'create', product = null, onSuccess, onCancel }) {
	const [activeLang, setActiveLang] = useState('uz')
	const [category, setCategory] = useState(product?.category || '')
	const [price, setPrice] = useState(product?.price || '')
	const [image, setImage] = useState(null)
	const [preview, setPreview] = useState(null)
	const [translations, setTranslations] = useState(
		product?.translations || createEmptyTranslations()
	)
	const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
	const [message, setMessage] = useState('')
	const [isTranslating, setIsTranslating] = useState(false)

	const isEdit = mode === 'edit'
	const existingImageUrl = product?.image ? `${API_BASE_URL}${product.image}` : null

	const handleFieldChange = (field, value) => {
		setTranslations(prev => ({
			...prev,
			[activeLang]: { ...prev[activeLang], [field]: value },
		}))
	}

	// O'zbekcha tabdagi matnlarni qolgan 4 tilga so'zma-so'z nusxalaydi
	const handleCopyFromUz = () => {
		setTranslations(prev => ({
			...prev,
			ru: { ...prev.uz },
			en: { ...prev.uz },
			tr: { ...prev.uz },
			zh: { ...prev.uz },
		}))
	}

	// O'zbekcha tabdagi matnlarni qolgan 4 tilga AVTOMATIK TARJIMA qiladi
	const handleAutoTranslate = async () => {
		const uzFields = translations.uz
		const hasContent = Object.values(uzFields).some(v => v && v.trim())
		if (!hasContent) {
			setMessage("Avval o'zbekcha maydonlarni to'ldiring")
			setStatus('error')
			return
		}

		setIsTranslating(true)
		setMessage('')

		try {
			const targetLangs = ['ru', 'en', 'tr', 'zh']
			const fieldNames = ['title', 'description', 'material', 'season', 'color']

			// Barcha til va maydon kombinatsiyalarini parallel tarjima qilamiz
			const results = await Promise.all(
				targetLangs.map(async lang => {
					const translatedFields = await Promise.all(
						fieldNames.map(field => translateText(uzFields[field], translateLangCodes[lang]))
					)
					const fieldsObj = {}
					fieldNames.forEach((field, i) => {
						fieldsObj[field] = translatedFields[i]
					})
					return [lang, fieldsObj]
				})
			)

			setTranslations(prev => {
				const updated = { ...prev }
				results.forEach(([lang, fieldsObj]) => {
					updated[lang] = fieldsObj
				})
				return updated
			})

			setStatus('success')
			setMessage("Tarjima qilindi! Tekshirib, kerak bo'lsa tuzating.")
		} catch {
			setStatus('error')
			setMessage("Tarjima qilishda xatolik yuz berdi. Internetni tekshiring yoki qo'lda to'ldiring.")
		} finally {
			setIsTranslating(false)
		}
	}

	const handleImageChange = e => {
		const file = e.target.files[0]
		if (!file) return
		setImage(file)
		setPreview(URL.createObjectURL(file))
	}

	const resetForm = () => {
		setCategory('')
		setPrice('')
		setImage(null)
		setPreview(null)
		setTranslations(createEmptyTranslations())
		setActiveLang('uz')
	}

	const handleSubmit = async e => {
		e.preventDefault()
		setStatus('loading')
		setMessage('')

		try {
			const formData = new FormData()
			formData.append('category', category)
			formData.append('price', price)
			formData.append('translations', JSON.stringify(translations))
			if (image) formData.append('image', image)

			const url = isEdit ? `${API_URL}/${product._id}` : API_URL
			const method = isEdit ? 'PUT' : 'POST'

			const res = await fetch(url, { method, body: formData })
			const data = await res.json()

			if (!res.ok) throw new Error(data.message || 'Xatolik yuz berdi')

			setStatus('success')
			setMessage(isEdit ? 'Mahsulot yangilandi!' : "Mahsulot qo'shildi!")

			if (isEdit) {
				onSuccess?.(data)
			} else {
				resetForm()
				onSuccess?.(data)
			}
		} catch (err) {
			setStatus('error')
			setMessage(err.message)
		}
	}

	const current = translations[activeLang]

	return (
		<div className='product-form'>
			<h2>{isEdit ? 'Mahsulotni tahrirlash' : "Yangi mahsulot qo'shish"}</h2>

			<div className='product-form__langs'>
				{langs.map(l => (
					<button
						type='button'
						key={l.code}
						onClick={() => setActiveLang(l.code)}
						className={activeLang === l.code ? 'active' : ''}
					>
						{l.label}
					</button>
				))}
			</div>

			{activeLang === 'uz' && (
				<button
					type='button'
					className='product-form__translate-btn'
					onClick={handleAutoTranslate}
					disabled={isTranslating}
				>
					{isTranslating
						? 'Tarjima qilinmoqda...'
						: '🌐 Avtomatik tarjima qilish (4 tilga)'}
				</button>
			)}

			{activeLang !== 'uz' && (
				<button type='button' className='product-form__copy-btn' onClick={handleCopyFromUz}>
					O'zbekchadan so'zma-so'z nusxalash
				</button>
			)}

			<form onSubmit={handleSubmit} className='product-form__form'>
				<label>
					Sarlavha ({activeLang})
					<input
						type='text'
						value={current.title}
						onChange={e => handleFieldChange('title', e.target.value)}
						required
					/>
				</label>

				<label>
					Tavsif ({activeLang})
					<textarea
						value={current.description}
						onChange={e => handleFieldChange('description', e.target.value)}
						required
					/>
				</label>

				<label>
					Material ({activeLang})
					<input
						type='text'
						value={current.material}
						onChange={e => handleFieldChange('material', e.target.value)}
						required
					/>
				</label>

				<label>
					Fasl ({activeLang})
					<input
						type='text'
						value={current.season}
						onChange={e => handleFieldChange('season', e.target.value)}
						required
					/>
				</label>

				<label>
					Rang ({activeLang})
					<input
						type='text'
						value={current.color}
						onChange={e => handleFieldChange('color', e.target.value)}
						required
					/>
				</label>

				<hr />

		<label>

	Narx
	<input
		type="text"
		inputMode="numeric"
		value={formatPrice(price)}
		onChange={e =>
			setPrice(e.target.value.replace(/\s/g, '').replace(/\D/g, ''))
		}
		placeholder="Masalan: 150 000"
		required
	/>

</label>


				<label>
					Kategoriya
					<select value={category} onChange={e => setCategory(e.target.value)} required>
						<option value='' disabled>
							Tanlang...
						</option>
						{categories.map(c => (
							<option key={c.value} value={c.value}>
								{c.label}
							</option>
						))}
					</select>
				</label>

				<label>
					Rasm {isEdit && '(faqat almashtirmoqchi bo\'lsangiz tanlang)'}
					<input type='file' accept='image/*' onChange={handleImageChange} required={!isEdit} />
				</label>

				{(preview || existingImageUrl) && (
					<img src={preview || existingImageUrl} alt='preview' className='product-form__preview' />
				)}

				<div className='product-form__actions'>
					<button type='submit' disabled={status === 'loading'}>
						{status === 'loading' ? 'Yuklanmoqda...' : isEdit ? 'Saqlash' : "Qo'shish"}
					</button>
					{isEdit && (
						<button type='button' className='product-form__cancel-btn' onClick={onCancel}>
							Bekor qilish
						</button>
					)}
				</div>

				{message && (
					<p className={status === 'error' ? 'product-form__error' : 'product-form__success'}>
						{message}
					</p>
				)}
			</form>
		</div>
	)
}

export default ProductForm