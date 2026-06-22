import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  LogOut, 
  Search, 
  Package, 
  Sparkles,
  Shield,
  Sun,
  Moon
} from 'lucide-react';
import { setFilter, fetchProducts } from '../store/slices/productSlice';
import { logoutUser } from '../store/slices/authSlice';
import { clearCartState } from '../store/slices/cartSlice';
import { clearWishlistState } from '../store/slices/wishlistSlice';
import { clearOrdersState } from '../store/slices/orderSlice';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);
  const { filters } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState(filters.keyword);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    setSearchTerm(filters.keyword);
  }, [filters.keyword]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilter({ keyword: searchTerm }));
    dispatch(fetchProducts());
    navigate(`/products?keyword=${encodeURIComponent(searchTerm)}`);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
    dispatch(clearOrdersState());
    setShowDropdown(false);
    navigate('/login');
  };

  // Calculate total items in cart
  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistItemsCount = wishlistProducts?.length || 0;

  return (
    <header className="navbar-wrapper glass">
      <div className="container navbar">
        <Link to="/" className="logo">
          <Sparkles size={24} className="primary" />
          <span>VikaStore</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        {/* Links */}
        <nav className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>

          <Link 
            to="/products" 
            className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
          >
            Products
          </Link>

          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '50%', 
              width: '36px', 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'var(--transition-fast)',
              padding: 0,
              marginLeft: '8px',
              marginRight: '8px'
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="theme-toggle"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link 
                to="/wishlist" 
                className={`nav-link ${location.pathname === '/wishlist' ? 'active' : ''}`}
              >
                <Heart size={18} />
                <span>Wishlist</span>
                {wishlistItemsCount > 0 && (
                  <span className="badge">{wishlistItemsCount}</span>
                )}
              </Link>

              <Link 
                to="/cart" 
                className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
              >
                <ShoppingBag size={18} />
                <span>Cart</span>
                {cartItemsCount > 0 && (
                  <span className="badge">{cartItemsCount}</span>
                )}
              </Link>

              <Link 
                to="/orders" 
                className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
              >
                <Package size={18} />
                <span>Orders</span>
              </Link>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button 
                  className="avatar-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <User size={16} />
                  <span>{user?.name?.split(' ')[0]}</span>
                </button>

                {showDropdown && (
                  <div 
                    className="glass-card" 
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '48px',
                      width: '200px',
                      padding: '12px',
                      zIndex: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ padding: '4px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Role: <strong style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{user?.role}</strong>
                    </div>
                    <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />
                    
                    {user?.role === 'admin' && (
                      <>
                        <Link 
                          to="/admin" 
                          className="btn btn-primary" 
                          style={{ 
                            justifyContent: 'flex-start', 
                            padding: '8px 12px', 
                            fontSize: '13px',
                            width: '100%',
                            boxShadow: 'none'
                          }}
                          onClick={() => setShowDropdown(false)}
                        >
                          <Shield size={14} style={{ marginRight: '6px' }} />
                          Admin Portal
                        </Link>
                        <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />
                      </>
                    )}

                    {user?.role === 'seller' && (
                      <>
                        <Link 
                          to="/seller" 
                          className="btn btn-primary" 
                          style={{ 
                            justifyContent: 'flex-start', 
                            padding: '8px 12px', 
                            fontSize: '13px',
                            width: '100%',
                            boxShadow: 'none'
                          }}
                          onClick={() => setShowDropdown(false)}
                        >
                          <Shield size={14} style={{ marginRight: '6px' }} />
                          Seller Portal
                        </Link>
                        <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />
                      </>
                    )}
                    <Link 
                      to="/profile" 
                      className="btn btn-secondary" 
                      style={{ 
                        justifyContent: 'flex-start', 
                        padding: '8px 12px', 
                        fontSize: '13px',
                        width: '100%'
                      }}
                      onClick={() => setShowDropdown(false)}
                    >
                      <User size={14} style={{ marginRight: '6px' }} />
                      My Profile
                    </Link>
                    <button 
                      className="btn btn-secondary" 
                      style={{ 
                        justifyContent: 'flex-start', 
                        padding: '8px 12px', 
                        fontSize: '13px',
                        width: '100%'
                      }}
                      onClick={handleLogout}
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px' }}>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
