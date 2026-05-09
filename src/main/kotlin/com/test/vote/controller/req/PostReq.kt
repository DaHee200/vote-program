package com.test.vote.controller.req

import com.test.vote.model.Category
import java.time.LocalDate

data class PostReq(val question: String, val category: Category, val endDate: LocalDate)