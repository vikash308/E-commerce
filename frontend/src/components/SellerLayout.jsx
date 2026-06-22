import React from 'react';
import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  ArrowLeft, 
  ShieldAlert 
} from 'lucide-react';

export const SellerLayout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Security checks: user must be authenticated AND have role seller
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'seller') {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px' }}>
        <ShieldAlert size={48} className="danger animate-bounce" />
        <h3>Access Denied</h3>
        <p className="text-secondary">You do not have seller permissions to access this area.</p>
        <NavLink to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Back to Shop
        </NavLink>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', marginTop: '20px', minHeight: 'calc(100vh - 120px)' }}>
      {/* Seller Sidebar Navigation */}
      <aside className="glass-card" style={{ height: 'fit-content', position: 'sticky', top: '108px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Portal:</span>
            <span style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>Seller</span>
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Storefront controls</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink 
            to="/seller" 
            end
            className={({ isActive }) => `category-item ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/seller/products" 
            className={({ isActive }) => `category-item ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <ShoppingBag size={16} />
            <span>My Products</span>
          </NavLink>

          <NavLink 
            to="/seller/orders" 
            className={({ isActive }) => `category-item ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Package size={16} />
            <span>My Orders</span>
          </NavLink>
        </nav>

        <hr style={{ borderColor: 'var(--border-color)', margin: '10px 0' }} />

        <NavLink to="/" className="btn btn-secondary" style={{ width: '100%', fontSize: '13px', padding: '10px' }}>
          <ArrowLeft size={14} />
          Go to Shop
        </NavLink>
      </aside>

      {/* Main Seller Section View */}
      <main style={{ minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
