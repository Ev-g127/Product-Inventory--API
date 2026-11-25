import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'

const LINKS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/products', label: 'Products', icon: 'products' },
  { to: '/warehouses', label: 'Warehouses', icon: 'warehouses' },
  { to: '/categories-suppliers', label: 'Categories & suppliers', icon: 'categories' },
  { to: '/users', label: 'Users', icon: 'users' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">PI</div>
        <div>
          <div className="brand-name">Product Inventory</div>
          <div className="brand-group">Group 3 - BeTechified</div>
        </div>
      </div>

      <nav className="nav">
        {/* NavLink adds the class "active" to the link of the current page.
            "end" on the dashboard: "/" is active only on "/", not on every page */}
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className="nav-item">
            <Icon name={link.icon} />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
