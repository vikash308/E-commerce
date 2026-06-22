import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { forgotPasswordUser, clearAuthError } from '../store/slices/authSlice';
import showToast from '../utils/toast';

export const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('error', 'Please provide your email address');
      return;
    }
    
    try {
      const resultAction = await dispatch(forgotPasswordUser(email));
      if (forgotPasswordUser.fulfilled.match(resultAction)) {
        showToast('success', 'Password reset email sent successfully!');
        setSubmitted(true);
      } else {
        showToast('error', resultAction.payload || 'Request failed');
      }
    } catch (err) {
      showToast('error', 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your email address and we'll send you a link to reset your password.</p>

        {error && <div className="auth-error">{error}</div>}

        {submitted ? (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📧</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '10px' }}>
              Check Your Inbox
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.5' }}>
              We've sent a password reset link to <strong style={{ color: 'var(--primary)' }}>{email}</strong>.
            </p>
            <div className="auth-info-box" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              If you don't receive an email within a few minutes, please check your spam folder or try requesting the link again. The link will expire in 10 minutes.
            </div>
            <button 
              onClick={() => setSubmitted(false)} 
              className="btn btn-outline" 
              style={{ width: '100%' }}
            >
              Try Another Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)' 
                  }} 
                />
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  style={{ paddingLeft: '44px', width: '100%' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', height: '48px', marginTop: '10px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
