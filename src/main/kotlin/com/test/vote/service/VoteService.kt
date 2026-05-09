package com.test.vote.service

import com.test.vote.model.Vote
import com.test.vote.repository.PostRepository
import com.test.vote.repository.VoteRepository
import com.test.vote.repository.VoteResultRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.ResponseStatus

@Service
class VoteService(
    private val postRepository: PostRepository,
    private val voteRepository: VoteRepository,
    private val voteResultRepository: VoteResultRepository,
    private val rateLimitService: RateLimitService
) {
    @Transactional
    fun vote(postId: Long, ipAddress: String, choice: Boolean) {
        checkRateLimit(ipAddress)

        val vote = voteRepository.findByPostIdAndIpAddress(postId, ipAddress)

        if (vote == null) {
            // New vote
            val newVote = Vote(postId = postId, ipAddress = ipAddress, choice = choice)
            voteRepository.save(newVote)
            incrementCount(postId, choice)
        } else {
            // Existing vote
            if (!vote.isActive) {
                // Was canceled, reactivate
                vote.isActive = true
                vote.choice = choice
                incrementCount(postId, choice)
                voteRepository.save(vote)
            } else if (vote.choice != choice) {
                // Changed choice
                decrementCount(postId, vote.choice)
                vote.choice = choice
                incrementCount(postId, choice)
                voteRepository.save(vote)
            }
            // If the choice is exactly the same and isActive == true, 
            // normally it's handled by cancelVote (DELETE), but if called via PUT we just ignore or return.
        }
    }

    // cancelVote will be added in the next commit

    private fun checkRateLimit(ipAddress: String) {
        if (!rateLimitService.isAllowed(ipAddress)) {
            throw RateLimitExceededException("Rate limit exceeded for IP: $ipAddress. Please try again after 1 minute.")
        }
    }

    private fun incrementCount(postId: Long, choice: Boolean) {
        if (choice) voteResultRepository.incrementAgreeCount(postId)
        else voteResultRepository.incrementDisagreeCount(postId)
    }

    private fun decrementCount(postId: Long, choice: Boolean) {
        if (choice) voteResultRepository.decrementAgreeCount(postId)
        else voteResultRepository.decrementDisagreeCount(postId)
    }
}

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
class RateLimitExceededException(message: String) : RuntimeException(message)
