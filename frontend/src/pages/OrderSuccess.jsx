import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, ShoppingBag, ArrowRight, ClipboardList, MapPin, Calendar, Printer, Loader2, AlertTriangle } from 'lucide-react';
import { fetchOrderDetails } from '../store/slices/orderSlice';
import { apiClient } from '../store/apiClient';
import { printInvoice } from '../utils/invoice';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const canvasRef = useRef(null);

  const { orderDetails: order, loading } = useSelector((state) => state.orders);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    
    if (sessionId) {
      const confirmStripePayment = async () => {
        setIsVerifying(true);
        try {
          const res = await apiClient(`/orders/${orderId}/stripe-confirm`, {
            method: 'POST',
            body: JSON.stringify({ sessionId })
          });
          if (res.success) {
            dispatch(fetchOrderDetails(orderId));
          } else {
            setVerificationError(res.message || 'Stripe payment verification failed.');
          }
        } catch (err) {
          setVerificationError(err.message || 'Failed to verify Stripe payment.');
        } finally {
          setIsVerifying(false);
        }
      };
      confirmStripePayment();
    } else {
      dispatch(fetchOrderDetails(orderId));
    }
  }, [dispatch, orderId]);

  // Confetti Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];
    const confettiCount = 150;
    const particles = [];

    for (let i = 0; i < confettiCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        r: Math.random() * 6 + 4,
        d: Math.random() * confettiCount,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        // Draw particle
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        // Reset particle position if it goes off bottom
        if (p.y > height) {
          particles[idx] = {
            ...p,
            x: Math.random() * width,
            y: -20,
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: p.tiltAngleIncremental,
            tiltAngle: p.tiltAngle,
            r: p.r,
            d: p.d,
            color: p.color
          };
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Stop after 6 seconds to prevent performance leak
    const timeoutId = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      if (ctx) ctx.clearRect(0, 0, width, height);
    }, 6000);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [order]);

  // Delivery Estimate: 4 days from order creation
  const getDeliveryEstimate = () => {
    const baseDate = order?.createdAt ? new Date(order.createdAt) : new Date();
    baseDate.setDate(baseDate.getDate() + 4);
    return baseDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isVerifying) {
    return (
      <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px', gap: '16px' }}>
        <Loader2 size={48} className="animate-spin primary" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Verifying Stripe Payment...</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Please do not close this window or refresh.</p>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="container glass-card empty-placeholder" style={{ margin: '40px auto', maxWidth: '600px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <AlertTriangle size={48} style={{ color: 'var(--danger)' }} />
        <h3>Payment Verification Failed</h3>
        <p className="text-secondary">{verificationError}</p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <Link to={`/payment/${orderId}`} className="btn btn-primary">
            Retry Payment
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ position: 'relative', overflow: 'visible' }}>
      {/* Confetti canvas overlay */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 999
        }}
      />

      <div style={{ maxWidth: '680px', margin: '20px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Main success banner */}
        <div 
          className="glass-card" 
          style={{ 
            textAlign: 'center', 
            padding: '48px 32px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '50%', color: 'var(--accent)', animation: 'pulse-accent 2s infinite' }}>
            <CheckCircle size={56} />
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 }}>
            Order Placed Successfully!
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '480px', lineHeight: 1.6 }}>
            Thank you for your purchase! Your order has been placed. You will receive email confirmation shortly.
          </p>

          {order && (
            <div style={{ display: 'inline-flex', gap: '8px', fontSize: '14px', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
              <strong style={{ fontFamily: 'var(--font-mono)' }}>#{order._id}</strong>
            </div>
          )}
        </div>

        {order && (
          <>
            {/* Info Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Delivery Estimation */}
              <div className="glass-card" style={{ display: 'flex', gap: '14px' }}>
                <Calendar size={24} className="primary" style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Estimated Delivery</h4>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>{getDeliveryEstimate()}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>4 Business Days Delivery</p>
                </div>
              </div>

              {/* Shipping Destination */}
              <div className="glass-card" style={{ display: 'flex', gap: '14px' }}>
                <MapPin size={24} className="primary" style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Shipping Address</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {order.shippingAddress?.address},<br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode},<br />
                    {order.shippingAddress?.country}
                  </p>
                </div>
              </div>

            </div>

            {/* Order Items & Totals breakdown */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', margin: 0 }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                        />
                      )}
                      <div>
                        <p style={{ fontWeight: 600 }}>{item.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>${order.itemsPrice?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shipping</span>
                  <span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice?.toFixed(2)}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Tax</span>
                  <span>${order.taxPrice?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: 800, fontSize: '16px', marginTop: '4px' }}>
                  <span>Total Placed</span>
                  <span>${order.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
          {order && (
            <button 
              onClick={() => printInvoice(order)} 
              className="btn btn-secondary" 
              style={{ flex: '1 1 100%', height: '48px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}
            >
              <Printer size={16} />
              Print Invoice
            </button>
          )}
          <Link to="/orders" className="btn btn-secondary" style={{ flex: 1, height: '48px' }}>
            <ClipboardList size={16} />
            View My Orders
          </Link>
          <Link to="/" className="btn btn-primary" style={{ flex: 1, height: '48px' }}>
            <ShoppingBag size={16} />
            Continue Shopping
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes pulse-accent {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
