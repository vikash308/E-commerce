import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FolderPlus, Edit, Trash2, Loader2, X } from 'lucide-react';
import { 
  fetchCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../store/slices/productSlice';
import showToast from '../utils/toast';

export const AdminCategories = () => {
  const dispatch = useDispatch();

  const { categories, loading } = useSelector((state) => state.products);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parent, setParent] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setParent('');
    setShowModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setParent(cat.parent?._id || cat.parent || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      showToast('error', 'Category name is required');
      return;
    }

    const categoryData = {
      name,
      description,
      parent: parent === '' ? null : parent,
    };

    try {
      if (editingId) {
        await dispatch(updateCategory({ id: editingId, categoryData })).unwrap();
        showToast('success', 'Category updated successfully!');
      } else {
        await dispatch(createCategory(categoryData)).unwrap();
        showToast('success', 'Category created successfully!');
      }
      setShowModal(false);
      dispatch(fetchCategories()); // Reload categories list
    } catch (err) {
      showToast('error', err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id, catName) => {
    if (window.confirm(`Are you sure you want to delete ${catName}? Any nested categories will lose their parent references.`)) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
        showToast('success', 'Category deleted successfully!');
        dispatch(fetchCategories()); // Reload categories list
      } catch (err) {
        showToast('error', err.message || 'Failed to delete category');
      }
    }
  };

  // Filter out the category itself from selection to prevent self-parenting loop
  const parentCandidates = categories.filter(c => c._id !== editingId);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Category Management</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Manage catalog categories and nested folder trees</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <FolderPlus size={16} />
          Add Category
        </button>
      </div>

      {/* Categories table */}
      <div className="glass-card" style={{ transition: 'none', transform: 'none' }}>
        {loading && categories.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={32} className="animate-spin primary" />
          </div>
        ) : categories.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Category Name</th>
                  <th style={{ padding: '12px' }}>Slug</th>
                  <th style={{ padding: '12px' }}>Parent Category</th>
                  <th style={{ padding: '12px' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{cat.slug}</td>
                    <td style={{ padding: '12px' }}>
                      {cat.parent?.name ? (
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)', boxShadow: 'none' }}>
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.description || <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px', minWidth: '32px', height: '32px' }}
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px', minWidth: '32px', height: '32px' }}
                          onClick={() => handleDelete(cat._id, cat.name)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No categories defined yet.
          </div>
        )}
      </div>

      {/* Category Creation Overlay Modal */}
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
            maxWidth: '450px',
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
              {editingId ? 'Edit Category' : 'Create Category'}
            </h3>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sports Equipment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Describe products in this category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Parent Category (Optional)</label>
                <select 
                  className="sort-select" 
                  value={parent} 
                  onChange={(e) => setParent(e.target.value)}
                >
                  <option value="">None (Top-Level Category)</option>
                  {parentCandidates.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', height: '48px', marginTop: '16px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingId ? 'Update Category' : 'Create Category'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
