package com.test.vote.controller


import com.test.vote.controller.dto.PostVote
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@Tag(name = "VoteController")
@RequestMapping("/vote")
class VoteController {

    @Operation(method = "POST")
    @PostMapping("/create")
    fun createVote(@RequestBody create: PostVote) {

    }
}