import { Outlet } from 'react-router-dom'
import AdminNavbar from '../admin/components/AdminNavbar'

function AdminLayout() {
	return (
		<>
			<AdminNavbar />
			<Outlet />
		</>
	)
}

export default AdminLayout
