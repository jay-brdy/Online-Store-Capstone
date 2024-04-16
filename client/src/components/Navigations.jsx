import { Link } from 'react-router-dom';
import marketLogo from '../assets/jaysfishingmarket_logo.png';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Navigations({ token, handleLogout }) {

  return (
    <header>
      <div id="navbar">
        {/* Logo as the header */}
        <div className="navbar-logo">
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
        {/* account button */}
        {token && (
          <div className="navbar-item">
            <Link to="/account" style={{ textDecoration: 'none' }}>
              <Button startIcon={<PermIdentityIcon />}></Button>
            </Link>
          </div>
        )}
        {/* shopping cart button */}
        {token && (
          <div className="navbar-item">
            <Link to="/cart" style={{ textDecoration: 'none' }}>
              <Button startIcon={<ShoppingCartIcon />}></Button>
            </Link>
          </div>
        )}
        {token && (
          <div className="navbar-item">
            <Button onClick={handleLogout} startIcon={<LogoutIcon />}></Button>
          </div>
        )}
      </div>
    </header>
  );
}

