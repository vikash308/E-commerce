import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Image as ImageIcon, 
  X 
} from 'lucide-react';
import { 
  fetchProducts, 
  fetchCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../store/slices/productSlice';
import showToast from '../utils/toast';

export const AdminProducts = () => {
  const dispatch = useDispatch();

  const { products, categories, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setCategory(categories[0]?._id || '');
    setImageFiles([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingId(prod._id);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setQuantity(prod.quantity);
    setCategory(prod.category?._id || prod.category || '');
    setImageFiles([]); // Reset file uploads
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || price === '' || quantity === '' || !category) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('category', category);
    
    // Append files
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      if (editingId) {
        await dispatch(updateProduct({ id: editingId, formData })).unwrap();
        showToast('success', 'Product updated successfully!');
      } else {
        await dispatch(createProduct(formData)).unwrap();
        showToast('success', 'Product created successfully!');
      }
      setShowModal(false);
      dispatch(fetchProducts()); // Reload products list
    } catch (err) {
      showToast('error', err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id, prodName) => {
    if (window.confirm(`Are you sure you want to delete ${prodName}?`)) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        showToast('success', 'Product deleted successfully!');
        dispatch(fetchProducts()); // Reload products list
      } catch (err) {
        showToast('error', err.message || 'Failed to delete product');
      }
    }
  };

  // Filter products locally for search, and limit based on role (sellers only see their own products)
  const isSeller = user?.role === 'seller';
  const displayProducts = products
    .filter((prod) => {
      const matchSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prod.description.toLowerCase().includes(searchTerm.toLowerCase());
      if (isSeller) {
        // Seller ownership check
        return matchSearch && (prod.user?._id === user.id || prod.user === user.id);
      }
      return matchSearch;
    });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>Product Management</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isSeller ? 'Manage your shop listings' : 'Manage all system products'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Search Input bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', transition: 'none', transform: 'none' }}>
        <Search size={18} className="text-muted" />
        <input
          type="text"
          placeholder="Filter products by name..."
          className="search-input"
          style={{ width: '100%', maxWidth: '400px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product List Table */}
      <div className="glass-card" style={{ transition: 'none', transform: 'none' }}>
        {loading && displayProducts.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={32} className="animate-spin primary" />
          </div>
        ) : displayProducts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Image</th>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Stock</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayProducts.map((prod) => {
                  const imageUrl = prod.images && prod.images.length > 0 
                    ? prod.images[0].url 
                    : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600';

                  return (
                    <tr key={prod._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px' }}>
                        <img 
                          src={imageUrl} 
                          alt={prod.name} 
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} 
                        />
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{prod.name}</td>
                      <td style={{ padding: '12px' }}>{prod.category?.name || 'Category'}</td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>${prod.price}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`stock-status ${prod.quantity > 0 ? 'stock-in' : 'stock-out'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                          {prod.quantity}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px', minWidth: '32px', height: '32px' }}
                            onClick={() => handleOpenEditModal(prod)}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px', minWidth: '32px', height: '32px' }}
                            onClick={() => handleDelete(prod._id, prod.name)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No products found matching filters.
          </div>
        )}
      </div>

      {/* Overlay Create/Edit Modal Dialog */}
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
            maxWidth: '550px',
            maxHeight: '90vh',
            overflowY: 'auto',
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
              {editingId ? 'Edit Product Details' : 'Create New Product listing'}
            </h3>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mechanical Keyboard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Enter detailed description of the product..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="99.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="25"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select 
                  className="sort-select" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Product Images</label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.1)',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <ImageIcon size={24} className="text-muted" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click to upload multiple images</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                  />
                </div>
                {imageFiles.length > 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '6px' }}>
                    {imageFiles.length} file(s) selected: {imageFiles.map(f => f.name).join(', ')}
                  </p>
                )}
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
                  editingId ? 'Update Product' : 'Create Product'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
