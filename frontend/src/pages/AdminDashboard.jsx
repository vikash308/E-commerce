import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  FolderTree, 
  ArrowUpRight, 
  TrendingUp, 
  Clock 
} from 'lucide-react';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import { fetchOrders } from '../store/slices/orderSlice';

export const AdminDashboard = () => {
  const dispatch = useDispatch();

  const { products, categories } = useSelector((state) => state.products);
  const { orders, loading } = useSelector((state) => state.orders);
  const { users } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchOrders());
  }, [dispatch]);

  // Aggregate metrics
  const activeProductsCount = products?.length || 0;
  const activeCategoriesCount = categories?.length || 0;
  const totalOrdersCount = orders?.length || 0;
  
  // Sales calculation (excludes Cancelled orders)
  const totalSales = orders
    ?.filter(o => o.status !== 'Cancelled')
    ?.reduce((acc, order) => acc + order.totalPrice, 0) || 0;

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Admin Dashboard</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Welcome to your store overview</p>
        </div>
      </div>

      {/* Grid of stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Sales widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Revenue</span>
            <DollarSign size={20} className="primary" />
          </div>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: 800 }}>${totalSales.toFixed(2)}</h3>
            <p style={{ fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <TrendingUp size={12} />
              +14% since last month
            </p>
          </div>
        </div>

        {/* Orders widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Orders</span>
            <Package size={20} className="secondary" />
          </div>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{totalOrdersCount}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Pending processing: <strong>{orders?.filter(o => o.status === 'Pending' || o.status === 'Processing').length}</strong>
            </p>
          </div>
        </div>

        {/* Products widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Products Listing</span>
            <ShoppingBag size={20} className="accent" />
          </div>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{activeProductsCount}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Across <strong>{activeCategoriesCount}</strong> categories
            </p>
          </div>
        </div>

        {/* Users widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>System Users</span>
            <FolderTree size={20} style={{ color: 'var(--warning)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{users?.length || 11}</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Customers, Sellers, and Admins
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="glass-card" style={{ transition: 'none', transform: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} className="primary" />
            Recent Customer Orders
          </h3>
          <Link to="/admin/orders" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
            View All
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Order ID</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Items</th>
                  <th style={{ padding: '12px' }}>Total</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>#{o._id}</td>
                    <td style={{ padding: '12px' }}>{o.user?.name || 'Customer'}</td>
                    <td style={{ padding: '12px' }}>{o.orderItems?.length || 0} items</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>${o.totalPrice.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`status-badge status-${o.status.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>No customer orders placed yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
