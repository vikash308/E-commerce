import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  CreditCard
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer glass" style={{ borderTop: '1px solid var(--border-color)', marginTop: '64px', padding: '64px 0 24px 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px', marginBottom: '48px' }}>
        
        {/* Brand Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VikaStore
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            Your ultimate premium shopping destination. Explore our curated collections of premium electronics, fashion apparel, books, sports equipment, and high-end home decor.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" style={{ color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" style={{ color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
              <Twitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" style={{ color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
              <Instagram size={20} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" style={{ color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
              <Youtube size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" style={{ color: 'var(--text-secondary)', transition: 'var(--transition-fast)' }}>
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Shop Departments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'white' }}>Shop Departments</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/products" className="footer-link" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>All Products</Link></li>
            <li><Link to="/products?keyword=iPhone" className="footer-link" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Smartphones</Link></li>
            <li><Link to="/products?keyword=MacBook" className="footer-link" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Laptops & Computers</Link></li>
            <li><Link to="/products?keyword=Jacket" className="footer-link" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Men's & Women's Fashion</Link></li>
            <li><Link to="/products?keyword=Book" className="footer-link" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Bestselling Books</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'white' }}>Customer Support</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/orders" className="footer-link" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Track Your Orders</Link></li>
            <li><Link to="/profile" className="footer-link" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>My Account Details</Link></li>
            <li><Link to="/wishlist" className="footer-link" style={{ fontSize: '14px', color: 'var(--text-secondary)', textDecoration: 'none' }}>My Wishlist Inventory</Link></li>
            <li><span style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'default' }}>Return & Exchange Policy</span></li>
            <li><span style={{ fontSize: '14px', color: 'var(--text-secondary)', cursor: 'default' }}>Secure Payment Guarantee</span></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'white' }}>Contact Coordinates</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <span>102 Premium Corporate Towers, Block C, New Delhi, India</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <Phone size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>+91 98765 43210</span>
            </li>
            <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <Mail size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>support@vikastore.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="container" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
          <span>© {new Date().getFullYear()} VikaStore. All rights reserved. Made for premium quality checkout.</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <CreditCard size={16} />
          <span>Payments: UPI • Visa • Mastercard • Cash On Delivery</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
