package com.test.vote.controller.res_factory

import com.test.vote.controller.res.PostRes
import com.test.vote.model.Post

class PostResFactory {

    companion object {

        fun createPostRes(post: Post): PostRes {
            return PostRes(
                id = post.id,
                question = post.question,
                endDate = post.endDate,
                createdDate = post.createdDate
            )
        }
    }
}
