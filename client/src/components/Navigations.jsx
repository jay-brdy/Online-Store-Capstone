import { Link } from "react-router-dom";

export default function Navigations() {

    return (
        <div id="navbar">
            <div className="navbar-item">
                <Link to="/">Home</Link>
            </div>
            <div className="navbar-item">
                <Link to="/login">Login</Link>
            </div>
            <div className="navbar-item">
                <Link to="/register">Register</Link>
            </div>
            <div className="navbar-item">
                <Link to="/account">Account</Link>
            </div>
        </div>
    );
}