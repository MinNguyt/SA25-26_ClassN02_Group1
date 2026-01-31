import React, { useState, useEffect } from 'react';
import api from '../../../services/api.service.js';
import { Bus, Plane, Hotel, MapPin, Sparkles, Search, Calendar } from 'lucide-react';

const HomeBanner = () => {
    const [departure, setDeparture] = useState(''); // station id
    const [destination, setDestination] = useState(''); // station id
    const [departureDate, setDepartureDate] = useState('');
    const [stations, setStations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(false);
    const [stationError, setStationError] = useState('');

    // Tab state for visual purposes
    const [activeTab, setActiveTab] = useState('bus');

    useEffect(() => {
        const fetchStations = async () => {
            setLoadingStations(true);
            setStationError('');
            try {
                const res = await api.getStations({ includeAuth: false, suppressUnauthorizedRedirect: true });
                if (res.success) {
                    const payload = res.data;
                    const list = payload?.responseObject || payload?.data || payload || [];
                    setStations(Array.isArray(list) ? list : []);
                } else {
                    setStationError(res.error || 'Không thể tải danh sách bến xe');
                }
            } catch (e) {
                setStationError(e.message || 'Không thể tải danh sách bến xe');
            } finally {
                setLoadingStations(false);
            }
        };
        fetchStations();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        window.location.href = `/bus-list?departure=${departure}&destination=${destination}&departureDate=${departureDate}`;
    };

    const tabs = [
        { id: 'bus', label: 'Xe khách', icon: <Bus className="w-5 h-5" /> },
        // Replaced Umbrella with MapPin for generic travel or just keep text
        { id: 'ai', label: 'AI Mode', icon: <Sparkles className="w-5 h-5" /> },
    ];

    return (
        <div className="w-full mb-[20%] h-[500px] bg-[#f5f7fa] py-12 px-4 flex flex-col items-center gap-8 justify-start">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-7xl overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
                {/* Left Content */}
                <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-10 leading-tight">
                        Tìm kiếm chuyến xe <br className="hidden lg:block" />an toàn, tiện lợi.
                    </h1>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center gap-2 p-2 min-w-[70px] transition-colors rounded-lg
                                    ${activeTab === tab.id
                                        ? 'text-orange-600 bg-orange-50'
                                        : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <div className={`p-3 rounded-xl shadow-sm border ${activeTab === tab.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-200'}`}>
                                    {React.cloneElement(tab.icon, { className: 'w-5 h-5' })}
                                </div>
                                <span className="text-xs font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search Controls */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span className="cursor-pointer hover:underline">Loại chuyến: Một chiều </span>
                        </div>

                        {/* Search Bar Container */}
                        <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Departure */}
                            <div className="flex-1 bg-gray-100 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 hover:bg-gray-200 transition-colors relative group">
                                <label className="block text-xs font-bold text-gray-500 mb-1">ĐIỂM ĐI</label>
                                <select
                                    value={departure}
                                    onChange={(e) => setDeparture(e.target.value)}
                                    className="w-full bg-transparent font-semibold text-gray-800 outline-none appearance-none cursor-pointer"
                                    disabled={loadingStations}
                                >
                                    <option value="">Chọn điểm đi</option>
                                    {stations.map(s => (
                                        <option key={s.id} value={s.id}>{s.location}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Destination */}
                            <div className="flex-1 bg-gray-100 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 hover:bg-gray-200 transition-colors relative group">
                                <label className="block text-xs font-bold text-gray-500 mb-1">ĐIỂM ĐẾN</label>
                                <select
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full bg-transparent font-semibold text-gray-800 outline-none appearance-none cursor-pointer"
                                    disabled={loadingStations}
                                >
                                    <option value="">Chọn điểm đến</option>
                                    {stations.map(s => (
                                        <option key={s.id} value={s.id}>{s.location}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div className="w-full lg:w-64 bg-white p-4 hover:bg-gray-50 transition-colors relative">
                                <label className="block text-xs font-bold text-gray-500 mb-1">NGÀY ĐI</label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={departureDate}
                                        onChange={(e) => setDepartureDate(e.target.value)}
                                        className="w-full bg-transparent font-semibold text-gray-800 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                className="bg-orange-600 hover:bg-orange-700 text-white p-4 lg:w-20 w-full flex items-center justify-center transition-colors"
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        </div>


                    </div>
                </div>

                {/* Right Side Image - Masonry Grid */}
                <div className="hidden lg:flex relative w-[45%] overflow-visible">
                    <div className="absolute -top-8 -right-8 flex gap-3">
                        {/* Column 1 */}
                        <div className="flex flex-col gap-3 mt-12">
                            <img
                                src="/asets/images/home-banner-2.png"
                                className="w-[140px] h-[100px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/banner-img-1.png"
                                className="w-[140px] h-[180px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-3 mt-4">
                            <img
                                src="/asets/images/home-banner-3.png"
                                className="w-[140px] h-[160px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/home-banner-4.png"
                                className="w-[140px] h-[120px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/home-banner-5.png"
                                className="w-[140px] h-[100px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                        </div>

                        {/* Column 3 */}
                        <div className="flex flex-col gap-3">
                            <img
                                src="/asets/images/home-banner-6.png"
                                className="w-[100px] h-[80px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/home-banner-2.png"
                                className="w-[100px] h-[140px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                            <img
                                src="/asets/images/banner-img-1.png"
                                className="w-[100px] h-[100px] object-cover rounded-2xl shadow-lg"
                                alt="Travel destination"
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* Info Cards Section */}
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Save when compare */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex -space-x-2 overflow-hidden">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white
                                ${i === 1 ? 'bg-red-500' :
                                    i === 2 ? 'bg-blue-500' :
                                        i === 3 ? 'bg-green-500' :
                                            i === 4 ? 'bg-yellow-500' : 'bg-purple-500'}`}
                            >
                                {['V', 'A', 'L', 'M', 'K'][i - 1]}
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Tiết kiệm nhiều hơn</h3>
                        <p className="text-gray-500 text-sm mt-1">Nhiều ưu đãi, nhiều lựa chọn, một lần tìm kiếm.</p>
                    </div>
                </div>

                {/* Card 2: Searches */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex -space-x-3 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full" />
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">41,000,000+</h3>
                        <p className="text-gray-500 text-sm mt-1">lượt tìm kiếm trong tuần này</p>
                    </div>
                </div>

                {/* Card 3: Ratings */}
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        ))}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Khách hàng tin dùng</h3>
                        <p className="text-gray-500 text-sm mt-1">1M+ đánh giá trên ứng dụng</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeBanner;
