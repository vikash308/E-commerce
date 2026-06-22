import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, SlidersHorizontal, RefreshCw, X } from 'lucide-react';
import { 
  fetchProducts, 
  fetchCategories, 
  setFilter, 
  clearFilters, 
  setPage 
} from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import heroImg from '../assets/hero.png';

export const Home = () => {
  const dispatch = useDispatch();
  
  const { 
    products, 
    categories, 
    loading, 
    filters, 
    page, 
    pages, 
    totalProducts 
  } = useSelector((state) => state.products);

  const [minPriceLocal, setMinPriceLocal] = useState(filters.minPrice);
  const [maxPriceLocal, setMaxPriceLocal] = useState(filters.maxPrice);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, filters, page]);

  // Synchronize local input state with Redux filters
  useEffect(() => {
    setMinPriceLocal(filters.minPrice);
    setMaxPriceLocal(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  const handleCategorySelect = (categoryId) => {
    dispatch(setFilter({ category: filters.category === categoryId ? '' : categoryId }));
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    dispatch(setFilter({ minPrice: minPriceLocal, maxPrice: maxPriceLocal }));
  };

  const handleSortChange = (e) => {
    dispatch(setFilter({ sort: e.target.value }));
  };

  const handleClearAll = () => {
    dispatch(clearFilters());
    setMinPriceLocal('');
    setMaxPriceLocal('');
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-line" style={{ width: '40%' }}></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', alignItems: 'center' }}>
          <div className="skeleton-line price"></div>
          <div className="skeleton-line" style={{ width: '30%', height: '32px', margin: 0 }}></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container">
      {/* Hero Glassmorphic Header */}
      {!filters.keyword && !filters.category && page === 1 && (
        <section className="hero-section glass">
          <div className="hero-content">
            <span className="hero-tag">Summer Collection 2026</span>
            <h1 className="hero-title">Experience Premium Shopping Redefined</h1>
            <p className="hero-description">
              Discover curated luxury gadgets, fashion apparel, smart home items, and books 
              engineered for modern living. Get free shipping on orders over $100.
            </p>
            <button className="btn btn-primary" onClick={() => handleCategorySelect(categories[0]?._id)}>
              Explore Categories
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="hero-image-container">
            <img src={heroImg} alt="VikaStore Hero" />
          </div>
        </section>
      )}

      {/* Main Shop Layout */}
      <div className="home-layout">
        
        {/* Sidebar Filters */}
        <aside className="sidebar-filters glass-card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} className="primary" />
              Filters
            </span>
            {(filters.category || filters.keyword || filters.minPrice || filters.maxPrice || filters.sort !== '-createdAt') && (
              <button 
                onClick={handleClearAll}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Categories</h4>
            <ul className="category-list">
              {categories.map((cat) => (
                <li 
                  key={cat._id}
                  className={`category-item ${filters.category === cat._id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat._id)}
                >
                  <span>{cat.name}</span>
                  <span style={{ fontSize: '11px', opacity: 0.5 }}>⚡</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h4 className="filter-title">Price Range ($)</h4>
            <form onSubmit={handlePriceApply}>
              <div className="price-range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  className="price-input"
                  value={minPriceLocal}
                  onChange={(e) => setMinPriceLocal(e.target.value)}
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="price-input"
                  value={maxPriceLocal}
                  onChange={(e) => setMaxPriceLocal(e.target.value)}
                  min="0"
                />
              </div>
              <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '8px', fontSize: '13px' }}>
                Apply Price
              </button>
            </form>
          </div>

          {/* Sorting Option */}
          <div className="filter-section">
            <h4 className="filter-title">Sort By</h4>
            <select className="sort-select" value={filters.sort} onChange={handleSortChange}>
              <option value="-createdAt">Newest Additions</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-ratings">Customer Rating</option>
            </select>
          </div>
        </aside>

        {/* Catalog Section */}
        <main className="products-area">
          <div className="results-header">
            <span className="results-count">
              Found <strong>{totalProducts}</strong> products
              {filters.keyword && ` for "${filters.keyword}"`}
            </span>
          </div>

          {loading ? (
            <div className="products-grid">{renderSkeletons()}</div>
          ) : products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn" 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    &laquo;
                  </button>
                  
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i + 1}
                      className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    className="page-btn" 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pages}
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card empty-placeholder">
              <RefreshCw size={48} className="empty-icon text-muted animate-spin" />
              <h3>No Products Found</h3>
              <p className="text-secondary">We couldn't find anything matching your selected filters.</p>
              <button className="btn btn-primary" onClick={handleClearAll}>
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
