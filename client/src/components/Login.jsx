import { useState } from "react";
import { API_URL } from "../App";

export default function Login({ token, setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                throw new Error('Failed to login');
            }
            const data = await response.json();
            setToken(data.token);
        } catch (error) {
            setError(error.message || 'An error occurred while logging in');
        }
    };

    return (
        <>
        {token ? (
            <h1>Logged in as {username}</h1>
        ) : (

        <div>
            <h2>Login</h2>

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
                <button type="submit">Login</button>
            </form>
        </div>
        )}
        </>
        
    );
}