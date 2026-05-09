package com.test.vote.controller.res

import java.time.LocalDate
import java.time.LocalDateTime

data class PostRes(
    val id: Long,
    val question: String,
    val endDate: LocalDate,
    val createdDate: LocalDateTime,
    val agreeCount: Long,
    val disagreeCount: Long
)
