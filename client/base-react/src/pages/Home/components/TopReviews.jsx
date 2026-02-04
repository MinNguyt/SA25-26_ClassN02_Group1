import React from 'react';
import './TopReviews.css';

const TopReviews = () => {
    const cities = [
        {
            name: 'Sài Gòn',
            reviews: '1.2k',
            image: 'https://images.unsplash.com/photo-1583417267754-006d0b555e8c?auto=format&fit=crop&w=800&q=80',
            size: 'large'
        },
        {
            name: 'Vũng Tàu',
            reviews: '450',
            image: 'https://images.unsplash.com/photo-1590457335753-4395638c4228?auto=format&fit=crop&w=600&q=80',
            size: 'medium'
        },
        {
            name: 'Đà Lạt',
            reviews: '890',
            image: 'https://images.unsplash.com/photo-1519834015795-037740f900a3?auto=format&fit=crop&w=600&q=80',
            size: 'medium'
        },
        {
            name: 'Quy Nhơn',
            reviews: '320',
            image: 'https://images.unsplash.com/photo-1566453916963-8dc6d817454f?auto=format&fit=crop&w=600&q=80',
            size: 'medium'
        },
        {
            name: 'Nha Trang',
            reviews: '670',
            image: 'https://images.unsplash.com/photo-1559648602-53b05f2b3e8e?auto=format&fit=crop&w=600&q=80',
            size: 'medium'
        },
        {
            name: 'Hà Nội',
            reviews: '950',
            image: 'https://images.unsplash.com/photo-1528127222408-4a91964fe271?auto=format&fit=crop&w=800&q=80',
            size: 'large'
        },
        {
            name: 'Đà Nẵng',
            reviews: '740',
            image: 'https://images.unsplash.com/photo-1570513903102-187515322986?auto=format&fit=crop&w=600&q=80',
            size: 'medium'
        },
        {
            name: 'Phan Thiết',
            reviews: '280',
            image: 'https://images.unsplash.com/photo-1605707769411-9c6001095034?auto=format&fit=crop&w=600&q=80',
            size: 'medium'
        },
        {
            name: 'Hội An',
            reviews: '550',
            image: 'https://images.unsplash.com/photo-1535025639602-980580d85638?auto=format&fit=crop&w=600&q=80',
            size: 'medium'
        },
        {
            name: 'Sa Pa',
            reviews: '420',
            image: 'https://images.unsplash.com/photo-1575459388701-a75d5b7a1e05?auto=format&fit=crop&w=600&q=80',
            size: 'medium'
        }
    ];

    const handleCityClick = (cityName) => {
        console.log(`Clicked on ${cityName}`);
    };

    return (
        <section className="top-reviews">
            <div className="container">
                <div className="section-header">
                    <h2>Điểm đến nổi bật</h2>
                    <p>Khám phá vẻ đẹp Việt Nam qua những điểm đến được yêu thích nhất</p>
                    <div className="w-20 h-1 bg-orange-500 mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="cities-grid">
                    {cities.map((city, idx) => (
                        <div
                            key={idx}
                            className={`city-card ${city.size}`}
                            onClick={() => handleCityClick(city.name)}
                            tabIndex={0}
                            role="button"
                        >
                            <div
                                className="city-bg"
                                style={{ backgroundImage: `url('${city.image}')` }}
                            ></div>
                            <div className="city-overlay">
                                <h3 className="city-name">{city.name}</h3>
                                <div className="city-reviews">
                                    <span className="review-badge">
                                        <i className="fas fa-camera mr-2"></i>
                                        {city.reviews} bài viết
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TopReviews;
