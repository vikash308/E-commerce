import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { addToCart } from '../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import showToast from '../utils/toast';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { products: wishlistProducts } = useSelector((state) => state.wishlist);

  const isWishlisted = wishlistProducts?.some((p) => p._id === product._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('info', 'Please login to manage your wishlist');
      navigate('/login');
      return;
    }

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
        showToast('success', `Removed ${product.name} from wishlist`);
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
        showToast('success', `Added ${product.name} to wishlist`);
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('info', 'Please login to add items to your cart');
      navigate('/login');
      return;
    }

    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      showToast('success', `Added ${product.name} to cart`);
    } catch (err) {
      showToast('error', err.message || 'Failed to add item to cart');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <span key={i} style={{ position: 'relative', display: 'inline-block' }}>
            <Star size={14} className="text-muted" />
            <span style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden', color: 'var(--warning)' }}>
              <Star size={14} fill="currentColor" />
            </span>
          </span>
        );
      } else {
        stars.push(<Star key={i} size={14} className="text-muted" />);
      }
    }
    return stars;
  };

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0].url 
    : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600'; // Default placeholder

  return (
    <Link to={`/product/${product._id}`} className="product-card glass-card">
      <div className="card-image-wrapper">
        <img src={imageUrl} alt={product.name} loading="lazy" />
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="card-details">
        <span className="card-category">{product.category?.name || 'Category'}</span>
        <h3 className="card-title">{product.name}</h3>
        
        <div className="card-rating">
          {renderStars(product.ratings)}
          <span>({product.ratings.toFixed(1)})</span>
        </div>

        <div className="card-footer">
          <span className="card-price">${product.price}</span>
          <button 
            className="card-add-btn"
            onClick={handleAddToCart}
            disabled={product.quantity <= 0}
          >
            <ShoppingCart size={14} />
            {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
