import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, Shield, Trash2, X, Loader2 } from 'lucide-react';
import { fetchUsers, changeUserRole, removeUser } from '../store/slices/userSlice';
import { apiClient } from '../store/apiClient';
import showToast from '../utils/toast';

export const AdminUsers = () => {
  const dispatch = useDispatch();
  
  const { users, loading } = useSelector((state) => state.users);
  const currentUser = useSelector((state) => state.auth.user);

  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // New User Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setName('');
    setEmail('');
    setRole('customer');
    setShowModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('error', 'Please fill in name and email');
      return;
    }

    setModalLoading(true);

    try {
      // Call register API directly without altering active Redux auth session
      await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          name, 
          email, 
          password: 'password123', // Default initial password
          role 
        }),
      });

      showToast('success', `User ${name} created successfully! (Default Password: password123)`);
      setShowModal(false);
      dispatch(fetchUsers()); // Reload user records list
    } catch (err) {
      showToast('error', err.message || 'Failed to create user');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (currentUser?.id === id) {
      showToast('error', 'You cannot change your own role');
      return;
    }

    try {
      await dispatch(changeUserRole({ id, role: newRole })).unwrap();
      showToast('success', `User role updated to ${newRole}`);
      dispatch(fetchUsers());
    } catch (err) {
      showToast('error', err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (id, userName) => {
    if (currentUser?.id === id) {
      showToast('error', 'You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${userName}?`)) {
      try {
        await dispatch(removeUser(id)).unwrap();
        showToast('success', `User ${userName} removed successfully`);
        dispatch(fetchUsers());
      } catch (err) {
        showToast('error', err.message || 'Failed to remove user');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>User Management</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Manage administrative privileges and credentials profiles</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Users table */}
      <div className="glass-card" style={{ transition: 'none', transform: 'none' }}>
        {loading && users.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={32} className="animate-spin primary" />
          </div>
        ) : users.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Registered Date</th>
                  <th style={{ padding: '12px' }}>Current Privilege</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const date = new Date(u.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  const isSelf = currentUser?.id === u._id;

                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={14} className={u.role === 'admin' ? 'danger' : u.role === 'seller' ? 'secondary' : 'primary'} />
                        {u.name} {isSelf && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(You)</span>}
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>{date}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`status-badge ${u.role === 'admin' ? 'status-cancelled' : u.role === 'seller' ? 'status-shipped' : 'status-delivered'}`} style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <select 
                            className="sort-select"
                            style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', background: 'rgba(0,0,0,0.3)', borderColor: 'var(--border-color)' }}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={isSelf}
                          >
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                          
                          {!isSelf && (
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '6px', minWidth: '32px', height: '32px' }}
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0' }}>No users found.</p>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '32px',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>
              Create Custom Profile
            </h3>

            <form onSubmit={handleAddSubmit} className="auth-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alice Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="alice@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Access Privilege *</label>
                <select 
                  className="sort-select" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', height: '48px', marginTop: '16px' }}
                disabled={modalLoading}
              >
                {modalLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
