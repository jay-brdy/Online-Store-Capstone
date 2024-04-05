import React, { useState, useEffect } from 'react';
import { API_URL } from "../App";
import { useParams } from 'react-router-dom';

export default function Cart({ token }) {
    const { id } = useParams(); 
    const [cartProducts, setCartProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await fetch(`${API_URL}/api/carts/${id}/cart_products`, {
                    headers: {
                        Authorization: token
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
    }, [id]); 

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