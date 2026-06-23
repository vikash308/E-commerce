import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, ShoppingCart, Heart, Star, Loader2, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import { fetchProductDetails, clearProductDetails, createProductReview, updateProductReview, deleteProductReview } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import showToast from '../utils/toast';
import ProductCard from '../components/ProductCard';
import { apiClient } from '../store/apiClient';

export const ProductDetails = () => {
  const { idOrSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { product, loading, error } = useSelector((state) => state.products);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);

  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [sellerLoading, setSellerLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchProductDetails(idOrSlug));

    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, idOrSlug]);

  useEffect(() => {
    const fetchExtraProducts = async () => {
      if (product) {
        // Fetch other products by this seller
        if (product.user) {
          const sellerId = typeof product.user === 'object' ? product.user._id : product.user;
          try {
            setSellerLoading(true);
            const res = await apiClient(`/products?seller=${sellerId}`);
            if (res && res.data) {
              setSellerProducts(res.data.filter(p => p._id !== product._id));
            }
          } catch (err) {
            console.error('Failed to fetch seller products', err);
          } finally {
            setSellerLoading(false);
          }
        }

        // Fetch related products in same category
        if (product.category) {
          const catId = typeof product.category === 'object' ? product.category._id : product.category;
          try {
            setRelatedLoading(true);
            const res = await apiClient(`/products?category=${catId}`);
            if (res && res.data) {
              setRelatedProducts(res.data.filter(p => p._id !== product._id));
            }
          } catch (err) {
            console.error('Failed to fetch related products', err);
          } finally {
            setRelatedLoading(false);
          }
        }
      }
    };

    fetchExtraProducts();
  }, [product]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('error', 'Please write a comment');
      return;
    }
    setSubmittingReview(true);
    try {
      if (isEditingReview) {
        await dispatch(
          updateProductReview({
            productId: product._id,
            rating,
            comment,
          })
        ).unwrap();
        showToast('success', 'Review updated successfully!');
        setIsEditingReview(false);
      } else {
        await dispatch(
          createProductReview({
            productId: product._id,
            rating,
            comment,
          })
        ).unwrap();
        showToast('success', 'Review submitted successfully!');
      }
      setComment('');
      setRating(5);
    } catch (err) {
      showToast('error', err || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async () => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await dispatch(deleteProductReview(product._id)).unwrap();
        showToast('success', 'Review deleted successfully!');
        setIsEditingReview(false);
        setComment('');
        setRating(5);
      } catch (err) {
        showToast('error', err || 'Failed to delete review');
      }
    }
  };

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
            <span>{(product.ratings || 0).toFixed(1)} rating</span>
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

      <div className="reviews-section" style={{ marginTop: '40px', minWidth: 0 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>
          Customer Reviews ({product.numReviews})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          {/* Reviews list - Horizontal scroll */}
          {!product.reviews || product.reviews.length === 0 ? (
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div 
              className="horizontal-scroll" 
              style={{ 
                display: 'flex', 
                overflowX: 'auto', 
                gap: '16px', 
                padding: '8px 4px 16px 4px', 
                scrollbarWidth: 'thin',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {product.reviews.map((rev) => {
                const isMyReview = rev.user === user?.id || rev.user?._id === user?.id;
                return (
                  <div 
                    key={rev._id} 
                    className="glass-card" 
                    style={{ 
                      flex: '0 0 320px', 
                      padding: '20px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      transition: 'none',
                      transform: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                          {rev.name}
                          {isMyReview && (
                            <span style={{ fontSize: '11px', color: 'var(--primary)', marginLeft: '8px', fontWeight: 500 }}>(You)</span>
                          )}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      
                      {isMyReview && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setRating(rev.rating);
                              setComment(rev.comment);
                              setIsEditingReview(true);
                            }}
                            style={{ 
                              background: 'rgba(99, 102, 241, 0.08)', 
                              border: '1px solid rgba(99, 102, 241, 0.2)', 
                              color: 'var(--primary)', 
                              cursor: 'pointer', 
                              padding: '5px', 
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.16)';
                              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)';
                            }}
                            title="Edit review"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={handleReviewDelete}
                            style={{ 
                              background: 'rgba(239, 68, 68, 0.08)', 
                              border: '1px solid rgba(239, 68, 68, 0.2)', 
                              color: 'var(--danger)', 
                              cursor: 'pointer', 
                              padding: '5px', 
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                            }}
                            title="Delete review"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', color: 'var(--warning)', gap: '2px' }}>
                      {renderStars(rev.rating)}
                    </div>
                    
                    <p style={{ 
                      fontSize: '13px', 
                      color: 'var(--text-secondary)', 
                      margin: 0,
                      lineHeight: '1.5',
                      overflowY: 'auto',
                      maxHeight: '80px',
                      scrollbarWidth: 'none'
                    }}>
                      {rev.comment}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Review Form */}
          <div className="glass-card" style={{ padding: '24px', transition: 'none', transform: 'none', maxWidth: '600px', width: '100%', marginTop: '8px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
              {isEditingReview ? 'Edit Your Review' : 'Write a Review'}
            </h4>
            {!isAuthenticated ? (
              <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Please login to share your feedback.</p>
                <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', padding: '8px 16px' }}>
                  Log In
                </Link>
              </div>
            ) : product.reviews?.some(r => r.user === user?.id || r.user?._id === user?.id) && !isEditingReview ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0 }}>You have already reviewed this product.</p>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    const myRev = product.reviews.find(r => r.user === user?.id || r.user?._id === user?.id);
                    if (myRev) {
                      setRating(myRev.rating);
                      setComment(myRev.comment);
                      setIsEditingReview(true);
                    }
                  }}
                  style={{ width: 'fit-content', padding: '6px 12px', fontSize: '13px' }}
                >
                  Edit My Review
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Rating</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star
                          size={24}
                          fill={star <= rating ? 'var(--warning)' : 'none'}
                          color={star <= rating ? 'var(--warning)' : 'var(--text-muted)'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="comment" style={{ display: 'block', marginBottom: '8px' }}>Comment</label>
                  <textarea
                    id="comment"
                    className="form-input"
                    rows="4"
                    placeholder="Describe your experience with this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submittingReview}
                  style={{ width: '100%', height: '44px' }}
                >
                  {submittingReview ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    isEditingReview ? 'Update Review' : 'Submit Review'
                  )}
                </button>

                {isEditingReview && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setIsEditingReview(false);
                      setComment('');
                      setRating(5);
                    }}
                    style={{ width: '100%', height: '44px' }}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Seller & Recommendations Section */}
      {product.user && (
        <div className="seller-recommendations-section" style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <hr style={{ borderColor: 'var(--border-color)', margin: '20px 0' }} />
          
          {/* Seller's Other Products */}
          <div style={{ minWidth: 0 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>More Products from</span>
              <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{product.user.name}</span>
              {product.user.email && (
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.04)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)', marginLeft: '4px' }}>
                  {product.user.email}
                </span>
              )}
            </h4>
            {sellerLoading ? (
              <div style={{ display: 'flex', padding: '40px 0', gap: '12px' }}>
                <Loader2 className="animate-spin primary" size={24} />
                <span style={{ color: 'var(--text-secondary)' }}>Loading other products...</span>
              </div>
            ) : sellerProducts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No other products listed by this seller.</p>
            ) : (
              <div 
                className="horizontal-scroll" 
                style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  gap: '20px', 
                  padding: '8px 4px 16px 4px', 
                  scrollbarWidth: 'thin',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {sellerProducts.map((p) => (
                  <div key={p._id} style={{ flex: '0 0 260px' }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '10px 0' }} />

          {/* Related Products */}
          <div style={{ minWidth: 0 }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Related Products
            </h4>
            {relatedLoading ? (
              <div style={{ display: 'flex', padding: '40px 0', gap: '12px' }}>
                <Loader2 className="animate-spin primary" size={24} />
                <span style={{ color: 'var(--text-secondary)' }}>Loading related products...</span>
              </div>
            ) : relatedProducts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No related products found in this category.</p>
            ) : (
              <div 
                className="horizontal-scroll" 
                style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  gap: '20px', 
                  padding: '8px 4px 16px 4px', 
                  scrollbarWidth: 'thin',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {relatedProducts.map((p) => (
                  <div key={p._id} style={{ flex: '0 0 260px' }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
