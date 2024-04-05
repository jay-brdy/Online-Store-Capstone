import { Link, useParams } from 'react-router-dom';

export default function Navigations({ token, handleLogout }) {
    const { id } = useParams();

    return (
        <div id="navbar">

            <div className="navbar-item">
                <Link to="/">Home</Link>
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
                  <Link to={`/carts/${id}`}>Cart</Link>
              </div>
            )}
            {token && (
              <div className="navbar-item">
                  <button onClick={handleLogout}>Logout</button>
              </div>
            )}
        </div>
    );
}

