import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft } from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import { HashLink } from 'react-router-hash-link'
import SEO from '../../components/SEO'
import { API_BASE_URL, API_URL } from '../../config/api'
import { useFetch } from '../../hooks/useFetch'
import PortfolioModal from './PortfolioModal'
import './portfoliopage.css'

function PortfolioPage() {
	const { data, isPending, error } = useFetch(API_URL)
	const [selectedItem, setSelectedItem] = useState(null)
	const [searchParams] = useSearchParams()
	const { t, i18n } = useTranslation()
	const title = searchParams.get('title')

	if (isPending) return <div className='loader'>Yuklanmoqda...</div>
	if (error) return <div className='error'>{error}</div>
	if (!data) return null

	// URL dan category ni olish
	const category = searchParams.get('category')

	// Category bo'yicha filter qilish
	const filteredPortfolio = category ? data.filter(item => item.category === category) : data

	// Joriy tilni aniqlash (uz / ru / en), i18n formatidagi "uz-UZ" kabi holatlarni ham hisobga oladi
	const lang = i18n.language?.split('-')[0] || 'uz'

	if (selectedItem) {
		return <PortfolioModal item={selectedItem} lang={lang} onClose={() => setSelectedItem(null)} />
	}

	return (
		<>
			<SEO page='portfolio' />

			<section className='portfolio__page-wrapper container'>
				<div className='portfolio__page-header'>
					<h2 className='title'>{t(`portfolioPage.categories.${title}`)}</h2>

					<HashLink to='/#portfolio' smooth={true} className='portfolio__page-headr-btn'>
						<FaArrowLeft />
					</HashLink>
				</div>

				<div className='portfolio__page'>
					{filteredPortfolio.map(item => {
						const info = item.translations[lang] || item.translations.uz
						return (
							<button
								key={item._id}
								onClick={() => setSelectedItem(item)}
								className='portfolio__page-img-btn'
							>
								<div className='portfolio__page-img-wrapper'>
									<img
										src={`${API_BASE_URL}${item.image}`}
										alt={info.title}
										width={300}
										className='portfolio__page-img'
									/>

									<span className='portfolio__page-price'>{item.price}</span>
								</div>
							</button>
						)
					})}
				</div>
				<HashLink to='/#portfolio' smooth={true} className='portfolio__page-btn'>
					{t('portfolioPage.backBtn')}
				</HashLink>
			</section>
		</>
	)
}

export default PortfolioPage
