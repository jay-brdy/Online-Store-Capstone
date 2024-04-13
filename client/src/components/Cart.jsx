import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from "../App";
import Button from '@mui/material/Button';

// Define Cart component
export default function Cart({ token, userId }) {
    const [cartProducts, setCartProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);

    const fetchCart = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/cart/products`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch cart products');
            }
            const data = await response.json();
            setCartProducts(data);
            setLoading(false);
        } catch (error) {
            setError(error.message || 'An error occurred while fetching cart products');
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCart();
    }, [userId, token]);

    const removeFromCart = async (productId) => {
        console.log('userId:', userId);
        console.log('productId:', productId);
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/cart/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (!response.ok) {
                throw new Error('Failed to remove product from cart');
            };
            fetchCart(); // Re-render page to update quantity
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    };

    const reduceQuantity = async (productId) => {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}/cart/products/${productId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    quantity: -1,
                    product_id: productId
                })
            });
            if (!response.ok) {
                throw new Error('Failed to reduce quantity');
            };
            fetchCart(); // Re-render page to update quantity
        } catch (error) {
            console.error('Error reducing quantity:', error);
        }
    };

    const increaseQuantity = async (productId) => {
        try {
            console.log(productId);
            const response = await fetch(`${API_URL}/api/users/${userId}/cart/products/${productId}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    quantity: 1,
                    product_id: productId
                })
            });
            if (!response.ok) {
                throw new Error('Failed to increase quantity');
            };
            fetchCart(); // Re-render page to update quantity
        } catch (error) {
            console.error('Error increasing quantity:', error);
        }
    };

    useEffect(() => {
        // Calculate total price whenever cartProducts change
        let totalPrice = 0;
        cartProducts.forEach(product => {
            totalPrice += product.quantity * product.price;
        });
        setTotalPrice(totalPrice);
    }, [cartProducts]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Cart</h2>
            {cartProducts.length === 0 ? (
                <h3>Your cart is currently empty.</h3>
            ) : (
                cartProducts.map(product => (
                    <div key={product.id}>
                        <h3>{product.name}</h3>
                        <p>Quantity: {product.quantity}</p>
                        <p>Price: ${product.price}</p>

                        {/* Decrease quantity button */}
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => reduceQuantity(product.product_id)}
                            disabled={product.quantity === 1}>
                            -
                        </Button>

                        {/* Increase quantity button */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => increaseQuantity(product.product_id)}>
                            +
                        </Button>

                        {/* Remove from cart button */}
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => removeFromCart(product.product_id)}
                        >
                            Remove
                        </Button> 
                    </div>
                ))
            )}
            {/* Display total price */}
            <h3>Total: ${totalPrice}</h3>
            
            {cartProducts.length > 0 && (
                <Link to="/checkout">
                    <Button variant="contained" color="primary">
                        Check Out
                    </Button>
                </Link>
            )}
        </div>
    );
}