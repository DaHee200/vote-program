package com.test.vote.repository

import com.test.vote.model.Vote
import org.springframework.data.jpa.repository.JpaRepository

interface VoteRepository : JpaRepository<Vote, Long> {
    fun findByPostIdAndIpAddress(postId: Long, ipAddress: String): Vote?
}
