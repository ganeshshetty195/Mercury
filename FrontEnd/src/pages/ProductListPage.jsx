import { useEffect, useState } from 'react';
import ProductGrid from '../components/products/ProductGrid';
import PageShell from '../components/layout/PageShell';
import { getProducts } from '../services/productService';
import { useStockStream } from '../hooks/useStockStream';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError('');
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useStockStream(({ productId, stockCount }) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === Number(productId)
          ? { ...p, stock: Number(stockCount) }
          : p
      )
    );
  });

  return (
    <PageShell title="Product List">
      {loading && <p>Loading products...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && products.length === 0 && <p>No products found.</p>}
      {!loading && !error && products.length > 0 && <ProductGrid products={products} />}
    </PageShell>
  );
}