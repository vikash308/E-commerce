import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="container">
      {/* Shimmering Hero Banner Placeholder */}
      <div 
        className="glass skeleton-card" 
        style={{ 
          height: '240px', 
          marginBottom: '48px', 
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '16px',
          padding: '48px'
        }}
      >
        <div className="skeleton-line" style={{ width: '20%', height: '24px' }}></div>
        <div className="skeleton-line" style={{ width: '50%', height: '40px' }}></div>
        <div className="skeleton-line" style={{ width: '70%', height: '16px' }}></div>
      </div>

      {/* Main Layout: Sidebar & Products Grid */}
      <div className="home-layout">
        {/* Sidebar Skeleton */}
        <aside className="sidebar-filters glass-card" style={{ height: 'fit-content', gap: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="skeleton-line" style={{ width: '40%', height: '24px' }}></div>
          <div style={{ borderBottom: '1px solid var(--border-color)', margin: '4px 0' }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton-line" style={{ width: '30%', height: '16px' }}></div>
            <div className="skeleton-line" style={{ width: '80%', height: '36px', borderRadius: 'var(--radius-sm)' }}></div>
            <div className="skeleton-line" style={{ width: '75%', height: '36px', borderRadius: 'var(--radius-sm)' }}></div>
            <div className="skeleton-line" style={{ width: '90%', height: '36px', borderRadius: 'var(--radius-sm)' }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div className="skeleton-line" style={{ width: '40%', height: '16px' }}></div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="skeleton-line" style={{ height: '36px', borderRadius: 'var(--radius-sm)' }}></div>
              <div className="skeleton-line" style={{ height: '36px', borderRadius: 'var(--radius-sm)' }}></div>
            </div>
          </div>
        </aside>

        {/* Products Catalog Skeleton */}
        <main className="products-area">
          <div className="results-header" style={{ marginBottom: '16px' }}>
            <div className="skeleton-line" style={{ width: '150px', height: '20px' }}></div>
          </div>

          <div className="products-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton-card">
                <div className="skeleton-image" style={{ borderRadius: 'var(--radius-sm)' }}></div>
                <div className="skeleton-line" style={{ width: '35%', height: '14px', marginTop: '16px' }}></div>
                <div className="skeleton-line" style={{ width: '85%', height: '20px', marginTop: '12px' }}></div>
                <div className="skeleton-line short" style={{ height: '14px', marginTop: '8px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', alignItems: 'center' }}>
                  <div className="skeleton-line price" style={{ width: '30%', height: '24px', margin: 0 }}></div>
                  <div className="skeleton-line" style={{ width: '35%', height: '32px', borderRadius: 'var(--radius-sm)', margin: 0 }}></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
