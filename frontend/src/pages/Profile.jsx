import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, ShieldCheck, ShoppingBag, DollarSign, LogOut, ArrowRight, Edit3, Key, Loader2, X } from 'lucide-react';
import { fetchOrders } from '../store/slices/orderSlice';
import { logoutUser, updateUserProfile, clearAuthError, requestSellerRole } from '../store/slices/authSlice';
import { clearCartState } from '../store/slices/cartSlice';
import { clearWishlistState } from '../store/slices/wishlistSlice';
import { clearOrdersState } from '../store/slices/orderSlice';
import showToast from '../utils/toast';

export const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.auth);
  const { orders } = useSelector((state) => state.orders);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Sync state when user details load or when starting edit
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, isEditing]);

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
    dispatch(clearOrdersState());
    showToast('success', 'Logged out successfully');
    navigate('/login');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('error', 'Name and Email are required');
      return;
    }

    const updateData = { name, email };

    if (showPasswordFields && newPassword) {
      if (!currentPassword) {
        showToast('error', 'Please enter your current password to change it');
        return;
      }
      if (newPassword.length < 6) {
        showToast('error', 'New password must be at least 6 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('error', 'New passwords do not match');
        return;
      }
      updateData.currentPassword = currentPassword;
      updateData.newPassword = newPassword;
    }

    try {
      const resultAction = await dispatch(updateUserProfile(updateData));
      if (updateUserProfile.fulfilled.match(resultAction)) {
        showToast('success', 'Profile updated successfully!');
        setIsEditing(false);
        setShowPasswordFields(false);
        // Clear passwords
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast('error', resultAction.payload || 'Failed to update profile');
      }
    } catch (err) {
      showToast('error', 'An error occurred. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowPasswordFields(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    dispatch(clearAuthError());
  };

  const handleRequestSeller = async () => {
    try {
      const resultAction = await dispatch(requestSellerRole());
      if (requestSellerRole.fulfilled.match(resultAction)) {
        showToast('success', 'Seller application submitted successfully!');
      } else {
        showToast('error', resultAction.payload || 'Failed to submit application');
      }
    } catch (err) {
      showToast('error', 'An error occurred. Please try again.');
    }
  };

  // Calculations
  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const nonCancelledOrders = orders?.filter(o => o.status !== 'Cancelled') || [];
  const totalOrdersCount = orders?.length || 0;
  const totalSpent = nonCancelledOrders.reduce((acc, order) => acc + order.totalPrice, 0);

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>My Profile</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Profile Card Summary */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '32px', padding: '32px', transition: 'none', transform: 'none' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '36px',
            fontWeight: 800,
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
            flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              {user?.name}
            </h3>
            <span className="status-badge status-delivered" style={{ fontSize: '11px', textTransform: 'capitalize', fontWeight: 700 }}>
              {user?.role} Account
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isEditing && (
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)} style={{ gap: '6px', padding: '10px 16px', fontSize: '13px' }}>
                <Edit3 size={14} />
                Edit Profile
              </button>
            )}
            <button className="btn btn-outline" onClick={handleLogout} style={{ gap: '6px', padding: '10px 16px', fontSize: '13px', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'rgb(239, 68, 68)' }}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', transition: 'none', transform: 'none' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Orders Placed</p>
              <h4 style={{ fontSize: '20px', fontWeight: 800 }}>{totalOrdersCount} orders</h4>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', transition: 'none', transform: 'none' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent)' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Spent</p>
              <h4 style={{ fontSize: '20px', fontWeight: 800 }}>${totalSpent.toFixed(2)}</h4>
            </div>
          </div>
        </div>

        {/* Become a Seller Section */}
        {user?.role === 'customer' && (
          <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'none', transform: 'none' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              Become a Seller on VikaStore
            </h4>
            
            {(!user.sellerRequestStatus || user.sellerRequestStatus === 'none') && (
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                  Want to sell your own merchandise? Apply to become a seller! You'll be able to publish products, manage your inventory, and view store statistics directly from the portal once approved.
                </p>
                <button 
                  className="btn btn-primary"
                  style={{ width: 'fit-content' }}
                  onClick={handleRequestSeller}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Seller Application'}
                </button>
              </div>
            )}

            {user.sellerRequestStatus === 'pending' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: 'var(--warning)'
              }}>
                <Loader2 size={20} className="animate-spin" />
                <div>
                  <h5 style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>Application Under Review</h5>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                    Your request to become a seller is currently pending admin validation.
                  </p>
                </div>
              </div>
            )}

            {user.sellerRequestStatus === 'rejected' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: 'var(--danger)',
                  marginBottom: '16px'
                }}>
                  <X size={20} />
                  <div>
                    <h5 style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>Application Declined</h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                      Unfortunately, your application was declined. You can adjust your profile details and re-apply.
                    </p>
                  </div>
                </div>
                <button 
                  className="btn btn-primary"
                  style={{ width: 'fit-content' }}
                  onClick={handleRequestSeller}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Re-apply for Seller Account'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Account Details / Edit Box */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'none', transform: 'none' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '4px' }}>
            {isEditing ? 'Modify Account Details' : 'Account Details'}
          </h4>

          {error && <div className="auth-error" style={{ marginBottom: '10px' }}>{error}</div>}

          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="name">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      id="name"
                      className="form-input"
                      style={{ paddingLeft: '38px', width: '100%' }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      id="email"
                      className="form-input"
                      style={{ paddingLeft: '38px', width: '100%' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Change Trigger */}
              <div style={{ marginTop: '5px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ gap: '8px', padding: '8px 12px', fontSize: '12px' }}
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                  <Key size={14} />
                  {showPasswordFields ? 'Hide Change Password' : 'Change Security Password'}
                </button>
              </div>

              {showPasswordFields && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="form-input"
                      style={{ width: '100%' }}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required={newPassword.length > 0}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        className="form-input"
                        style={{ width: '100%' }}
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        className="form-input"
                        style={{ width: '100%' }}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button type="button" className="btn btn-secondary" style={{ width: '120px' }} onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <User size={18} className="primary" style={{ marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Full Name</p>
                    <p style={{ fontWeight: 600, fontSize: '15px' }}>{user?.name}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Mail size={18} className="primary" style={{ marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</p>
                    <p style={{ fontWeight: 600, fontSize: '15px', wordBreak: 'break-all' }}>{user?.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Calendar size={18} className="primary" style={{ marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Member Since</p>
                    <p style={{ fontWeight: 600, fontSize: '15px' }}>{joinedDate}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <ShieldCheck size={18} className="primary" style={{ marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Account Level</p>
                    <p style={{ fontWeight: 600, fontSize: '15px', textTransform: 'capitalize' }}>{user?.role}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <Link to="/orders" className="btn btn-primary" style={{ flexGrow: 1, padding: '10px' }}>
                  View Orders History
                  <ArrowRight size={16} />
                </Link>
                <Link to="/" className="btn btn-secondary" style={{ flexGrow: 1, padding: '10px' }}>
                  Back to Shopping
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
