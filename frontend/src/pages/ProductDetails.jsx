import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ShoppingCart, Heart, Star, Loader2, RefreshCw } from 'lucide-react';
import { fetchProductDetails, clearProductDetails } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import showToast from '../utils/toast';

export const ProductDetails = () => {
  const { idOrSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { product, loading, error } = useSelector((state) => state.products);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);

  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchProductDetails(idOrSlug));

    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, idOrSlug]);

  const isWishlisted = wishlistProducts?.some((p) => p._id === product?._id);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      showToast('info', 'Please login to manage your wishlist');
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        showToast('success', 'Removed from wishlist');
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        showToast('success', 'Added to wishlist');
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update wishlist');
    }
  };

  const handleQtyChange = (type) => {
    if (type === 'dec' && qty > 1) {
      setQty(qty - 1);
    } else if (type === 'inc' && qty < product.quantity) {
      setQty(qty + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('info', 'Please login to add items to your cart');
      navigate('/login');
      return;
    }

    try {
      await dispatch(addToCart({ productId: product._id, quantity: qty })).unwrap();
      showToast('success', `Added ${qty} ${product.name} to cart`);
    } catch (err) {
      showToast('error', err.message || 'Failed to add item to cart');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={16} fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <span key={i} style={{ position: 'relative', display: 'inline-block', color: 'var(--warning)' }}>
            <Star size={16} className="text-muted" />
            <span style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
              <Star size={16} fill="currentColor" />
            </span>
          </span>
        );
      } else {
        stars.push(<Star key={i} size={16} className="text-muted" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Loader2 size={48} className="animate-spin primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container glass-card empty-placeholder" style={{ margin: '40px auto' }}>
        <RefreshCw size={48} className="text-muted animate-spin" />
        <h3>Failed to Load Product</h3>
        <p className="text-secondary">{error || 'Product details are unavailable at this moment.'}</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600' }]; // Fallback

  return (
    <div className="container">
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: '24px', display: 'inline-flex', padding: '8px 16px' }}>
        <ArrowLeft size={16} />
        Back to Shop
      </Link>

      <div className="details-layout glass-card">
        
        {/* Gallery */}
        <div className="details-gallery">
          <div className="main-image-wrapper">
            <img src={images[activeImageIndex]?.url} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((img, index) => (
                <div 
                  key={index} 
                  className={`thumbnail ${activeImageIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={img.url} alt={`${product.name} thumbnail ${index}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="details-content">
          <span className="details-category">{product.category?.name}</span>
          <h2 className="details-title">{product.name}</h2>
          
          <div className="details-rating">
            <div style={{ display: 'flex', color: 'var(--warning)', gap: '4px' }}>
              {renderStars(product.ratings)}
            </div>
            <span>{product.ratings.toFixed(1)} rating</span>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--text-secondary)' }}>Verified Stock Item</span>
          </div>

          <div className="details-price">
            <span>${product.price}</span>
            <span className={`stock-status ${product.quantity > 0 ? 'stock-in' : 'stock-out'}`}>
              {product.quantity > 0 ? `${product.quantity} In Stock` : 'Out of Stock'}
            </span>
          </div>

          <p className="details-description">
            {product.description}
          </p>

          {product.quantity > 0 && (
            <div className="details-actions">
              <div className="quantity-selector">
                <button 
                  className="qty-btn" 
                  onClick={() => handleQtyChange('dec')}
                  disabled={qty <= 1}
                >
                  -
                </button>
                <span className="qty-val">{qty}</span>
                <button 
                  className="qty-btn" 
                  onClick={() => handleQtyChange('inc')}
                  disabled={qty >= product.quantity}
                >
                  +
                </button>
              </div>

              <button className="btn btn-primary" style={{ flexGrow: 1, height: '48px' }} onClick={handleAddToCart}>
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button 
                className={`btn btn-secondary btn-icon-only ${isWishlisted ? 'active' : ''}`} 
                style={{ 
                  height: '48px', 
                  width: '48px', 
                  borderRadius: 'var(--radius-sm)',
                  color: isWishlisted ? 'var(--danger)' : 'inherit',
                  borderColor: isWishlisted ? 'var(--danger)' : 'var(--border-color)',
                  background: isWishlisted ? 'rgba(239, 68, 68, 0.08)' : 'none'
                }}
                onClick={handleWishlistToggle}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
