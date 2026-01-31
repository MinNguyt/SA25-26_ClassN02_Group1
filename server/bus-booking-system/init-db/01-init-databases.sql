-- Initialize databases for microservices
-- This script runs when MySQL container starts

-- Users DB (for identity-service)
CREATE DATABASE IF NOT EXISTS users_db;

-- Fleet DB (for company-service)
CREATE DATABASE IF NOT EXISTS fleet_db;

-- Route DB (for route-service)
CREATE DATABASE IF NOT EXISTS route_db;

-- Schedule DB (for schedule-service)
CREATE DATABASE IF NOT EXISTS schedule_db;

-- Booking DB (for booking-service)
CREATE DATABASE IF NOT EXISTS booking_db;

-- Review DB (for review-service)
CREATE DATABASE IF NOT EXISTS review_db;

-- Chatbot DB (for chatbot-service)
CREATE DATABASE IF NOT EXISTS chatbot_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;
