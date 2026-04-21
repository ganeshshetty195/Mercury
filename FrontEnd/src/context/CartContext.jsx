import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  addToCart,
  fetchCart,
  removeFromCart,
  updateCartItem,
} from '../services/cartService'
import { checkoutCart } from '../services/orderService'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncing, setSyncing] = useState(false)

  async function refreshCart() {
    try {
      setSyncing(true)
      setError('')
      const data = await fetchCart()
      setItems(data.items)
    } catch (err) {
      setError(err.message || 'Failed to load cart')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [])

  async function addItem(productId, quantity = 1) {
    await addToCart(productId, quantity)
    await refreshCart()
  }

  async function updateItem(productId, quantity) {
    await updateCartItem(productId, quantity)
    await refreshCart()
  }

  async function removeItem(productId) {
    await removeFromCart(productId)
    await refreshCart()
  }

  async function checkout(paymentMethod = 'COD') {
    const order = await checkoutCart({paymentMethod})
    await refreshCart()
    return order
  }

  const value = useMemo(() => {
    const cartCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    const cartTotal = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
      0,
    )

    return {
      items,
      cartCount,
      cartTotal,
      loading,
      error,
      syncing,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      checkout,
    }
  }, [items, loading, error, syncing])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return ctx
}