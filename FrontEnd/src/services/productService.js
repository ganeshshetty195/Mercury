import { request } from './api'

function normalizeProduct(product) {
  return {
    id: product.id,
    name: product.name ?? product.title ?? 'Untitled',
    price: Number(product.price ?? 0),
    stock: Number(product.stock_count),
    image:
      product.image ??
      product.image_url ??
      product.imageUrl ??
      `https://picsum.photos/seed/${product.id}/400/300`,
    description: product.description ?? '',
    category: product.category ?? '',
  }
}

export async function getProducts() {
  const data = await request('/products')
  const list = Array.isArray(data) ? data : data.products ?? data.data ?? []
  return list.map(normalizeProduct)
}

export async function getProductById(id) {
  const data = await request(`/products/${id}`)
  const product = data.product ?? data.data ?? data
  return normalizeProduct(product)
}