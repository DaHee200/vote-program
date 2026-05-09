package com.test.vote.service

import java.time.LocalDate

data class PostCommand(
    val question: String,
    val endDate: LocalDate
)