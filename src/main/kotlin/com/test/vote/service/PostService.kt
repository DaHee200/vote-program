package com.test.vote.service

import com.test.vote.model.Category
import com.test.vote.model.Post
import com.test.vote.model.entity_factory.PostFactory
import com.test.vote.repository.PostRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Slice
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PostService(private val postRepository: PostRepository) {

    @Transactional
    fun createPost(postCmd: PostCommand) {
        val post = PostFactory.createPost(postCmd.question, postCmd.category, postCmd.endDate)
        post.voteResult = com.test.vote.model.VoteResult(post)
        postRepository.save(post)
    }

    @Transactional(readOnly = true)
    fun getPosts(page: Int, size: Int, category: Category?, sortBy: String, status: String? = null): Slice<Post> {
        val sort = if (sortBy.equals("popular", ignoreCase = true)) {
            Sort.by(Sort.Direction.DESC, "voteResult.totalCount")
        } else {
            Sort.by(Sort.Direction.DESC, "createdDate")
        }
        val pageable = PageRequest.of(page, size, sort)
        val now = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Seoul"))
        
        val normalizedStatus = if (status.isNullOrBlank()) null else status.lowercase()

        return when (normalizedStatus) {
            "ongoing" -> if (category != null) {
                postRepository.findByCategoryAndEndDateGreaterThanEqual(category, now, pageable)
            } else {
                postRepository.findByEndDateGreaterThanEqual(now, pageable)
            }
            "ended" -> if (category != null) {
                postRepository.findByCategoryAndEndDateBefore(category, now, pageable)
            } else {
                postRepository.findByEndDateBefore(now, pageable)
            }
            else -> if (category != null) {
                postRepository.findByCategory(category, pageable)
            } else {
                postRepository.findSliceBy(pageable)
            }
        }
    }

}