import { request } from './api'

function normalizeCartItem(item) {
  return {
    productId: Number(item.product_id ?? item.productId ?? item.id),
    name: item.name ?? 'Untitled',
    price: Number(item.price ?? 0),
    quantity: Number(item.quantity ?? 1),
    stock: Number(item.stock_count ?? 0),
    image:
      item.image ??
      item.image_url ??
      `https://picsum.photos/seed/${item.product_id ?? item.id}/400/300`,
    category: item.category ?? '',
    itemTotal: Number(item.item_total ?? 0),
  }
}

export async function fetchCart() {
  const data = await request('/cart')

  const items = data.cart ?? []

  return {
    items: Array.isArray(items) ? items.map(normalizeCartItem) : [],
    totalAmount: Number(data.total ?? data.totalAmount ?? 0),
  }
}

export async function addToCart(productId, quantity = 1) {
  return request('/cart/add', {
    method: 'POST',
    body: {
      product_id: productId,
      productId,
      quantity,
    },
  })
}

export async function updateCartItem(productId, quantity) {
  return request('/cart/update', {
    method: 'PUT',
    body: {
      product_id: productId,
      productId,
      quantity,
    },
  })
}

export async function removeFromCart(productId) {
  return request('/cart/remove', {
    method: 'DELETE',
    body: {
      product_id: productId,
      productId,
    },
  })
}