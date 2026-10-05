import { API_BASE } from '../config';
import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Hourglass, SearchX, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import './TourListPage.css';

const TOURS_PER_PAGE = 6;

// Gom các giá trị có trong dữ liệu để dựng bộ lọc (không hard-code danh mục)
const buildDestinationOptions = (tours) => {
  const set = new Set();
  tours.forEach((t) => {
    if (t.destination) set.add(String(t.destination));
  });
  return Array.from(set).sort();
};

const buildDurationOptions = (tours) => {
  const set = new Set();
  tours.forEach((t) => {
    if (t.duration) set.add(String(t.duration));
  });
  return Array.from(set).sort();
};

const TourListPage = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc + sắp xếp + phân trang
  const [filterDestination, setFilterDestination] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || searchParams.get('destination') || '';

  const loadTours = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/tours`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải danh sách tour (HTTP ' + res.status + ')');
        return res.json();
      })
      .then(data => {
        setTours(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi tải danh sách tour:', err);
        setError('Không thể tải danh sách tour. Vui lòng kiểm tra kết nối và thử lại.');
        setTours([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset trang khi bộ lọc/tìm kiếm thay đổi
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterDestination, filterDuration, filterPrice, sortBy]);

  const filteredTours = useMemo(() => {
    let results = tours;

    if (searchQuery) {
      results = results.filter(t =>
        (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.destination && t.destination.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (filterDestination) {
      results = results.filter(t => t.destination === filterDestination);
    }
    if (filterDuration) {
      results = results.filter(t => t.duration === filterDuration);
    }
    if (filterPrice) {
      if (filterPrice === 'under-1m') results = results.filter(t => (Number(t.price) || 0) < 1000000);
      else if (filterPrice === '1-2m') results = results.filter(t => (Number(t.price) || 0) >= 1000000 && (Number(t.price) || 0) < 2000000);
      else if (filterPrice === '2-3m') results = results.filter(t => (Number(t.price) || 0) >= 2000000 && (Number(t.price) || 0) < 3000000);
      else if (filterPrice === 'over-3m') results = results.filter(t => (Number(t.price) || 0) >= 3000000);
    }

    // Sắp xếp
    if (sortBy === 'price-asc') results = [...results].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sortBy === 'price-desc') results = [...results].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    else if (sortBy === 'name') results = [...results].sort((a, b) => String(a.name).localeCompare(String(b.name), 'vi'));
    // newest: giữ thứ tự API (created_at DESC)

    return results;
  }, [tours, searchQuery, filterDestination, filterDuration, filterPrice, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / TOURS_PER_PAGE));
  const pageTours = filteredTours.slice((page - 1) * TOURS_PER_PAGE, page * TOURS_PER_PAGE);

  const destinationOptions = useMemo(() => buildDestinationOptions(tours), [tours]);
  const durationOptions = useMemo(() => buildDurationOptions(tours), [tours]);

  const hasActiveFilter = filterDestination || filterDuration || filterPrice || sortBy !== 'newest';

  const clearFilters = () => {
    setFilterDestination('');
    setFilterDuration('');
    setFilterPrice('');
    setSortBy('newest');
  };

  const filterControls = (
    <>
      <div className="filter-control">
        <label htmlFor="filter-destination">Điểm đến</label>
        <select id="filter-destination" value={filterDestination} onChange={(e) => setFilterDestination(e.target.value)}>
          <option value="">Tất cả điểm đến</option>
          {destinationOptions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="filter-control">
        <label htmlFor="filter-duration">Thời lượng</label>
        <select id="filter-duration" value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)}>
          <option value="">Mọi thời lượng</option>
          {durationOptions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="filter-control">
        <label htmlFor="filter-price">Mức giá</label>
        <select id="filter-price" value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)}>
          <option value="">Mọi mức giá</option>
          <option value="under-1m">Dưới 1 triệu</option>
          <option value="1-2m">1 - 2 triệu</option>
          <option value="2-3m">2 - 3 triệu</option>
          <option value="over-3m">Trên 3 triệu</option>
        </select>
      </div>
      <div className="filter-control">
        <label htmlFor="filter-sort">Sắp xếp</label>
        <select id="filter-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
          <option value="name">Tên A → Z</option>
        </select>
      </div>
      {hasActiveFilter && (
        <button className="filter-clear" onClick={clearFilters}>Xóa bộ lọc</button>
      )}
    </>
  );

  return (
    <div className="search-results-page">
      <div className="container">
        <h2 className="page-title">{searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Tất cả Tour của Vuo Travel'}</h2>

        {/* Filter bar (desktop) */}
        <div className="filter-bar">
          {filterControls}
        </div>

        {/* Nút mở filter trên mobile */}
        <button className="filter-toggle" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal size={18}/> Lọc & Sắp xếp
          {hasActiveFilter && <span className="filter-count-dot" aria-label="Đang có bộ lọc"></span>}
        </button>

        {/* Filter drawer (mobile) */}
        {filterOpen && (
          <div className="filter-drawer-overlay" onClick={() => setFilterOpen(false)}>
            <div className="filter-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Bộ lọc tour">
              <div className="filter-drawer-header">
                <h3>Lọc & Sắp xếp</h3>
                <button className="filter-drawer-close" aria-label="Đóng bộ lọc" onClick={() => setFilterOpen(false)}><X size={22} /></button>
              </div>
              <div className="filter-drawer-body">{filterControls}</div>
              <button className="btn-solid-gold" style={{ margin: '0 16px 16px', width: 'auto' }} onClick={() => setFilterOpen(false)}>
                Xem kết quả
              </button>
            </div>
          </div>
        )}

        <div className="tour-list-vertical">
          {loading ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tải dữ liệu...</p>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px' }}>
              <SearchX size={48} color="#94a3b8" style={{ margin: '0 auto 15px' }} />
              <p style={{ color: '#e11d48' }}>{error}</p>
              <button className="btn-solid-gold" style={{ marginTop: '20px', width: 'auto', padding: '12px 28px' }} onClick={loadTours}>
                Thử lại
              </button>
            </div>
          ) : pageTours.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px' }}>
              <SearchX size={48} color="#94a3b8" style={{ margin: '0 auto 15px' }} />
              <h3 style={{ color: '#475569' }}>Không tìm thấy tour nào!</h3>
              <p style={{ color: '#64748b', marginTop: '10px' }}>Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
              <Link to="/tours" className="btn-solid-gold" style={{ marginTop: '20px', display: 'inline-block', width: 'auto', padding: '12px 28px' }}>Xem tất cả</Link>
            </div>
          ) : (
            pageTours.map((tour, index) => (
              <div className="tour-card-wide" key={tour.id || index}>
                <div className="tc-img">
                  <img src={tour.image_url} alt={tour.name} loading="lazy" />
                </div>
                <div className="tc-content">
                  <h3>{tour.name}</h3>
                  <div className="tc-details-grid">
                    <div className="tc-detail-item">
                      <MapPin size={16}/> <span><strong>Điểm đến:</strong> {tour.destination || '—'}</span>
                    </div>
                    <div className="tc-detail-item">
                      <Hourglass size={16}/> <span><strong>Thời lượng:</strong> {tour.duration || '—'}</span>
                    </div>
                  </div>
                  {tour.description && (
                    <p className="tc-description">{tour.description}</p>
                  )}
                </div>
                <div className="tc-action">
                  <div className="tc-price">từ <span>{Number(tour.price).toLocaleString('vi-VN')}đ</span></div>
                  <Link to={`/tours/${tour.id}`} className="btn-outline-gold">Xem chi tiết</Link>
                  <Link to={`/booking/${tour.id}`} className="btn-solid-gold">Đặt ngay</Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && pageTours.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              aria-label="Trang trước"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="page-info">Trang {page} / {totalPages}</span>
            <button
              className="page-btn"
              disabled={page >= totalPages}
              aria-label="Trang sau"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourListPage;
