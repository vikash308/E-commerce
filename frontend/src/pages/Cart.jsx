import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ShoppingBag, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { fetchCart, updateCartItemQty, removeFromCart } from '../store/slices/cartSlice';
import { createOrder, resetOrderState } from '../store/slices/orderSlice';
import showToast from '../utils/toast';

export const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cart, loading: cartLoading } = useSelector((state) => state.cart);
  const { loading: orderLoading, success: orderSuccess, error: orderError } = useSelector((state) => state.orders);

  // Shipping address form fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (orderError) {
      showToast('error', orderError);
      dispatch(resetOrderState());
    }
  }, [orderError, dispatch]);

  const handleQtyChange = async (productId, currentQty, stockQty, action) => {
    let newQty = currentQty;
    if (action === 'dec' && currentQty > 1) {
      newQty = currentQty - 1;
    } else if (action === 'inc' && currentQty < stockQty) {
      newQty = currentQty + 1;
    } else if (action === 'inc') {
      showToast('error', `Cannot set more than stock quantity (${stockQty})`);
      return;
    }

    if (newQty !== currentQty) {
      try {
        await dispatch(updateCartItemQty({ productId, quantity: newQty })).unwrap();
      } catch (err) {
        showToast('error', err.message || 'Failed to update quantity');
      }
    }
  };

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
      showToast('success', 'Item removed from cart');
    } catch (err) {
      showToast('error', err.message || 'Failed to remove item');
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!address || !city || !postalCode || !country) {
      showToast('error', 'Please provide complete shipping details');
      return;
    }

    const orderData = {
      shippingAddress: {
        address,
        city,
        postalCode,
        country,
      },
      paymentMethod: 'Card', // Default to online checkout; payment selection is made on the payment page
    };

    try {
      const response = await dispatch(createOrder(orderData)).unwrap();
      const order = response.data;
      dispatch(resetOrderState());
      showToast('success', 'Order created! Opening payment portal...');
      navigate(`/payment/${order._id}`);
    } catch (err) {
      showToast('error', typeof err === 'string' ? err : err.message || 'Failed to place order');
    }
  };

  // Calculations
  const subtotal = cart?.items?.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) || 0;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = Number((0.15 * subtotal).toFixed(2));
  const total = subtotal + shipping + tax;

  if (cartLoading && !cart) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Loader2 size={48} className="animate-spin primary" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container glass-card empty-placeholder" style={{ margin: '40px auto', maxWidth: '600px' }}>
        <ShoppingBag size={48} className="empty-icon text-muted" />
        <h3>Your Cart is Empty</h3>
        <p className="text-secondary">Explore our catalog and find items that fit your styles and needs.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Shopping Cart</h2>

      <div className="cart-layout">
        {/* Cart items list */}
        <div className="cart-items-list">
          {cart.items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const imageUrl = product.images && product.images.length > 0 
              ? product.images[0].url 
              : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600';

            return (
              <div key={product._id} className="cart-item glass-card" style={{ transition: 'none', transform: 'none' }}>
                <div className="cart-item-image">
                  <img src={imageUrl} alt={product.name} />
                </div>

                <div className="cart-item-details">
                  <h4 className="cart-item-title">{product.name}</h4>
                  <p className="cart-item-price">${product.price}</p>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-selector" style={{ height: '36px' }}>
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQtyChange(product._id, item.quantity, product.quantity, 'dec')}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="qty-val" style={{ width: '30px' }}>{item.quantity}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => handleQtyChange(product._id, item.quantity, product.quantity, 'inc')}
                      disabled={item.quantity >= product.quantity}
                    >
                      +
                    </button>
                  </div>

                  <span style={{ fontWeight: 700, minWidth: '70px', textAlign: 'right' }}>
                    ${(product.price * item.quantity).toFixed(2)}
                  </span>

                  <button 
                    className="remove-item-btn" 
                    onClick={() => handleRemove(product._id)}
                    style={{ background: 'none', border: 'none' }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary / Checkout panel */}
        <aside className="order-summary glass-card" style={{ transition: 'none', transform: 'none' }}>
          <h3 className="summary-title">Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Tax (15%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Order Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {/* Shipping Form */}
          <form onSubmit={handleCheckoutSubmit} className="checkout-form">
            <h4 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '4px' }}>
              Shipping Details
            </h4>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                className="form-input"
                placeholder="123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                className="form-input"
                placeholder="San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                className="form-input"
                placeholder="94111"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                className="form-input"
                placeholder="United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: '48px', marginTop: '20px' }}
              disabled={orderLoading}
            >
              {orderLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Order...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', justifyContent: 'center' }}>
            <ShieldCheck size={14} className="accent" />
            <span>Secure Checkout and Payment Encryption</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
