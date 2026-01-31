import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../utils';
import api from '../../../services/api.service.js';
import SeatListModal from './components/SeatListModal.jsx';
import Navigation from '../Navigation.jsx';
import Footer from '../components/Footer.jsx';

const initialFilters = {
    departure: '',
    destination: '',
    departureDate: '',
    bus_id: '',
    priceRange: '',
    sortBy: 'departure_time:asc',
    page: 1,
    limit: 20
};

export default function BusList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [filters, setFilters] = useState(initialFilters);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedBus, setSelectedBus] = useState(null);
    const [showSeats, setShowSeats] = useState(false);
    const [stations, setStations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(false);
    const [cars, setCars] = useState([]);
    const [loadingCars, setLoadingCars] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    useEffect(() => {
        fetchStations();
        fetchCars();
    }, []);

    useEffect(() => {
        const departure = searchParams.get('departure') || '';
        const destination = searchParams.get('destination') || '';
        const departureDate = searchParams.get('departureDate') || '';
        const bus_id = searchParams.get('bus_id') || '';
        if (departure || destination || departureDate || bus_id) {
            setFilters(prev => ({ ...prev, departure, destination, departureDate, bus_id }));
        }
    }, [searchParams]);

    const queryParams = useMemo(() => ({
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        departure: filters.departure || undefined,
        destination: filters.destination || undefined,
        departureDate: filters.departureDate || undefined,
        bus_id: filters.bus_id || undefined,
    }), [filters]);

    const fetchStations = async () => {
        setLoadingStations(true);
        try {
            const res = await api.getStations({ includeAuth: false, suppressUnauthorizedRedirect: true });
            if (res.success) {
                const payload = res.data;
                const list = payload?.responseObject || payload?.data || payload || [];
                setStations(Array.isArray(list) ? list : []);
            }
        } catch (e) { console.error(e); }
        finally { setLoadingStations(false); }
    };

    const fetchCars = async () => {
        setLoadingCars(true);
        try {
            const res = await api.getCars({ includeAuth: false, suppressUnauthorizedRedirect: true });
            if (res.success) {
                const payload = res.data;
                const list = payload?.responseObject?.results || payload?.data || payload || [];
                setCars(Array.isArray(list) ? list : []);
            }
        } catch (e) { console.error(e); }
        finally { setLoadingCars(false); }
    };

    const fetchSchedules = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.getVehicleSchedules({ ...queryParams, includeAuth: false, suppressUnauthorizedRedirect: true });
            if (res.success) {
                const list = res.data?.responseObject?.results || res.data?.results || [];
                setSchedules(list);
            } else {
                setError(res.error || 'Không thể tải lịch trình');
            }
        } catch (e) {
            setError(e.message || 'Không thể tải lịch trình');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [queryParams.page, queryParams.limit, queryParams.sortBy, queryParams.departure, queryParams.destination, queryParams.departureDate, queryParams.bus_id]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value, page: 1 };
        setFilters(newFilters);
        const newSearchParams = new URLSearchParams(searchParams);
        if (value) newSearchParams.set(name, value);
        else newSearchParams.delete(name);
        setSearchParams(newSearchParams);
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        setSearchParams(new URLSearchParams());
    };

    const handleOpenSeats = (schedule) => { setSelectedBus(schedule); setShowSeats(true); };
    const handleCloseSeats = () => { setShowSeats(false); setSelectedBus(null); };

    const getStationName = (id) => stations.find(s => s.id == id)?.location || 'N/A';

    const styles = {
        pageWrapper: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Segoe UI', 'Roboto', -apple-system, sans-serif" },
        heroSection: { background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)', padding: '48px 0 60px', position: 'relative', overflow: 'hidden' },
        heroDecor: { position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', top: '-300px', right: '-200px' },
        heroContent: { maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 },
        heroTitle: { fontSize: '36px', fontWeight: '700', color: '#fff', marginBottom: '8px' },
        heroSubtitle: { fontSize: '18px', color: 'rgba(255,255,255,0.85)', marginBottom: '24px' },
        quickSearch: { display: 'flex', flexWrap: 'wrap', gap: '12px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' },
        quickInput: { flex: '1 1 200px', padding: '14px 16px', borderRadius: '10px', border: 'none', fontSize: '15px', background: '#fff', outline: 'none' },
        quickButton: { padding: '14px 32px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)' },
        mainLayout: { maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', display: 'flex', gap: '32px' },
        sidebar: { width: '300px', flexShrink: 0 },
        sidebarCard: { background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', position: 'sticky', top: '24px' },
        sidebarHeader: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        sidebarTitle: { fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' },
        clearBtn: { fontSize: '13px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' },
        filterGroup: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9' },
        filterLabel: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '10px' },
        filterSelect: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#fff', cursor: 'pointer' },
        filterInput: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
        resultsArea: { flex: 1, minWidth: 0 },
        resultsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
        resultsCount: { fontSize: '16px', color: '#64748b' },
        sortSelect: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff' },
        tripCard: { background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' },
        tripCardInner: { display: 'flex', padding: '20px', gap: '20px', flexWrap: 'wrap' },
        tripImage: { width: '140px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' },
        tripInfo: { flex: 1, minWidth: '200px' },
        tripCompany: { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
        tripName: { fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' },
        tripRoute: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
        routePoint: { display: 'flex', alignItems: 'center', gap: '6px' },
        routeDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' },
        routeArrow: { color: '#94a3b8', fontSize: '16px', margin: '0 4px' },
        routeText: { fontSize: '14px', color: '#334155' },
        tripMeta: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
        metaItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' },
        metaIcon: { fontSize: '16px' },
        tripActions: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: '150px' },
        tripPrice: { textAlign: 'right' },
        priceLabel: { fontSize: '12px', color: '#64748b' },
        priceValue: { fontSize: '24px', fontWeight: '700', color: '#0f172a' },
        actionButtons: { display: 'flex', gap: '8px', marginTop: '12px' },
        detailBtn: { padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#334155', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
        bookBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' },
        emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px' },
        emptyIcon: { fontSize: '48px', marginBottom: '16px' },
        emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' },
        emptyText: { fontSize: '14px', color: '#64748b' },
        loadingState: { textAlign: 'center', padding: '40px', color: '#64748b' },
        mobileFilterToggle: { display: 'none', position: 'fixed', bottom: '24px', right: '24px', zIndex: 100, padding: '16px 24px', borderRadius: '50px', background: '#1e40af', color: '#fff', border: 'none', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 20px rgba(30, 64, 175, 0.4)' },
    };

    const mobileStyles = `
        @media (max-width: 900px) {
            .bus-list-sidebar { display: none !important; }
            .bus-list-mobile-toggle { display: flex !important; align-items: center; gap: 8px; }
            .bus-list-main { padding: 16px !important; }
        }
        @media (max-width: 600px) {
            .trip-card-inner { flex-direction: column !important; }
            .trip-actions { flex-direction: row !important; align-items: center !important; width: 100% !important; justify-content: space-between !important; margin-top: 16px; }
        }
    `;

    return (
        <div style={styles.pageWrapper}>
            <style>{mobileStyles}</style>
            <Navigation />

            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroDecor}></div>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>Tìm chuyến xe của bạn</h1>
                    <p style={styles.heroSubtitle}>Hơn 500+ tuyến đường trên khắp Việt Nam, đặt vé dễ dàng chỉ trong vài phút</p>
                    <div style={styles.quickSearch}>
                        <select name="departure" value={filters.departure} onChange={handleFilterChange} style={styles.quickInput} disabled={loadingStations}>
                            <option value="">🚏 Điểm khởi hành</option>
                            {stations.map(s => <option key={s.id} value={s.id}>{s.location}</option>)}
                        </select>
                        <select name="destination" value={filters.destination} onChange={handleFilterChange} style={styles.quickInput} disabled={loadingStations}>
                            <option value="">📍 Điểm đến</option>
                            {stations.map(s => <option key={s.id} value={s.id}>{s.location}</option>)}
                        </select>
                        <input type="date" name="departureDate" value={filters.departureDate} onChange={handleFilterChange} style={styles.quickInput} />
                        <button onClick={fetchSchedules} style={styles.quickButton}>Tìm chuyến</button>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div style={styles.mainLayout} className="bus-list-main">
                {/* Sidebar Filters */}
                <aside style={styles.sidebar} className="bus-list-sidebar">
                    <div style={styles.sidebarCard}>
                        <div style={styles.sidebarHeader}>
                            <h3 style={styles.sidebarTitle}>🎛️ Bộ lọc</h3>
                            <button style={styles.clearBtn} onClick={clearFilters}>Xóa tất cả</button>
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Điểm khởi hành</label>
                            <select name="departure" value={filters.departure} onChange={handleFilterChange} style={styles.filterSelect}>
                                <option value="">Tất cả điểm</option>
                                {stations.map(s => <option key={s.id} value={s.id}>{s.location}</option>)}
                            </select>
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Điểm đến</label>
                            <select name="destination" value={filters.destination} onChange={handleFilterChange} style={styles.filterSelect}>
                                <option value="">Tất cả điểm</option>
                                {stations.map(s => <option key={s.id} value={s.id}>{s.location}</option>)}
                            </select>
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Ngày khởi hành</label>
                            <input type="date" name="departureDate" value={filters.departureDate} onChange={handleFilterChange} style={styles.filterInput} />
                        </div>
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Chọn xe</label>
                            <select name="bus_id" value={filters.bus_id} onChange={handleFilterChange} style={styles.filterSelect} disabled={loadingCars}>
                                <option value="">Tất cả xe</option>
                                {cars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <button onClick={fetchSchedules} style={{ ...styles.bookBtn, width: '100%' }}>Áp dụng bộ lọc</button>
                        </div>
                    </div>
                </aside>

                {/* Results */}
                <main style={styles.resultsArea}>
                    <div style={styles.resultsHeader}>
                        <span style={styles.resultsCount}><strong>{schedules.length}</strong> chuyến xe được tìm thấy</span>
                        <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} style={styles.sortSelect}>
                            <option value="departure_time:asc">Sắp xếp: Giờ khởi hành sớm nhất</option>
                            <option value="departure_time:desc">Sắp xếp: Giờ khởi hành muộn nhất</option>
                            <option value="price:asc">Sắp xếp: Giá thấp nhất</option>
                            <option value="price:desc">Sắp xếp: Giá cao nhất</option>
                        </select>
                    </div>

                    {loading && <div style={styles.loadingState}>⏳ Đang tìm kiếm chuyến xe phù hợp...</div>}
                    {error && !loading && <div style={{ ...styles.emptyState, color: '#dc2626' }}>{error}</div>}

                    {!loading && schedules.length === 0 && (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>🚌</div>
                            <h3 style={styles.emptyTitle}>Không tìm thấy chuyến xe</h3>
                            <p style={styles.emptyText}>Hãy thử thay đổi bộ lọc hoặc chọn ngày khác</p>
                        </div>
                    )}

                    {schedules.map((s) => (
                        <div key={s.id} style={styles.tripCard} className="trip-card"
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'}>
                            <div style={styles.tripCardInner} className="trip-card-inner">
                                <div style={styles.tripImage}>
                                    <img src={s.bus_featured_image ? getImageUrl(s.bus_featured_image) : '/image/bus-placeholder.png'} alt={s.bus_name || 'Bus'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={styles.tripInfo}>
                                    <div style={styles.tripCompany}>Mã chuyến: #{s.id}</div>
                                    <h3 style={styles.tripName}>{s.bus_name || 'Xe khách'}</h3>
                                    <div style={styles.tripRoute}>
                                        <div style={styles.routePoint}><span style={styles.routeDot}></span><span style={styles.routeText}>{getStationName(s.departure_station_id) || 'Điểm đi'}</span></div>
                                        <span style={styles.routeArrow}>→</span>
                                        <div style={styles.routePoint}><span style={{ ...styles.routeDot, background: '#10b981' }}></span><span style={styles.routeText}>{getStationName(s.arrival_station_id) || 'Điểm đến'}</span></div>
                                    </div>
                                    <div style={styles.tripMeta}>
                                        <div style={styles.metaItem}><span style={styles.metaIcon}>🕐</span>{s.departure_time ? new Date(s.departure_time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'N/A'}</div>
                                        <div style={styles.metaItem}><span style={styles.metaIcon}>🚌</span>Xe #{s.bus_id}</div>
                                        <div style={styles.metaItem}><span style={styles.metaIcon}>🛣️</span>Tuyến #{s.route_id}</div>
                                    </div>
                                </div>
                                <div style={styles.tripActions} className="trip-actions">
                                    <div style={styles.tripPrice}>
                                        <div style={styles.priceLabel}>Giá từ</div>
                                        <div style={styles.priceValue}>{s.base_price ? Number(s.base_price).toLocaleString('vi-VN') + '₫' : 'Liên hệ'}</div>
                                    </div>
                                    <div style={styles.actionButtons}>
                                        <button style={styles.detailBtn} onClick={() => navigate(`/car-detail/${s.bus_id}`)}>Chi tiết</button>
                                        <button style={styles.bookBtn} onClick={() => handleOpenSeats(s)}>Đặt vé</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </main>
            </div>

            <button style={styles.mobileFilterToggle} className="bus-list-mobile-toggle" onClick={() => setMobileFilterOpen(!mobileFilterOpen)}>
                🎛️ Bộ lọc
            </button>

            <Footer />

            {showSeats && selectedBus && <SeatListModal open={showSeats} onClose={handleCloseSeats} schedule={selectedBus} />}
        </div>
    );
}
