import { Link } from 'react-router-dom';
import marketLogo from '../assets/jaysfishingmarket_logo.png';

export default function Navigations({ token, handleLogout }) {

    return (
      <header>
      <div id="navbar">
          {/* Logo as the header */}
          <div className="navbar-item">
              <Link to="/">
                  <img id="logo-image" src={marketLogo} alt="Jay's Fishing Market" style={{ display: "block", margin: "0 auto" }} />
              </Link>
          </div>

            {/* navigation bar when not logged in */}
            {!token && (
              <>
                <div className="navbar-item">
                    <Link to="/login">Login</Link>
                </div>
                <div className="navbar-item">
                    <Link to="/register">Register</Link>
                </div>
              </>
            )}

            {/* navigation bar when logged in */}
            {token && (
              <div className="navbar-item">
                  <Link to="/account">Account</Link>
              </div>
            )}
            {token && (
              <div className="navbar-item">
                  <Link to={`/cart`}>Cart</Link>
              </div>
            )}
            {token && (
              <div className="navbar-item">
                  <button onClick={handleLogout}>Logout</button>
              </div>
            )}
        </div>
      </header>
    );
}

