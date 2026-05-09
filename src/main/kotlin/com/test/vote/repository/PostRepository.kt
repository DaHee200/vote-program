package com.test.vote.repository

import com.test.vote.model.Category
import com.test.vote.model.Post
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@EnableJpaRepositories
interface PostRepository : JpaRepository<Post, Long> {
    @EntityGraph(attributePaths = ["voteResult"])
    fun findSliceBy(pageable: Pageable): Slice<Post>

}