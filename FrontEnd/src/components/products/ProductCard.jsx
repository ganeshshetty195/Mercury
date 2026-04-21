import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StockBadge from './StockBadge'
import { useCart } from '../../context/CartContext'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [adding, setAdding] = useState(false)

  const handleAdd = async () => {
    try {
      setAdding(true)
      await addItem(product.id, 1)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="card">
      <img src={product.image} alt={product.name} className="product-image" />

      <h3>{product.name}</h3>
      <div className="price">₹{product.price}</div>
      <StockBadge stock={product.stock} />

      <div className="card-actions">
        <button className="button secondary" onClick={() => navigate(`/product/${product.id}`)}>
          View
        </button>

        {product.stock === 0 ? (
          <button className="button notify" type="button">
            Notify Me
          </button>
        ) : (
          <button className="button" type="button" onClick={handleAdd} disabled={adding}>
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  )
}