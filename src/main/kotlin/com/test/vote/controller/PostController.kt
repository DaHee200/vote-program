package com.test.vote.controller

import com.test.vote.controller.dto.Post
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
@Tag(name = "투표 생성 controller")
class PostController {

    @Operation(method = "POST", summary = "투표 생성하기")
    @PostMapping
    fun createPost(@RequestBody newPost: Post) {

    }
}