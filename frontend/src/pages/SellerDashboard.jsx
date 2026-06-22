import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  DollarSign, 
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchOrders } from '../store/slices/orderSlice';

export const SellerDashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { products, loading: productsLoading } = useSelector((state) => state.products);
  const { orders, loading: ordersLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchOrders());
  }, [dispatch]);

  const isSellerOwner = (prod) => {
    if (!prod) return false;
    const prodUserId = prod.user?._id || prod.user || '';
    return prodUserId.toString() === user?.id?.toString() || prodUserId.toString() === user?._id?.toString();
  };

  // Filter seller's own products
  const myProducts = products.filter(isSellerOwner);
  const totalProducts = myProducts.length;
  
  // Calculate items out of stock
  const outOfStock = myProducts.filter(p => p.quantity <= 0).length;

  // Since backend filters orders by seller's items, orders already contains only orders containing seller's items
  const totalOrders = orders.length;

  // Calculate total revenue for this seller
  const totalRevenue = orders.reduce((sum, order) => {
    const myOrderItems = order.orderItems.filter(item => 
      myProducts.some(p => p._id === item.product)
    );
    const orderSales = myOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return sum + orderSales;
  }, 0);

  const loading = productsLoading || ordersLoading;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Seller Dashboard</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Welcome back! Monitor your storefront performance and sales statistics</p>
      </div>

      {loading && orders.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 size={32} className="animate-spin primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {/* Revenue card */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', transition: 'none', transform: 'none' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Revenue</p>
                <h4 style={{ fontSize: '24px', fontWeight: 800 }}>${totalRevenue.toFixed(2)}</h4>
              </div>
            </div>

            {/* Products Card */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', transition: 'none', transform: 'none' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Listed Products</p>
                <h4 style={{ fontSize: '24px', fontWeight: 800 }}>{totalProducts} Items</h4>
              </div>
            </div>

            {/* Orders Card */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', transition: 'none', transform: 'none' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--secondary)' }}>
                <Package size={24} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</p>
                <h4 style={{ fontSize: '24px', fontWeight: 800 }}>{totalOrders} Orders</h4>
              </div>
            </div>

            {/* Out of Stock Card */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', transition: 'none', transform: 'none' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Out of Stock</p>
                <h4 style={{ fontSize: '24px', fontWeight: 800 }}>{outOfStock} Products</h4>
              </div>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="glass-card" style={{ padding: '28px', transition: 'none', transform: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800 }}>Recent Customer Orders</h3>
              <NavLink to="/seller/orders" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                View All Orders
                <ArrowRight size={14} />
              </NavLink>
            </div>

            {orders.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px' }}>Order ID</th>
                      <th style={{ padding: '12px' }}>Customer</th>
                      <th style={{ padding: '12px' }}>Total Price</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => {
                      const date = new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });

                      const myItems = order.orderItems.filter(item => 
                        myProducts.some(p => p._id === item.product)
                      );
                      const mySubtotal = myItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                      return (
                        <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>#{order._id}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontWeight: 600 }}>{order.user?.name || 'Customer'}</span>
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>{order.user?.email}</span>
                          </td>
                          <td style={{ padding: '12px', fontWeight: 700 }}>${mySubtotal.toFixed(2)}</td>
                          <td style={{ padding: '12px' }}>
                            <span className="status-badge status-processing" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>{date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                No customer orders recorded yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SellerDashboard;
