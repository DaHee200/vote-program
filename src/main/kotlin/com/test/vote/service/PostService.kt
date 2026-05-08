package com.test.vote.service

import com.test.vote.repository.PostRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PostService(private val postRepository: PostRepository) {

    @Transactional
    fun createPost() {

    }

}