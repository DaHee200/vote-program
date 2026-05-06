package com.test.vote.controller.dto

import java.time.LocalDate

data class Vote(val question: String, val endDate: LocalDate)