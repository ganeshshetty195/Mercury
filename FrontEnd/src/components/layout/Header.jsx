import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function Header() {
  const { cartCount } = useCart()

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          Benki Store
        </Link>

        <nav className="nav">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Products
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Cart <span className="cart-pill">{cartCount}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}