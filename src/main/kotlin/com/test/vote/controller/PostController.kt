package com.test.vote.controller

import com.test.vote.controller.dto.PostDTO
import com.test.vote.service.PostService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("posts")
@Tag(name = "투표 생성 controller")
class PostController(
    private val postService: PostService
) {


    @Operation(method = "POST", summary = "투표 생성하기")
    @PostMapping("/new")
    fun createPost(@RequestBody newPost: PostDTO) {
        postService.createPost()
    }
}