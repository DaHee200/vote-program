package com.test.vote.repository

import com.test.vote.model.Post
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@EnableJpaRepositories
interface PostRepository : JpaRepository<Post, Long> {
}