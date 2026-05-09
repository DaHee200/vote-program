package com.test.vote.controller.req

import java.time.LocalDate

data class PostReq(val question: String, val endDate: LocalDate)