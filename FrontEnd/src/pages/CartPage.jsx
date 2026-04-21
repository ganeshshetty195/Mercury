import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { items, cartTotal, loading, error, updateItem, removeItem } = useCart()
  const navigate = useNavigate()
  const [workingId, setWorkingId] = useState(null)

  const handleQty = async (productId, nextQty) => {
    try {
      setWorkingId(productId)
      await updateItem(productId, nextQty)
    } finally {
      setWorkingId(null)
    }
  }

  const handleRemove = async (productId) => {
    try {
      setWorkingId(productId)
      await removeItem(productId)
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <PageShell title="Cart">
      {loading && <p>Loading cart...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="button-link">
            Continue Shopping
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-item" key={item.productId}>
                <img src={item.image} alt={item.name} className="cart-image" />

                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>
                  <p>Stock: {item.stock}</p>
                </div>

              <div className="cart-actions">
                    <div className="stepper">
                        <button
                        className="qty-button"
                        onClick={() => handleQty(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        >
                        -
                        </button>

                        <span className="qty-value">{item.quantity}</span>

                        <button
                        className="qty-button"
                        onClick={() => handleQty(item.productId, item.quantity + 1)}
                        >
                        +
                        </button>
                    </div>

                    <button
                        className="remove-button"
                        onClick={() => handleRemove(item.productId)}
                    >
                        Remove
                    </button>

                    </div>

                <button
                  className="button secondary remove-button"
                  onClick={() => handleRemove(item.productId)}
                  disabled={workingId === item.productId}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items</span>
              <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
            <button className="button checkout-button" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </PageShell>
  )
}