import React, { useState, useEffect } from 'react';
import { API_URL } from "../App";

export default function Account({ token }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    headers: {
                        Authorization: token
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const userData = await response.json();
                setUser(userData);
                setLoading(false);
            } catch (error) {
                setError(error.message || 'An error occurred while fetching user data');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="accountDetails">
            <h1>My Account</h1>
            {user && (
                <div>
                    <p>Username: {user.username}</p>
                    <p>Address: {user.address}</p>
                    <p>Payment Info: {user.payment_info}</p>
                </div>
            )}
        </div>
    );
}