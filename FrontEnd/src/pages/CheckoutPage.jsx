import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import { useCart } from '../context/CartContext'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, cartTotal, checkout } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError('')
      const order = await checkout({
        paymentMethod: 'COD'
    })
      navigate('/order/success', { state: { order } })
    } catch (err) {
      setError(err.message || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
   <PageShell title="Checkout">
  <div className="checkout-layout">
    
    {/* LEFT: Items */}
    <div className="checkout-items">
      {items.map((item) => (
        <div className="checkout-item" key={item.productId}>
          <img src={item.image} className="checkout-image" />
          
          <div>
            <h4>{item.name}</h4>
            <p>₹{item.price} × {item.quantity}</p>
          </div>

          <div className="checkout-item-total">
            ₹{item.price * item.quantity}
          </div>
        </div>
      ))}
    </div>

    {/* RIGHT: Summary */}
    <div className="checkout-summary">
      <h3>Order Summary</h3>

      <div className="summary-row">
        <span>Items</span>
        <span>{items.length}</span>
      </div>

      <div className="summary-row">
        <span>Total</span>
        <span>₹{cartTotal}</span>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="button checkout-button" onClick={handleCheckout} disabled={loading}>
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>

  </div>
</PageShell>
  )
}