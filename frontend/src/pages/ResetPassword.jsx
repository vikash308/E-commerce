import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { resetPasswordUser, clearAuthError } from '../store/slices/authSlice';
import showToast from '../utils/toast';

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      showToast('error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    
    try {
      const resultAction = await dispatch(resetPasswordUser({ token, password }));
      if (resetPasswordUser.fulfilled.match(resultAction)) {
        showToast('success', 'Password reset successfully! Please log in with your new password.');
        navigate('/login');
      } else {
        showToast('error', resultAction.payload || 'Failed to reset password');
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

        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Choose a secure password to restore access to your account.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
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
                type="password"
                id="password"
                className="form-input"
                style={{ paddingLeft: '44px', width: '100%' }}
                placeholder="New Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock 
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
                type="password"
                id="confirmPassword"
                className="form-input"
                style={{ paddingLeft: '44px', width: '100%' }}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
