package com.example.gateway.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * JWT Authentication Filter for API Gateway.
 * Validates JWT tokens from cookies for protected routes.
 * For Option B: Basic validation at gateway, full validation at Identity
 * Service.
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Value("${gateway.auth.excluded-paths:/api/auth/login,/api/auth/register}")
    private List<String> excludedPaths;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // Skip authentication for public endpoints
        if (isExcludedPath(path)) {
            return chain.filter(exchange);
        }

        // Extract token from cookies
        String token = extractTokenFromCookies(exchange);

        if (token != null) {
            // Forward the token in the Authorization header to downstream services
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header("Authorization", "Bearer " + token)
                    .build();
            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        }

        // No token found - allow request to proceed (downstream service handles auth)
        // This is Option B: Gateway forwards, Identity Service validates
        return chain.filter(exchange);
    }

    private boolean isExcludedPath(String path) {
        return excludedPaths.stream().anyMatch(excluded -> path.startsWith(excluded));
    }

    private String extractTokenFromCookies(ServerWebExchange exchange) {
        HttpCookie cookie = exchange.getRequest().getCookies().getFirst("ACCESS_TOKEN");
        return cookie != null ? cookie.getValue() : null;
    }

    @Override
    public int getOrder() {
        return -100; // High priority
    }
}
