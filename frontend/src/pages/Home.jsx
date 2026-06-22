import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Truck, 
  CreditCard, 
  Award, 
  ShieldCheck, 
  Percent, 
  Sparkles, 
  Mail, 
  Star, 
  CheckCircle2, 
  Clock, 
  Flame,
  Laptop,
  Shirt,
  ChefHat,
  BookOpen,
  Bike,
  ShoppingBag
} from 'lucide-react';
import { fetchProducts, fetchCategories, clearFilters } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 12, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 }; // Reset loop
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
      <Clock size={16} />
      <span>ENDS IN:</span>
      <div style={{ display: 'flex', gap: '4px' }}>
        <span style={{ background: '#1f2937', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>{String(timeLeft.hours).padStart(2, '0')}h</span> :
        <span style={{ background: '#1f2937', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>{String(timeLeft.minutes).padStart(2, '0')}m</span> :
        <span style={{ background: '#1f2937', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
};

export const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, categories, loading } = useSelector((state) => state.products);

  const [activeSlide, setActiveSlide] = useState(0);
  const [emailSub, setEmailSub] = useState('');
  const [subbed, setSubbed] = useState(false);

  const slides = [
    {
      title: "Summer Tech Extravaganza",
      tagline: "UP TO 40% OFF",
      desc: "Upgrade your gear with the latest Titanium smartphones, M-series laptops, and tactile mechanical keyboards.",
      image: "/electronics_sale_banner.png",
      btnText: "Shop Electronics",
      categoryIndex: 0
    },
    {
      title: "Classic Wardrobe Refresh",
      tagline: "FLAT 50% SALE",
      desc: "Step out in style with organic cotton t-shirts, slim denim, and premium leather jackets built for comfort.",
      image: "/clothing_sale_banner.png",
      btnText: "Explore Clothing",
      categoryIndex: 1
    },
    {
      title: "Bestselling Literary Deals",
      tagline: "STARTING FROM $9",
      desc: "Explore galaxy-wide science fiction chronicles, modern web development guides, and inspiring bios.",
      image: "/books_sale_banner.png",
      btnText: "Browse Books",
      categoryIndex: 3
    }
  ];

  // Auto-scroll slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);



  useEffect(() => {
    dispatch(clearFilters());
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  const handleExploreSlide = (slide) => {
    const cat = categories[slide.categoryIndex];
    if (cat) {
      navigate(`/products?category=${cat._id}`);
    } else {
      navigate('/products');
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub.trim()) {
      setSubbed(true);
      setEmailSub('');
      setTimeout(() => setSubbed(false), 5000);
    }
  };

  // Category specific icons for the circle menu
  const getCategoryIcon = (name) => {
    const size = 26;
    switch (name) {
      case 'Electronics': return <Laptop size={size} />;
      case 'Clothing': return <Shirt size={size} />;
      case 'Home & Kitchen': return <ChefHat size={size} />;
      case 'Books': return <BookOpen size={size} />;
      case 'Sports & Outdoors': return <Bike size={size} />;
      default: return <ShoppingBag size={size} />;
    }
  };

  // Category specific gradient backgrounds
  const getCategoryGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #818cf8, #4f46e5)',
      'linear-gradient(135deg, #34d399, #059669)',
      'linear-gradient(135deg, #fbbf24, #d97706)',
      'linear-gradient(135deg, #f87171, #dc2626)',
      'linear-gradient(135deg, #c084fc, #9333ea)'
    ];
    return gradients[index % gradients.length];
  };

  const getSubcategories = (name) => {
    switch (name) {
      case 'Electronics': return ['iPhone', 'MacBook', 'Sony', 'Keyboard', 'Monitor'];
      case 'Clothing': return ['Jacket', 'Dress', 'Shoes', 'Jeans', 'Beanie'];
      case 'Home & Kitchen': return ['Coffee Maker', 'Air Fryer', 'Blender', 'Vacuum', 'Thermostat'];
      case 'Books': return ['JS', 'Steve Jobs', 'History', 'Habit', 'Sci-Fi'];
      case 'Sports & Outdoors': return ['Yoga Mat', 'Bottle', 'Tent', 'Backpack', 'Helmet'];
      default: return [];
    }
  };

  const getCategoryColor = (index) => {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];
    return colors[index % colors.length];
  };

  // Static mockup brands
  const brands = [
    { name: "Apple", logoText: "APPLE" },
    { name: "Sony", logoText: "SONY" },
    { name: "Dell", logoText: "DELL" },
    { name: "Nike", logoText: "NIKE" },
    { name: "Adidas", logoText: "adidas" }
  ];

  // Static reviews
  const testimonials = [
    {
      name: "Aarav Sharma",
      role: "Verified Purchaser",
      comment: "Super fast checkout! The iPhone 15 Pro was delivered in pristine condition within 2 days.",
      stars: 5
    },
    {
      name: "Priya Patel",
      role: "Gold Member",
      comment: "Highly impressed by the dark theme UI. Extremely responsive and cart updates feel premium.",
      stars: 5
    },
    {
      name: "Kabir Mehta",
      role: "Verified Purchaser",
      comment: "Great customer support! Had an query on Category listings and got resolved instantly.",
      stars: 4
    }
  ];

  return (
    <div className="container">
      {/* 1. HERO CAROUSEL BLOCK */}
      <section 
        className="hero-section glass" 
        style={{ 
          backgroundImage: `linear-gradient(to right, rgba(9, 11, 17, 0.95) 30%, rgba(9, 11, 17, 0.3) 100%), url(${slides[activeSlide].image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '380px'
        }}
      >
        <div className="hero-content">
          <span className="hero-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Percent size={14} />
            {slides[activeSlide].tagline}
          </span>
          <h1 className="hero-title">{slides[activeSlide].title}</h1>
          <p className="hero-description">{slides[activeSlide].desc}</p>
          <button className="btn btn-primary" onClick={() => handleExploreSlide(slides[activeSlide])}>
            {slides[activeSlide].btnText}
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Carousel indicators */}
        <div style={{ position: 'absolute', bottom: '20px', left: '48px', display: 'flex', gap: '8px' }}>
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setActiveSlide(i)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: activeSlide === i ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            />
          ))}
        </div>
      </section>

      <section style={{ margin: '48px 0' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
          <h3 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '22px', 
            fontWeight: 800, 
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            Shop by Category
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>
            Explore curated collections across our top departments
          </span>
        </div>

        <div className="scrollable-category-bar">
          {categories.map((cat, index) => {
            const color = getCategoryColor(index);
            const gradient = getCategoryGradient(index);
            
            return (
              <div 
                key={cat._id}
                onClick={() => handleCategoryClick(cat._id)}
                className="category-item-container"
                style={{
                  '--circle-hover-glow': `${color}40`
                }}
              >
                {/* Gradient Circular Icon Wrapper ("Gol Gol") */}
                <div 
                  className="category-gradient-circle"
                  style={{
                    background: gradient
                  }}
                >
                  {getCategoryIcon(cat.name)}
                </div>
                
                {/* Category Name */}
                <span className="category-circle-name">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FLASH SALE & COUNTER BLOCK (NEW SECTION) */}
      <section className="glass" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', margin: '48px 0', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', display: 'inline-flex' }}>
              <Flame size={20} />
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, margin: 0 }}>Limited Flash Sale</h3>
          </div>
          
          <CountdownTimer />
        </div>

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-line" style={{ width: '40%' }}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {products.slice(4, 8).map((product, idx) => (
              <div key={product._id} style={{ display: 'flex', flexDirection: 'column' }}>
                <ProductCard product={product} />
                {/* Stock tracker visual overlay */}
                <div style={{ padding: '0 12px', marginTop: '12px', zIndex: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>{85 - idx * 10}% Claimed</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Only {4 + idx} Left!</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${85 - idx * 10}%`, height: '100%', background: 'linear-gradient(90deg, var(--danger), var(--secondary))', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. FEATURED PRODUCTS & TRENDS */}
      <section style={{ margin: '64px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="primary" size={24} />
            Trending Hot Deals
          </h3>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate('/products')}
          >
            View All Products
            <ArrowRight size={14} style={{ marginLeft: '4px' }} />
          </button>
        </div>

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-line"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. TOP BRANDS DIRECTORY (NEW SECTION) */}
      <section style={{ margin: '64px 0' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
          Shop By Premium Brands
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
          {brands.map((brand) => (
            <div 
              key={brand.name}
              onClick={() => navigate(`/products?keyword=${brand.name}`)}
              style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'var(--transition-normal)'
              }}
              className="glass"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(99, 102, 241, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', opacity: 0.8 }}>
                {brand.logoText}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS & FEEDBACK (NEW SECTION) */}
      <section style={{ margin: '64px 0' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '28px', textAlign: 'center' }}>
          What Our Customer Say
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < t.stars ? 'var(--warning)' : 'none'} color="var(--warning)" />
                ))}
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--text-secondary)', flexGrow: 1 }}>"{t.comment}"</p>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>{t.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} />
                  {t.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. GLASS NEWSLETTER BAR (NEW SECTION) */}
      <section 
        className="glass" 
        style={{ 
          padding: '48px', 
          borderRadius: 'var(--radius-lg)', 
          margin: '64px 0 48px 0',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}
      >
        <div style={{ maxWidth: '500px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Join Our Community</span>
          <h3 style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>Get $10 Off Your First Order</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Subscribe to our newsletter for exclusive coupons, fresh arrivals notifications, and members-only deals.
          </p>
        </div>

        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '12px', flexGrow: 1, maxWidth: '460px' }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Mail size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
            <input 
              type="email"
              placeholder="Enter your email"
              value={emailSub}
              onChange={(e) => setEmailSub(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                outline: 'none',
                fontSize: '14px'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', borderRadius: 'var(--radius-sm)' }}>
            Subscribe
          </button>
        </form>
        
        {subbed && (
          <div style={{ width: '100%', color: 'var(--accent)', fontSize: '14px', fontWeight: 600, textAlign: 'center', marginTop: '-12px' }}>
            🎉 Thank you for subscribing! Your discount coupon has been sent.
          </div>
        )}
      </section>

      {/* 8. TRUST HIGHLIGHTS */}
      <section 
        className="glass" 
        style={{ 
          padding: '40px', 
          borderRadius: 'var(--radius-lg)', 
          marginBottom: '48px',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--primary)', padding: '10px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-sm)' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Free Express Delivery</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>On all orders exceeding $100. Dispatched within 24 hours.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--accent)', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Secure Payments</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Fully encrypted checkout support with Card, UPI, or cash on delivery.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--secondary)', padding: '10px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 'var(--radius-sm)' }}>
              <Award size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Curated Quality</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Products sourced strictly from verified manufacturers and sellers.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--danger)', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>24/7 Safe Buyer Support</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Dedicated helpline desk to handle disputes, returns, and trackings.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
