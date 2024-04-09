import React, { useState, useEffect } from 'react';
import { API_URL } from "../App";

// Define handleAddToCart function
export const handleAddToCart = async (userId, token, productId) => {
    try {
        console.log('Token:', token);
        const response = await fetch(`${API_URL}/api/carts/${userId}/cart_products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ product_id: productId }) // Pass the product id to the server
        });
        if (!response.ok) {
            throw new Error('Failed to add product to cart');
        }
        alert('Product added to cart successfully!');
    } catch (error) {
        console.error('Error adding product to cart:', error);
    }
};

// Define Cart component
export default function Cart({ token, userId }) { 
    console.log("USER ID:", userId); // DELETE LATER
    
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
                    <p>{product.description}</p>
                    <p>Price: ${product.price}</p>
                </div>
            ))}
        </div>
    );
}