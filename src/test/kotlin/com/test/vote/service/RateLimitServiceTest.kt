package com.test.vote.service

import io.kotest.core.spec.style.BehaviorSpec
import io.kotest.matchers.shouldBe

class RateLimitServiceTest : BehaviorSpec({

    val rateLimitService = RateLimitService()

    Given("RateLimitService가 주어지고") {
        val testIp = "192.168.0.1"

        When("동일한 IP에서 5번의 요청을 보낼 때") {
            var allPassed = true
            for (i in 1..5) {
                if (!rateLimitService.isAllowed(testIp)) {
                    allPassed = false
                }
            }

            Then("5번까지는 모두 허용되어야 한다") {
                allPassed shouldBe true
            }
        }

        When("동일한 IP에서 6번째 요청을 보낼 때") {
            val result = rateLimitService.isAllowed(testIp)

            Then("요청이 차단되어야 한다 (false 반환)") {
                result shouldBe false
            }
        }

        When("다른 IP에서 새로운 요청을 보낼 때") {
            val otherIp = "10.0.0.1"
            val result = rateLimitService.isAllowed(otherIp)

            Then("다른 IP의 요청은 허용되어야 한다") {
                result shouldBe true
            }
        }
    }
})
