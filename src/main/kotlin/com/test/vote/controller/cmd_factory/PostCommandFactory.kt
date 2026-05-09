package com.test.vote.controller.cmd_factory

import com.test.vote.controller.req.PostReq
import com.test.vote.service.PostCommand

class PostCommandFactory {

    companion object {

        fun createRegisterPostCommand(
            newPost: PostReq
        ): PostCommand {
            return PostCommand(newPost.question, newPost.endDate)
        }
    }
}