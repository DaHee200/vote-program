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
    fun getPosts(page: Int, size: Int): Slice<Post> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDate"))
        return postRepository.findSliceBy(pageable)
    }

}