package com.test.vote.model.entity_factory

import com.test.vote.model.Post
import java.time.LocalDate

class PostFactory private constructor() {

    companion object {
        fun createPost(
            question: String,
            endDate: LocalDate
        ): Post {
            return Post(question, endDate)
        }
    }
}