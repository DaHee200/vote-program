package com.test.vote.service

import com.test.vote.model.Category
import com.test.vote.repository.PostRepository
import com.test.vote.repository.VoteRepository
import com.test.vote.repository.VoteResultRepository
import io.kotest.core.spec.style.BehaviorSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.springframework.boot.test.context.SpringBootTest
import java.time.LocalDate

@SpringBootTest
class VoteServiceIntegrationTest(
    private val voteService: VoteService,
    private val postService: PostService,
    private val postRepository: PostRepository,
    private val voteRepository: VoteRepository,
    private val voteResultRepository: VoteResultRepository
) : BehaviorSpec() {

    override fun extensions() = listOf(SpringExtension)

    init {
        Given("새로운 투표 포스트가 생성된 상태에서") {
        val postCmd = PostCommand("Test Question", Category.ETC, LocalDate.now().plusDays(1))
        postService.createPost(postCmd)
        val post = postRepository.findAll().first()
        val postId = post.id
        val testIp = "127.0.0.1"

        When("사용자가 처음으로 찬성(true) 투표를 하면") {
            voteService.vote(postId, testIp, true)

            Then("투표 레코드가 생성되고 찬성 카운트와 총 투표수가 1 증가해야 한다") {
                val vote = voteRepository.findByPostIdAndIpAddress(postId, testIp)
                vote shouldNotBe null
                vote!!.choice shouldBe true
                vote.isActive shouldBe true

                val voteResult = voteResultRepository.findById(post.voteResult!!.id).get()
                voteResult.agreeCount shouldBe 1
                voteResult.disagreeCount shouldBe 0
                voteResult.totalCount shouldBe 1
            }
        }
        When("동일한 사용자가 똑같은 선택(true)으로 다시 투표를 시도하면") {
            voteService.vote(postId, testIp, true)

            Then("카운트에 변화가 없어야 하며 투표 상태가 유지되어야 한다") {
                val voteResult = voteResultRepository.findById(post.voteResult!!.id).get()
                voteResult.agreeCount shouldBe 1
                voteResult.totalCount shouldBe 1
            }
        }

        When("동일한 사용자가 반대(false)로 선택을 변경하면") {
            voteService.vote(postId, testIp, false)

            Then("찬성 카운트는 감소하고 반대 카운트는 증가하며 총 투표수는 유지되어야 한다") {
                val vote = voteRepository.findByPostIdAndIpAddress(postId, testIp)
                vote!!.choice shouldBe false

                val voteResult = voteResultRepository.findById(post.voteResult!!.id).get()
                voteResult.agreeCount shouldBe 0
                voteResult.disagreeCount shouldBe 1
                voteResult.totalCount shouldBe 1
            }
        }

        When("사용자가 투표를 취소하면") {
            voteService.cancelVote(postId, testIp)

            Then("투표 레코드가 비활성화되고 기존 선택(반대) 카운트와 총 투표수가 0이 되어야 한다") {
                val vote = voteRepository.findByPostIdAndIpAddress(postId, testIp)
                vote!!.isActive shouldBe false

                val voteResult = voteResultRepository.findById(post.voteResult!!.id).get()
                voteResult.agreeCount shouldBe 0
                voteResult.disagreeCount shouldBe 0
                voteResult.totalCount shouldBe 0
            }
        }

        When("취소했던 사용자가 다시 찬성(true)으로 재투표하면") {
            voteService.vote(postId, testIp, true)

            Then("투표 레코드가 재활성화되고 찬성 카운트와 총 투표수가 다시 1 증가해야 한다") {
                val vote = voteRepository.findByPostIdAndIpAddress(postId, testIp)
                vote!!.isActive shouldBe true
                vote.choice shouldBe true

                val voteResult = voteResultRepository.findById(post.voteResult!!.id).get()
                voteResult.agreeCount shouldBe 1
                voteResult.disagreeCount shouldBe 0
                voteResult.totalCount shouldBe 1
            }
        }
    }

    Given("여러 카테고리의 포스트가 존재할 때") {
        postRepository.deleteAll()
        voteRepository.deleteAll()

        postService.createPost(PostCommand("Culture Post", Category.CULTURE, LocalDate.now().plusDays(1)))
        postService.createPost(PostCommand("Politics Post", Category.POLITICS, LocalDate.now().plusDays(1)))

        When("CULTURE 카테고리로 필터링하여 조회하면") {
            val result = postService.getPosts(0, 10, Category.CULTURE, "latest")

            Then("CULTURE 카테고리의 포스트만 반환되어야 한다") {
                result.content.size shouldBe 1
                result.content[0].question shouldBe "Culture Post"
                result.content[0].category shouldBe Category.CULTURE
            }
        }

        When("필터 없이 전체 조회하면") {
            val result = postService.getPosts(0, 10, null, "latest")

            Then("모든 카테고리의 포스트가 반환되어야 한다") {
                result.content.size shouldBe 2
            }
        }
    }

    Given("투표수가 다른 여러 포스트가 존재할 때") {
        postRepository.deleteAll()
        voteRepository.deleteAll()

        postService.createPost(PostCommand("Unpopular Post", Category.ETC, LocalDate.now().plusDays(1)))
        postService.createPost(PostCommand("Popular Post", Category.ETC, LocalDate.now().plusDays(1)))

        val posts = postRepository.findAll()
        val popularPost = posts.find { it.question == "Popular Post" }!!

        // Popular Post에 투표 2표 추가
        voteService.vote(popularPost.id, "10.0.0.1", true)
        voteService.vote(popularPost.id, "10.0.0.2", false)

        When("인기순(popular)으로 정렬하여 조회하면") {
            val result = postService.getPosts(0, 10, null, "popular")

            Then("투표수가 많은(totalCount가 높은) 포스트가 먼저 반환되어야 한다") {
                result.content.size shouldBe 2
                result.content[0].question shouldBe "Popular Post"
                result.content[1].question shouldBe "Unpopular Post"
            }
        }

        When("최신순(latest)으로 정렬하여 조회하면") {
            val result = postService.getPosts(0, 10, null, "latest")

            Then("가장 최근에 생성된 포스트가 먼저 반환되어야 한다") {
                // 뒤에 생성된 Popular Post가 먼저 와야 함 (id 기반 혹은 createdDate 기반)
                result.content[0].question shouldBe "Popular Post"
            }
        }
    }
}
}

