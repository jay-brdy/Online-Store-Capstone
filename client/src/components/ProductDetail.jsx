import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from "../App";
import Button from '@mui/material/Button';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

export default function ProductDetail({ token, userId }) {
    const { id } = useParams();
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

    const addToCart = async () => {
        try {
            if (!token) {
                throw new Error('Failed - Please log in to add items in your cart!');
            }

            const response = await fetch(`${API_URL}/api/users/${userId}/cart/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    quantity: 1,
                    product_id: id 
                 })
            });
            if (response.status === 404) {
                // If item not found in cart, use POST instead of PUT
                await fetch(`${API_URL}/api/users/${userId}/cart/products`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        quantity: 1,
                        product_id: id 
                    })
                });
            } else if (!response.ok) {
                throw new Error('Failed to add item to cart!');
            }
            // Display a success alert
            alert('Product added to cart successfully!');
        }       
        catch(error) {
            setError(error.message || 'Failed to add to cart!');
        }
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
                    <p>Size: {product.size}</p>
                    <Button variant="contained" startIcon={<AddShoppingCartIcon />} onClick={addToCart}>
                        Add to Cart
                    </Button>
                </div>
            )}
        </div>
    );
}