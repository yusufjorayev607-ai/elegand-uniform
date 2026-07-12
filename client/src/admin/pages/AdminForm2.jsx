import { useEffect, useState } from 'react'
import { API_BASE_URL, API_URL } from '../../config/api'
import ProductForm from '../components/ProductForm'
import './adminForm2.css'

const categoryLabels = {
	'sezon-yozgi': 'Sezon - Yozgi',
	'sezon-qishki': 'Sezon - Qishki',
	'oyoq-kiyimlar': 'Oyoq kiyimlar',
	'himoya-vositalari': 'Himoya vositalari',
	'ommaviy-kiyimlar': 'Ommaviy kiyimlar',
}

function AdminForm2() {
	const [products, setProducts] = useState([])
	const [isPending, setIsPending] = useState(true)
	const [error, setError] = useState(null)
	const [editingProduct, setEditingProduct] = useState(null)
	const [deletingId, setDeletingId] = useState(null)

	const loadProducts = async () => {
		setIsPending(true)
		setError(null)
		try {
			const res = await fetch(API_URL)
			if (!res.ok) throw new Error('Ma\'lumotlarni yuklab bo\'lmadi')
			const data = await res.json()
			setProducts(data)
		} catch (err) {
			setError(err.message)
		} finally {
			setIsPending(false)
		}
	}

	useEffect(() => {
		loadProducts()
	}, [])

	const handleDelete = async id => {
		const confirmed = window.confirm("Rostdan ham bu mahsulotni o'chirmoqchimisiz?")
		if (!confirmed) return

		setDeletingId(id)
		try {
			const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
			if (!res.ok) throw new Error("O'chirishda xatolik yuz berdi")
			setProducts(prev => prev.filter(p => p._id !== id))
		} catch (err) {
			alert(err.message)
		} finally {
			setDeletingId(null)
		}
	}

	const handleEditSuccess = updatedProduct => {
		setProducts(prev => prev.map(p => (p._id === updatedProduct._id ? updatedProduct : p)))
		setEditingProduct(null)
	}

	// Tahrirlash rejimida - shu mahsulot uchun forma ko'rsatiladi
	if (editingProduct) {
		return (
			<ProductForm
				mode='edit'
				product={editingProduct}
				onSuccess={handleEditSuccess}
				onCancel={() => setEditingProduct(null)}
			/>
		)
	}

	if (isPending) return <div className='admin-list__status'>Yuklanmoqda...</div>
	if (error) return <div className='admin-list__status admin-list__status--error'>{error}</div>

	return (
		<div className='admin-list'>
			<h2>Mahsulotlarni boshqarish</h2>

			{products.length === 0 ? (
				<p className='admin-list__empty'>Hozircha mahsulotlar yo'q.</p>
			) : (
				<div className='admin-list__grid'>
					{products.map(item => {
						const info = item.translations?.uz
						return (
							<div key={item._id} className='admin-list__card'>
								<img
									src={`${API_BASE_URL}${item.image}`}
									alt={info?.title}
									className='admin-list__img'
								/>
								<div className='admin-list__info'>
									<h3>{info?.title}</h3>
									<p className='admin-list__category'>
										{categoryLabels[item.category] || item.category}
									</p>
									<p className='admin-list__price'>{item.price}</p>
								</div>
								<div className='admin-list__actions'>
									<button
										type='button'
										className='admin-list__edit-btn'
										onClick={() => setEditingProduct(item)}
									>
										Tahrirlash
									</button>
									<button
										type='button'
										className='admin-list__delete-btn'
										disabled={deletingId === item._id}
										onClick={() => handleDelete(item._id)}
									>
										{deletingId === item._id ? "O'chirilmoqda..." : "O'chirish"}
									</button>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

export default AdminForm2
