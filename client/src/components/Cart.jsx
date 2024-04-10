import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from "../App";
import Button from '@mui/material/Button';

// Define Cart component
export default function Cart({ token, userId }) { 
    
    const [cartProducts, setCartProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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

        fetchCart();
    }, [userId, token]); 

    const handleCheckout = () => {
        setShowCheckoutForm(true);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Cart</h2>
            {cartProducts.map(product => (
                <div key={product.id}>
                    <h3>{product.name}</h3>
                    <p>Quantity: {product.quantity}</p>
                    <p>Price: ${product.price}</p>
                </div>
            ))}
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