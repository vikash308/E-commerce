import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import { fetchWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import showToast from '../utils/toast';

export const Wishlist = () => {
  const dispatch = useDispatch();
  
  const { products, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (productId, name) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      showToast('success', `Removed ${name} from wishlist`);
    } catch (err) {
      showToast('error', err.message || 'Failed to remove item');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      showToast('success', `Added ${product.name} to cart`);
    } catch (err) {
      showToast('error', err.message || 'Failed to add item to cart');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Loader2 size={48} className="animate-spin primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container glass-card empty-placeholder" style={{ margin: '40px auto', maxWidth: '600px' }}>
        <Heart size={48} className="empty-icon text-muted" />
        <h3>Your Wishlist is Empty</h3>
        <p className="text-secondary">Save items you like here to purchase them later.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>My Wishlist</h2>

      <div className="products-grid">
        {products.map((product) => {
          const imageUrl = product.images && product.images.length > 0 
            ? product.images[0].url 
            : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600';

          return (
            <div key={product._id} className="product-card glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-image-wrapper">
                <img src={imageUrl} alt={product.name} />
                <button 
                  className="wishlist-btn active"
                  onClick={() => handleRemove(product._id, product.name)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="card-details">
                <h3 className="card-title" style={{ height: 'auto', marginBottom: '8px' }}>
                  <Link to={`/product/${product._id}`}>{product.name}</Link>
                </h3>
                <span className="card-price" style={{ margin: '8px 0 16px 0' }}>${product.price}</span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: '8px', marginTop: 'auto' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ padding: '8px', fontSize: '13px' }}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity <= 0}
                  >
                    <ShoppingCart size={14} />
                    Add to Cart
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: 0 }}
                    onClick={() => handleRemove(product._id, product.name)}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
