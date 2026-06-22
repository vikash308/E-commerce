import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Package, Mail, MapPin, User } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import { fetchProducts } from '../store/slices/productSlice';
import showToast from '../utils/toast';

export const SellerOrders = () => {
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { orders, loading: ordersLoading } = useSelector((state) => state.orders);
  const { products, loading: productsLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchProducts());
  }, [dispatch]);

  const isSellerOwner = (prodId) => {
    const prod = products.find(p => p._id === prodId);
    if (!prod) return false;
    const prodUserId = prod.user?._id || prod.user || '';
    return prodUserId.toString() === user?.id?.toString() || prodUserId.toString() === user?._id?.toString();
  };

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    if (currentStatus === 'Delivered' || currentStatus === 'Cancelled') {
      showToast('error', `Cannot change status of a completed/cancelled order`);
      return;
    }

    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      showToast('success', `Order status updated to ${newStatus}`);
      dispatch(fetchOrders()); // Reload orders
    } catch (err) {
      showToast('error', err.message || 'Failed to update order status');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Processing':
        return 'status-processing';
      case 'Shipped':
        return 'status-shipped';
      case 'Delivered':
        return 'status-delivered';
      case 'Cancelled':
      default:
        return 'status-cancelled';
    }
  };

  const loading = ordersLoading || productsLoading;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Order Management</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Track and fulfill customer orders containing your products</p>
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading && orders.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={32} className="animate-spin primary" />
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => {
            const date = new Date(order.createdAt).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            // Filter items that belong to this seller
            const myItems = order.orderItems.filter(item => isSellerOwner(item.product));
            const mySubtotal = myItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            const isCompleted = order.status === 'Delivered' || order.status === 'Cancelled';

            if (myItems.length === 0) return null; // Safety fallback

            return (
              <div key={order._id} className="glass-card" style={{ padding: '28px', border: '1px solid var(--border-color)', transition: 'none', transform: 'none' }}>
                {/* Header info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Order ID</span>
                    <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: 'white', margin: '4px 0 0 0' }}>#{order._id}</h4>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date Placed</span>
                    <p style={{ fontSize: '14px', fontWeight: 600, margin: '4px 0 0 0' }}>{date}</p>
                  </div>

                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Subtotal Revenue</span>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)', margin: '4px 0 0 0' }}>${mySubtotal.toFixed(2)}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`status-badge ${getStatusClass(order.status)}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                      {order.status}
                    </span>
                    <select 
                      className="sort-select"
                      style={{ padding: '6px 12px', fontSize: '12px', width: 'auto', background: 'rgba(0,0,0,0.3)', borderColor: 'var(--border-color)' }}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, order.status, e.target.value)}
                      disabled={isCompleted}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Details layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
                  {/* Items list */}
                  <div>
                    <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-secondary)' }}>Your Items in Order</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {myItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600'} 
                            alt={item.name} 
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div style={{ flexGrow: 1 }}>
                            <h6 style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>{item.name}</h6>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quantity: {item.quantity} × ${item.price}</span>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer and Shipping Details */}
                  <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '32px' }}>
                    <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: 'var(--text-secondary)' }}>Customer & Delivery Info</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Name */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <User size={16} className="primary" style={{ marginTop: '2px' }} />
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Contact Name</span>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>{order.user?.name || 'Customer'}</p>
                        </div>
                      </div>

                      {/* Email */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Mail size={16} className="primary" style={{ marginTop: '2px' }} />
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span>
                          <p style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', margin: 0 }}>{order.user?.email || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Address */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <MapPin size={16} className="primary" style={{ marginTop: '2px' }} />
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Shipping Address</span>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                            {order.shippingAddress?.address}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                            {order.shippingAddress?.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No customer orders placed yet for your items.
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
