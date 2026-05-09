package com.test.vote.repository

import com.test.vote.model.VoteResult
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface VoteResultRepository : JpaRepository<VoteResult, Long> {

    @Modifying
    @Query("UPDATE VoteResult v SET v.agreeCount = v.agreeCount + 1 WHERE v.post.id = :postId")
    fun incrementAgreeCount(postId: Long)

    @Modifying
    @Query("UPDATE VoteResult v SET v.agreeCount = v.agreeCount - 1 WHERE v.post.id = :postId")
    fun decrementAgreeCount(postId: Long)

    @Modifying
    @Query("UPDATE VoteResult v SET v.disagreeCount = v.disagreeCount + 1 WHERE v.post.id = :postId")
    fun incrementDisagreeCount(postId: Long)

    @Modifying
    @Query("UPDATE VoteResult v SET v.disagreeCount = v.disagreeCount - 1 WHERE v.post.id = :postId")
    fun decrementDisagreeCount(postId: Long)
}
