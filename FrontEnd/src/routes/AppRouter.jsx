import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from '../components/layout/Header'
import ProductListPage from '../pages/ProductListPage'
import ProductDetailsPage from '../pages/ProductDetailsPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import OrderSuccessPage from '../pages/OrderSuccessPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/success" element={<OrderSuccessPage />} />
      </Routes>
    </BrowserRouter>
  )
}