import { request } from './api'

function normalizeOrder(order) {
  return {
    id: order.id ?? order.order_id ?? order.orderId,
    totalAmount: Number(order.total_amount ?? order.totalAmount ?? order.total ?? 0),
    status: order.status ?? 'confirmed',
    paymentMethod: order.payment_method ?? order.paymentMethod ?? 'cod',
    createdAt: order.created_at ?? order.createdAt ?? new Date().toISOString(),
  }
}

export async function checkoutCart(payload={}) {
  const data = await request('/order/checkout', {
    method: 'POST',
    body: payload,
  })

  const order = data.order ?? data.data ?? data
  return normalizeOrder(order)
}

export async function fetchOrders() {
  const data = await request('/order')
  const list = Array.isArray(data) ? data : data.orders ?? data.data ?? []
  return list.map(normalizeOrder)
}

export async function fetchOrderById(id) {
  const data = await request(`/order/${id}`)
  const order = data.order ?? data.data ?? data
  return normalizeOrder(order)
}