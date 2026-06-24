import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CreditCard, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Lock,
  ArrowRight,
  Truck,
  Package,
  DollarSign
} from 'lucide-react';
import { fetchOrderDetails } from '../store/slices/orderSlice';
import { apiClient } from '../store/apiClient';
import showToast from '../utils/toast';

export const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orderDetails: order, loading, error } = useSelector((state) => state.orders);

  // Payment UI state
  const [activeTab, setActiveTab] = useState('stripe'); // 'stripe', 'razorpay' or 'cod'
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [stripeConfigError, setStripeConfigError] = useState('');
  const [razorpayConfigError, setRazorpayConfigError] = useState('');

  useEffect(() => {
    dispatch(fetchOrderDetails(orderId));
  }, [dispatch, orderId]);

  if (loading && !order) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Loader2 size={48} className="animate-spin primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container glass-card empty-placeholder" style={{ margin: '40px auto', maxWidth: '600px', textAlign: 'center' }}>
        <AlertCircle size={48} className="text-danger" style={{ marginBottom: '16px' }} />
        <h3>Failed to load Order</h3>
        <p className="text-secondary">{error || 'Order not found or unauthorized.'}</p>
        <Link to="/orders" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Back to My Orders
        </Link>
      </div>
    );
  }

  // Already Paid redirect
  if (order.isPaid) {
    return (
      <div className="container glass-card empty-placeholder" style={{ margin: '40px auto', maxWidth: '600px', textAlign: 'center' }}>
        <Check size={48} className="text-success" style={{ marginBottom: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', padding: '8px' }} />
        <h3>Order Already Paid!</h3>
        <p className="text-secondary">This order has already been successfully processed.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          <Link to="/orders" className="btn btn-secondary">
            View My Orders
          </Link>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Handle Stripe Redirection
  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    setProcessingStep('Creating Stripe Checkout session...');
    setStripeConfigError('');

    try {
      const response = await apiClient(`/orders/${order._id}/stripe-session`, {
        method: 'POST'
      });

      if (response.success && response.url) {
        setProcessingStep('Redirecting to Stripe Secure Portal...');
        window.location.href = response.url;
      } else {
        setIsProcessing(false);
        setStripeConfigError(
          response.message || 'Stripe key is not configured on the backend. Please add STRIPE_SECRET_KEY in backend .env file.'
        );
        showToast('error', 'Stripe configuration missing on the backend.');
      }
    } catch (err) {
      setIsProcessing(false);
      setStripeConfigError(err.message || 'Failed to start Stripe transaction.');
      showToast('error', err.message || 'Failed to connect to Stripe server.');
    }
  };

  // Handle Cash on Delivery Confirmation
  const handleConfirmCod = async () => {
    setIsProcessing(true);
    setProcessingStep('Confirming your Cash on Delivery order...');

    try {
      const response = await apiClient(`/orders/${order._id}/pay`, {
        method: 'PUT',
        body: JSON.stringify({ paymentMethod: 'COD' })
      });

      if (response.success) {
        setProcessingStep('Order confirmed successfully!');
        showToast('success', 'COD Order confirmed successfully!');
        setTimeout(() => {
          navigate(`/order-success/${order._id}`);
        }, 1200);
      } else {
        setIsProcessing(false);
        showToast('error', response.message || 'Failed to confirm COD order.');
      }
    } catch (err) {
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to confirm COD order.');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async () => {
    setIsProcessing(true);
    setProcessingStep('Initializing Razorpay secure portal...');
    setRazorpayConfigError('');

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setIsProcessing(false);
      showToast('error', 'Failed to load Razorpay SDK. Check your internet connection.');
      return;
    }

    try {
      const response = await apiClient(`/orders/${order._id}/razorpay-order`, {
        method: 'POST'
      });

      if (!response.success) {
        setIsProcessing(false);
        setRazorpayConfigError(response.message || 'Razorpay keys not configured on backend.');
        showToast('error', 'Razorpay key configuration is missing on the server.');
        return;
      }

      const options = {
        key: response.key || 'rzp_test_mock_key',
        amount: response.amount,
        currency: response.currency,
        name: 'VikaStore',
        description: `Order Payment for #${order._id}`,
        image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=100',
        order_id: response.orderId,
        handler: async function (paymentRes) {
          setProcessingStep('Verifying your payment transaction...');
          try {
            const verificationResponse = await apiClient(`/orders/${order._id}/razorpay-confirm`, {
              method: 'POST',
              body: JSON.stringify({
                razorpayPaymentId: paymentRes.razorpay_payment_id,
                razorpayOrderId: paymentRes.razorpay_order_id,
                razorpaySignature: paymentRes.razorpay_signature
              })
            });

            if (verificationResponse.success) {
              setProcessingStep('Payment successfully verified!');
              showToast('success', 'Razorpay payment verified successfully!');
              setTimeout(() => {
                navigate(`/order-success/${order._id}`);
              }, 1200);
            } else {
              setIsProcessing(false);
              showToast('error', verificationResponse.message || 'Verification failed.');
            }
          } catch (err) {
            setIsProcessing(false);
            showToast('error', err.message || 'Error occurred during payment verification.');
          }
        },
        prefill: {
          name: order.user?.name || '',
          email: order.user?.email || ''
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      showToast('error', err.message || 'Failed to start Razorpay payment.');
    }
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      {/* Back button */}
      <Link to="/orders" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>
        Payment Portal
      </h2>

      <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
        
        {/* Payment Methods Options and Forms */}
        <div className="payment-options-panel glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '40px' }}>
          
          {/* Payment Method Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button 
              className={`nav-link ${activeTab === 'stripe' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, paddingBottom: '12px', whiteSpace: 'nowrap' }}
              onClick={() => { setActiveTab('stripe'); setIsProcessing(false); }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: activeTab === 'stripe' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                <CreditCard size={18} />
                Stripe (Real Card)
              </span>
            </button>
            <button 
              className={`nav-link ${activeTab === 'razorpay' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, paddingBottom: '12px', whiteSpace: 'nowrap' }}
              onClick={() => { setActiveTab('razorpay'); setIsProcessing(false); }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: activeTab === 'razorpay' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                <DollarSign size={18} />
                Razorpay (UPI/Cards)
              </span>
            </button>
            <button 
              className={`nav-link ${activeTab === 'cod' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: 600, paddingBottom: '12px', whiteSpace: 'nowrap' }}
              onClick={() => { setActiveTab('cod'); setIsProcessing(false); }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: activeTab === 'cod' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                <Truck size={18} />
                Cash on Delivery (COD)
              </span>
            </button>
          </div>

          {/* STRIPE TAB CONTENT */}
          {activeTab === 'stripe' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h4 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={22} className="primary" /> Official Stripe Checkout
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Complete your transaction securely using Stripe's official hosted checkout page.
                </p>
              </div>

              <div 
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #635bff 0%, #a855f7 100%)',
                    color: 'white',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    fontSize: '28px',
                    fontWeight: 900,
                    boxShadow: '0 4px 15px rgba(99, 91, 255, 0.3)'
                  }}
                >
                  S
                </div>
                <div>
                  <h5 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Stripe Redirection Gateway</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto', lineHeight: 1.5 }}>
                    You will be redirected to a secure card entry page hosted by Stripe. We do not store your credit card details.
                  </p>
                </div>
              </div>

              {stripeConfigError && (
                <div 
                  style={{ 
                    padding: '14px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                    color: 'var(--danger)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{stripeConfigError}</span>
                </div>
              )}

              <button 
                onClick={handleStripeCheckout} 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  height: '52px', 
                  background: 'linear-gradient(135deg, #635bff 0%, #00d4ff 100%)', 
                  border: 'none', 
                  color: 'white', 
                  fontWeight: 800,
                  fontSize: '15px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Pay with Stripe (${order.totalPrice.toFixed(2)})
                <ArrowRight size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', justifyContent: 'center' }}>
                <ShieldCheck size={14} className="accent" />
                <span>Redirection is fully encrypted and PCI-DSS compliant.</span>
              </div>
            </div>
          )}

          {/* RAZORPAY TAB CONTENT */}
          {activeTab === 'razorpay' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h4 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={22} className="primary" /> Razorpay Gateway
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Pay securely via UPI, NetBanking, or Credit/Debit Cards using Razorpay.
                </p>
              </div>

              <div 
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #3395ff 0%, #00d4ff 100%)',
                    color: 'white',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    fontSize: '28px',
                    fontWeight: 900,
                    boxShadow: '0 4px 15px rgba(51, 149, 255, 0.3)'
                  }}
                >
                  R
                </div>
                <div>
                  <h5 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Razorpay Portal Integration</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto', lineHeight: 1.5 }}>
                    Upon clicking, the secure Razorpay Checkout Overlay will open. Select your preferred payment method to complete the transaction.
                  </p>
                </div>
              </div>

              {razorpayConfigError && (
                <div 
                  style={{ 
                    padding: '14px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                    color: 'var(--danger)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{razorpayConfigError}</span>
                </div>
              )}

              <button 
                onClick={handleRazorpayCheckout} 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  height: '52px', 
                  background: 'linear-gradient(135deg, #3395ff 0%, #00d4ff 100%)', 
                  border: 'none', 
                  color: 'white', 
                  fontWeight: 800,
                  fontSize: '15px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Pay with Razorpay (${order.totalPrice.toFixed(2)})
                <ArrowRight size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', justifyContent: 'center' }}>
                <ShieldCheck size={14} className="accent" />
                <span>Verification is fully encrypted and standard compliant.</span>
              </div>
            </div>
          )}

          {/* COD TAB CONTENT */}
          {activeTab === 'cod' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h4 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={22} className="primary" style={{ color: 'var(--primary)' }} /> Cash on Delivery (COD)
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Pay in cash or scan a QR code when your order is delivered to your doorstep.
                </p>
              </div>

              <div 
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                    color: 'white',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    fontSize: '28px',
                    fontWeight: 900,
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <Package size={28} />
                </div>
                <div>
                  <h5 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Instant COD Confirmation</h5>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '340px', margin: '0 auto', lineHeight: 1.5 }}>
                    Your order will be instantly confirmed and processed. No online pre-payments are required.
                  </p>
                </div>
              </div>

              <button 
                onClick={handleConfirmCod} 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  height: '52px', 
                  fontWeight: 800,
                  fontSize: '15px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Confirm Cash on Delivery Order
                <Check size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', justifyContent: 'center' }}>
                <ShieldCheck size={14} className="accent" />
                <span>Confirming holds inventory items. Cancel anytime via Orders portal.</span>
              </div>
            </div>
          )}

        </div>

        {/* Order Summary Checkout Panel */}
        <aside className="order-summary glass-card" style={{ height: 'fit-content' }}>
          <h3 className="summary-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 700 }}>
            <Lock size={16} className="primary" /> Order Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Order ID</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>#{order._id}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Items</span>
              {order.orderItems?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${order.itemsPrice?.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice?.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Tax (15%)</span>
            <span>${order.taxPrice?.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Amount Payable</span>
            <span>${order.totalPrice?.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <ShieldCheck size={18} className="accent" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Payment is secured with 256-bit SSL encryption. Stripe checkout handles your details securely.
            </span>
          </div>
        </aside>

      </div>

      {/* SECURE GATEWAY TRANSACTION PROCESSING OVERLAY */}
      {isProcessing && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(9, 11, 17, 0.9)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Loader2 size={64} className="animate-spin primary" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700 }}>
            {processingStep}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Please do not close this window or refresh the page.</p>
        </div>
      )}

    </div>
  );
};

export default Payment;
