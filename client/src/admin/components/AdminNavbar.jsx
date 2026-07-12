import { NavLink } from 'react-router-dom'

function AdminNavbar() {
	return (
		<div>
			<NavLink to='dashboard1'>Mahsulot qo'shish</NavLink>
			<NavLink to='dashboard2'>Mahsulotlarni boshqarish</NavLink>
		</div>
	)
}

export default AdminNavbar
