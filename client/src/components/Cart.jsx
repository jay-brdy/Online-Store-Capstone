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
            }
            setCartProducts(prevCartProducts =>
                prevCartProducts.filter(product => product.id !== productId)
            );
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
            }

            // // Fetch the index of the product in the cartProducts array
            // const productIndex = cartProducts.findIndex(product => product.id);

            // // Get the updated product's quantity
            // const updatedQuantity = cartProducts[productIndex].quantity - 1;

            // // Update the quantity locally
            // setCartProducts(prevCartProducts => {
            //     const updatedCartProducts = [...prevCartProducts];
            //     updatedCartProducts[productIndex] = { ...updatedCartProducts[productIndex], quantity: updatedQuantity };
            //     return updatedCartProducts;
            // });

            // // If quantity becomes 0, remove the product from the cart
            // if (updatedQuantity === 0) {
            //     await removeFromCart(productId);
            // }
            setCartProducts(prevCartProducts =>
                prevCartProducts.map(product =>
                    product.id === productId ? { ...product, quantity: product.quantity - 1 } : product
                )
            );
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
            }
            // const updatedProduct = await response.json();
            // setCartProducts(prevCartProducts =>
            // prevCartProducts.map(product =>
            //     product.product_id === productId ? { ...product, quantity: updatedProduct.quantity } : product
            // )
            setCartProducts(prevCartProducts =>
                prevCartProducts.map(product =>
                    product.id === productId ? { ...product, quantity: product.quantity + 1 } : product
                )
            );
        } catch (error) {
            console.error('Error increasing quantity:', error);
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

                        {/* TESTING DELETE LATER!!! */}
                        <p>Id: {product.product_id}</p>
                    </div>
                ))
            )}
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