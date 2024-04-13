import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navigations from "./components/Navigations"
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Login from './components/Login';
import Register from './components/Register';
import Account from './components/Account';
import Cart from './components/Cart';
import CheckoutForm from './components/Checkout';


function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const handleTokenUpdate = (newToken) => {
    setToken(newToken);
  };

  const handleUserIdUpdate = (newUserId) => {
    setUserId(newUserId);
  }

  const handleLogout = () => {
    setToken(null); // Clear the token
    setUserId(null);
  };

  return (
    <>
      <h1>Jay's Fishing Market</h1>
      
      <Router>
        <Navigations token={token} handleLogout={handleLogout} userId={userId} />

        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<Login token={token} setToken={handleTokenUpdate} userId={userId} setUserId={handleUserIdUpdate} />} />
          <Route path="/register" element={<Register token={token} setToken={handleTokenUpdate} />} />
          <Route path="/account" element={token ? <Account token={token} setToken={handleTokenUpdate} /> : <Navigate to="/login" />} />
          <Route path="/products/:id" element={<ProductDetail token={token} setToken={handleTokenUpdate}  userId={userId} setUserId={handleUserIdUpdate} />} />
          <Route path="/cart" element={<Cart token={token} setToken={handleTokenUpdate} userId={userId} />} />
          <Route path="/checkout" element={<CheckoutForm token={token} setToken={handleTokenUpdate} userId={userId} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
export const API_URL = "https://jays-fishing-market.onrender.com";