import { useState } from "react";
import { API_URL } from "../App";

export default function Register({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                throw new Error('Failed to register');
            }
            const data = await response.json();
            setToken(data.token);
            setSuccessMessage(data.message || 'Registration success!');
        } catch (error) {
            setError(error.message || 'An error occurred while registering');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {successMessage && <div>Success Message: {successMessage}</div>}
            {error && <div>Error: {error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}