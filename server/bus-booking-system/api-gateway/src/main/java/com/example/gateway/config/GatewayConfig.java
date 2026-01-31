package com.example.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Identity Service - Authentication endpoints
                .route("identity-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f.stripPrefix(1)) // Remove /api prefix
                        .uri("http://localhost:8081"))

                // Company Service
                .route("company-service", r -> r
                        .path("/api/companies/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8082"))

                // Route Service
                .route("route-service", r -> r
                        .path("/api/routes/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8083"))

                // Schedule Service
                .route("schedule-service", r -> r
                        .path("/api/schedules/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8084"))

                // Booking Service
                .route("booking-service", r -> r
                        .path("/api/bookings/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8085"))

                // Review Service
                .route("review-service", r -> r
                        .path("/api/reviews/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8086"))

                // Chatbot Service
                .route("chatbot-service", r -> r
                        .path("/api/chatbot/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8087"))

                .build();
    }
}
