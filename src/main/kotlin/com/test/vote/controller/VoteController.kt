package com.test.vote.controller


import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@Tag(name = "VoteController")
@RequestMapping("posts/{postId}/vote")
class VoteController {

    @Operation(method = "PUT", summary = "투표하기 / 재투표하기 ")
    @PutMapping
    fun vote(@RequestBody result: Boolean) {

    }

    @Operation(method = "DELETE", summary = "투표 취소하기")
    @DeleteMapping
    fun cancelVote() {

    }
}