package com.test.vote.service

import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.LinkedList
import java.util.concurrent.ConcurrentHashMap

@Service
class RateLimitService {

    private val ipRecords = ConcurrentHashMap<String, RateLimitInfo>()

    class RateLimitInfo {
        var blockUntil: LocalDateTime? = null
        val requestTimes = LinkedList<LocalDateTime>()
    }

    fun isAllowed(ip: String): Boolean {
        val now = LocalDateTime.now()
        val info = ipRecords.computeIfAbsent(ip) { RateLimitInfo() }

        synchronized(info) {
            // Check if currently blocked
            if (info.blockUntil != null) {
                if (now.isBefore(info.blockUntil)) {
                    return false
                } else {
                    // Block expired
                    info.blockUntil = null
                    info.requestTimes.clear()
                }
            }

            // Remove requests older than 1 minute
            val oneMinuteAgo = now.minusMinutes(1)
            while (info.requestTimes.isNotEmpty() && info.requestTimes.peek().isBefore(oneMinuteAgo)) {
                info.requestTimes.poll()
            }

            // Check if we hit the limit (5 times)
            if (info.requestTimes.size >= 5) {
                // Block for 1 minute
                info.blockUntil = now.plusMinutes(1)
                return false
            }

            info.requestTimes.add(now)
            return true
        }
    }
}
