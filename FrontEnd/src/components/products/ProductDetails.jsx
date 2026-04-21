import { useState } from 'react'
import StockBadge from './StockBadge'
import { useCart } from '../../context/CartContext'

export default function ProductDetails({ product }) {
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  if (!product) return <h2>Product not found</h2>

  const handleAdd = async () => {
    try {
      setAdding(true)
      await addItem(product.id, 1)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="details-wrap">
      <div className="details-hero">
        <img src={product.image} alt={product.name} className="details-image" />
        <h2 style={{ marginTop: 16 }}>{product.name}</h2>
        <div className="price">₹{product.price}</div>
        <StockBadge stock={product.stock} />
        <p style={{ marginTop: 16, color: '#4b5563' }}>
          {product.description || 'Product details will appear here.'}
        </p>
      </div>

      <div className="details-side">
        <h3 style={{ marginTop: 0 }}>Purchase</h3>
        {product.stock === 0 ? (
          <button className="button notify" disabled>
            Notify Me
          </button>
        ) : (
          <button className="button" onClick={handleAdd} disabled={adding}>
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  )
}