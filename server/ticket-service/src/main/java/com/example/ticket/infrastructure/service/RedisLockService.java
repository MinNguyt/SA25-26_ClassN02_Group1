package com.example.ticket.infrastructure.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisLockService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String LOCK_PREFIX = "seat_lock:";

    public boolean tryLock(Integer scheduleId, Integer seatId, long durationInMinutes) {
        String key = LOCK_PREFIX + scheduleId + ":" + seatId;
        log.info("Attempting to acquire lock for key: {}", key);

        Boolean success = redisTemplate.opsForValue().setIfAbsent(key, "LOCKED", Duration.ofMinutes(durationInMinutes));

        if (Boolean.TRUE.equals(success)) {
            log.info("Lock acquired for key: {}", key);
            return true;
        } else {
            log.warn("Failed to acquire lock for key: {}", key);
            return false;
        }
    }

    public void releaseLock(Integer scheduleId, Integer seatId) {
        String key = LOCK_PREFIX + scheduleId + ":" + seatId;
        log.info("Releasing lock for key: {}", key);
        redisTemplate.delete(key);
    }

    public boolean isLocked(Integer scheduleId, Integer seatId) {
        String key = LOCK_PREFIX + scheduleId + ":" + seatId;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
