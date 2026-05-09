package com.test.vote.controller.res_factory

import com.test.vote.controller.res.PostRes
import com.test.vote.model.Post

class PostResFactory {

    companion object {

        fun createPostRes(post: Post): PostRes {
            return PostRes(
                id = post.id,
                question = post.question,
                category = post.category,
                endDate = post.endDate,
                createdDate = post.createdDate,
                agreeCount = post.voteResult?.agreeCount ?: 0,
                disagreeCount = post.voteResult?.disagreeCount ?: 0
            )
        }
    }
}
