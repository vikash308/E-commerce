import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Package, Eye } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../store/slices/orderSlice';
import showToast from '../utils/toast';

export const AdminOrders = () => {
  const dispatch = useDispatch();
  
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    if (currentStatus === 'Delivered' || currentStatus === 'Cancelled') {
      showToast('error', `Cannot change status of a completed/cancelled order`);
      return;
    }

    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      showToast('success', `Order status updated to ${newStatus}`);
      dispatch(fetchOrders()); // Reload orders list
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

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Order Management</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Track customer deliveries and update processing states</p>
      </div>

      {/* Orders Table */}
      <div className="glass-card" style={{ transition: 'none', transform: 'none' }}>
        {loading && orders.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={32} className="animate-spin primary" />
          </div>
        ) : orders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Order ID</th>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Items Count</th>
                  <th style={{ padding: '12px' }}>Total Price</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const date = new Date(order.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  const isCompleted = order.status === 'Delivered' || order.status === 'Cancelled';

                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>#{order._id}</td>
                      <td style={{ padding: '12px' }}>{date}</td>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{order.user?.name || 'Customer'}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{order.user?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Package size={14} className="text-muted" />
                          {order.orderItems?.length || 0} items
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>${order.totalPrice.toFixed(2)}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`status-badge ${getStatusClass(order.status)}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No customer orders placed yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
