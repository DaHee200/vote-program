package com.test.vote.service

import com.test.vote.model.Category
import java.time.LocalDate

data class PostCommand(
    val question: String,
    val category: Category,
    val endDate: LocalDate
)