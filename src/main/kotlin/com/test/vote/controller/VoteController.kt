package com.test.vote.controller


import com.test.vote.service.VoteService
import com.test.vote.util.IpUtil
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@Tag(name = "VoteController")
@RequestMapping("posts/{postId}/vote")
class VoteController(
    private val voteService: VoteService
) {

    @Operation(method = "PUT", summary = "투표하기 / 재투표하기 ")
    @PutMapping
    fun vote(
        @PathVariable postId: Long,
        @RequestBody result: Boolean,
        request: HttpServletRequest
    ) {
        val ipAddress = IpUtil.getClientIp(request)
        voteService.vote(postId, ipAddress, result)
    }

    // cancelVote will be added in the next commit
}