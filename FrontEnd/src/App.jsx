import { CartProvider } from './context/CartContext'
import AppRouter from './routes/AppRouter'

export default function App() {
  return (
    <CartProvider>
      <AppRouter />
    </CartProvider>
  )
}