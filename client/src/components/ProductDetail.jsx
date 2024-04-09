import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from "../App";
import Button from '@mui/material/Button';

export default function ProductDetail({ token, handleAddToCart }) {
    const { id } = useParams();
    console.log("product ID:", id); // Log the id parameter
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }
                const data = await response.json();
                setProduct(data);
                setLoading(false);
            } catch (error) {
                setError(error.message || 'An error occurred while fetching product');
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const onAddToCartClick = () => {
        handleAddToCart(id);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Product Detail</h2>
            {product && (
                <div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p>Price: ${product.price}</p>
                    <p>Inventory: {product.inventory}</p>
                    <button onClick={onAddToCartClick}>Add to Cart</button>
                    <Button variant="contained" color="primary" onClick={onAddToCartClick}>
                    Add to Cart
                    </Button>
                </div>
            )}
        </div>
    );
}