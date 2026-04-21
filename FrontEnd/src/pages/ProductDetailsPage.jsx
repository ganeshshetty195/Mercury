import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductDetails from '../components/products/ProductDetails';
import PageShell from '../components/layout/PageShell';
import { getProductById } from '../services/productService';
import { useStockStream } from '../hooks/useStockStream';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError('');
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  useStockStream(({ productId, stockCount }) => {
    if (Number(productId) === Number(id)) {
      setProduct((prev) =>
        prev ? { ...prev, stock: Number(stockCount) } : prev
      );
    }
  });

  return (
    <PageShell>
      <button className="button secondary back-button" onClick={() => navigate(-1)}>
        Back
      </button>

      {loading && <p style={{ marginTop: 20 }}>Loading product...</p>}
      {error && <p className="error-text" style={{ marginTop: 20 }}>{error}</p>}
      {!loading && !error && <ProductDetails product={product} />}
    </PageShell>
  );
}