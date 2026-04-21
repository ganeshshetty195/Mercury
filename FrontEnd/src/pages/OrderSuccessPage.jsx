import { Link, useLocation } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'

export default function OrderSuccessPage() {
  const location = useLocation()
  const order = location.state?.order

  return (
   <PageShell>
  <div className="order-success-card">
    
    <div className="success-icon">✅</div>

    <h1 className="success-title">Order Placed Successfully</h1>

    <p className="success-subtext">
      Thank you! Your order has been confirmed.
    </p>

    <div className="order-details">
      <div className="order-row">
        <span>Order ID</span>
        <strong>{order?.id}</strong>
      </div>

      <div className="order-row">
        <span>Total</span>
        <strong>₹{order?.totalAmount}</strong>
      </div>

      <div className="order-row">
        <span>Status</span>
        <strong className="status-success">{order?.status}</strong>
      </div>
    </div>

    <Link to="/" className="button success-btn">
      Continue Shopping
    </Link>

  </div>
</PageShell>
  )
}