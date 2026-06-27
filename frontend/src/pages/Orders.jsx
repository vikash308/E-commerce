import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Package, Calendar, MapPin, DollarSign, Loader2, ArrowLeft, XCircle, Printer } from 'lucide-react';
import { fetchOrders, cancelOrder } from '../store/slices/orderSlice';
import showToast from '../utils/toast';
import { printInvoice } from '../utils/invoice';

export const Orders = () => {
  const dispatch = useDispatch();
  
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders({ personal: true }));
  }, [dispatch]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await dispatch(cancelOrder(orderId)).unwrap();
        showToast('success', 'Order cancelled successfully');
      } catch (err) {
        showToast('error', err.message || 'Failed to cancel order');
      }
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

  if (loading && orders.length === 0) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Loader2 size={48} className="animate-spin primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container glass-card empty-placeholder" style={{ margin: '40px auto', maxWidth: '600px' }}>
        <Package size={48} className="empty-icon text-muted" />
        <h3>No Orders Yet</h3>
        <p className="text-secondary">You haven't placed any orders yet. Head over to our catalog to make a purchase!</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>My Orders</h2>

      <div className="orders-list">
        {orders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          return (
            <div key={order._id} className="order-card glass-card" style={{ transition: 'none', transform: 'none' }}>
              
              {/* Order Header */}
              <div className="order-header">
                <div className="order-meta-item">
                  <span className="order-meta-label">Order ID</span>
                  <span className="order-meta-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    #{order._id}
                  </span>
                </div>

                <div className="order-meta-item">
                  <span className="order-meta-label">Date Placed</span>
                  <span className="order-meta-val" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                    <Calendar size={14} className="primary" />
                    {date}
                  </span>
                </div>

                <div className="order-meta-item">
                  <span className="order-meta-label">Total Amount</span>
                  <span className="order-meta-val" style={{ display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 800 }}>
                    ${order.totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="order-meta-item">
                  <span className="order-meta-label">Status</span>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items & Shipping details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
                
                {/* Items */}
                <div className="order-items-grid">
                  <span className="order-meta-label" style={{ marginBottom: '8px', display: 'block' }}>Items Ordered</span>
                  {order.orderItems?.map((item, index) => (
                    <div key={index} className="order-item-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px', marginBottom: '8px' }}>
                      <div className="order-item-name-qty">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="order-item-img" />
                        )}
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping info / Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '1px solid var(--border-color)', paddingLeft: '32px' }}>
                  {/* Shipping Address & Payment Method in one line */}
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <div style={{ flex: '1 1 180px' }}>
                      <span className="order-meta-label" style={{ marginBottom: '6px', display: 'block' }}>Shipping Address</span>
                      <p style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        <MapPin size={16} className="primary" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>
                          {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                        </span>
                      </p>
                    </div>

                    <div style={{ flex: '0 0 auto', minWidth: '140px' }}>
                      <span className="order-meta-label" style={{ marginBottom: '6px', display: 'block' }}>Payment Method</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', margin: 0 }}>
                          {order.paymentMethod === 'COD' ? 'Cash On Delivery' : (order.paymentMethod === 'Card' ? 'Stripe' : order.paymentMethod)}
                        </p>
                        <span 
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: order.isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: order.isPaid ? 'var(--accent)' : 'var(--danger)',
                            border: `1px solid ${order.isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                          }}
                        >
                          {order.isPaid ? 'PAID' : 'UNPAID'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Pay Now & Cancel & Print Invoice) */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
                    {order.status === 'Pending' && !order.isPaid && (
                      <Link 
                        to={`/payment/${order._id}`} 
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <DollarSign size={14} />
                        Pay Now
                      </Link>
                    )}
                    <button 
                      onClick={() => printInvoice(order)} 
                      className="btn btn-secondary" 
                      style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Printer size={14} />
                      Invoice
                    </button>
                    {(order.status === 'Pending' || order.status === 'Processing') && (
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        <XCircle size={14} />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
