import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import AdminForm1 from './admin/pages/AdminForm1'
import AdminForm2 from './admin/pages/AdminForm2'
import AdminLayout from './layout/AdminLayout'
import MainLayout from './layout/MainLayout'
import AboutDetails from './pages/aboutdetails/AboutDetails'
import ErrorPage from './pages/error/ErrorPage'
import Pages from './pages/Pages'
import PortfolioPage from './pages/portfolio/PortfolioPage'

const routes = createBrowserRouter([
	{
		path: '/',
		element: <MainLayout />,
		errorElement: <ErrorPage />,
		children: [
			{
				index: true,
				element: <Pages />,
			},
			{
				path: 'portfolio',
				element: <PortfolioPage />,
			},
			{
				path: 'about',
				element: <AboutDetails />,
			},
		],
	},
	{
		path: '/admin123',
		element: <AdminLayout />,
		children: [
			{
				path: 'dashboard1',
				element: <AdminForm1 />,
			},
			{
				path: 'dashboard2',
				element: <AdminForm2 />,
			},
		],
	},
])
function App() {
	return <RouterProvider router={routes} />
}

export default App
