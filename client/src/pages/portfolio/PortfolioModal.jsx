import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GiRolledCloth } from 'react-icons/gi'
import { IoClose, IoColorPaletteOutline } from 'react-icons/io5'
import { WiDaySunny } from 'react-icons/wi'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { API_BASE_URL } from '../../config/api'
import './portfolioModal.css'

function PortfolioModal({ item, lang, onClose }) {
	const { t } = useTranslation()
	const info = item.translations[lang] || item.translations.uz

	useEffect(() => {
		const handleKeyDown = e => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [onClose])

	return (
		<div className='modal container'>
			<div className='modal__image'>
				<TransformWrapper
					initialScale={1}
					doubleClick={{ mode: 'zoomIn' }}
					wheel={{ step: 0.01 }}
					pinch={{ step: 5 }}
					centerOnInit
				>
					<TransformComponent>
						<img
							src={`${API_BASE_URL}${item.image}`}
							alt={info.title}
							className='modal-image'
						/>
					</TransformComponent>
				</TransformWrapper>
			</div>
			<div className='modal__info'>
				<h2 className='modal__info-title'>{info.title}</h2>
				<p className='modal__info-description'>{info.description}</p>
				<div className='modal__info-row'>
					<GiRolledCloth className='icon' />
					<h3 className='modal__info-material'>
						{t('portfolio.labels.material')}
						<small>{info.material}</small>
					</h3>
				</div>
				<div className='modal__info-row'>
					<WiDaySunny className='icon' />
					<h3 className='modal__info-mavsum'>
						{t('portfolio.labels.season')}
						<small>{info.season}</small>
					</h3>
				</div>
				<div className='modal__info-row'>
					<IoColorPaletteOutline className='icon' />
					<h3 className='modal__info-color'>
						{t('portfolio.labels.color')}
						<small>{info.color}</small>
					</h3>
				</div>
			</div>
			<button className='modal__btn' onClick={onClose}>
				<IoClose />
			</button>
		</div>
	)
}

export default PortfolioModal
