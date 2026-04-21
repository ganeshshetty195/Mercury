export default function StockBadge({ stock }) {
  if (stock === 0) return <div className="stock-out">Out of Stock</div>
  if (stock <= 2) return <div className="stock-low">Only {stock} left</div>
  return <div className="stock-in">In Stock</div>
}