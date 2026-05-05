package com.test.vote.controller.dto

import com.test.vote.common_dto.EndData

data class PostVote(val question: String, val endDate: EndData)