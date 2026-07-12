// Bu fayl API manzilini bitta joydan boshqarish uchun.
// Lokalda ishlaganda avtomatik localhost:5000 ishlatiladi.
// Netlify'ga joylaganda, Netlify sozlamalarida VITE_API_URL environment
// o'zgaruvchisini backend'ingizning haqiqiy manziliga o'rnating
// (masalan: https://uniforma-backend.onrender.com)

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const API_URL = `${API_BASE_URL}/api/products`
