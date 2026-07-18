package com.test.vote.config

import com.test.vote.model.Category
import com.test.vote.repository.PostRepository
import com.test.vote.service.PostCommand
import com.test.vote.service.PostService
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class DataInitializer(
    private val postService: PostService,
    private val postRepository: PostRepository
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        if (postRepository.count() > 0) return

        val mockPosts = listOf(
            // POLITICS (정치)
            PostCommand("내년 대선, 어떤 후보를 더 지지하시나요?", Category.POLITICS, LocalDate.now().plusDays(30)),
            PostCommand("기본소득제 도입에 찬성하십니까?", Category.POLITICS, LocalDate.now().plusDays(15)),
            PostCommand("만 18세 선거 연령 인하에 찬성하시나요?", Category.POLITICS, LocalDate.now().plusDays(45)),
            PostCommand("국회의원 3선 제한 법안 도입에 동의하시나요?", Category.POLITICS, LocalDate.now().minusDays(2)), // 종료된 투표
            PostCommand("주 4일 근무제 법제화 도입 찬반 투표", Category.POLITICS, LocalDate.now().plusDays(10)),

            // ENTERTAINMENT (연예)
            PostCommand("올해 최고의 연예대상 수상자는 누구라고 생각하나요?", Category.ENTERTAINMENT, LocalDate.now().plusDays(60)),
            PostCommand("좋아하는 아이돌 그룹 컴백 콘서트 티켓 50만원 찬반", Category.ENTERTAINMENT, LocalDate.now().plusDays(20)),
            PostCommand("공개 연애하는 아이돌에 대한 팬들의 지지", Category.ENTERTAINMENT, LocalDate.now().minusDays(5)), // 종료된 투표
            PostCommand("넷플릭스 신작 드라마, 시즌 2 제작 찬성하시나요?", Category.ENTERTAINMENT, LocalDate.now().plusDays(40)),
            PostCommand("연예인들의 사생활 침해 예방을 위한 법 개정 찬성하시나요?", Category.ENTERTAINMENT, LocalDate.now().plusDays(30)),

            // ETC (기타)
            PostCommand("민초 vs 반민초, 당신의 선택은?", Category.ETC, LocalDate.now().plusDays(365)),
            PostCommand("여름에는 냉면 vs 이열치열 삼계탕", Category.ETC, LocalDate.now().plusDays(100)),
            PostCommand("탕수육 부먹 vs 찍먹, 평생의 논쟁", Category.ETC, LocalDate.now().plusDays(300)),
            PostCommand("아침식사는 밥 vs 빵, 무엇을 더 선호하나요?", Category.ETC, LocalDate.now().minusDays(10)), // 종료된 투표
            PostCommand("평생 겨울만 살기 vs 평생 여름만 살기", Category.ETC, LocalDate.now().plusDays(120))
        )

        mockPosts.forEach { postService.createPost(it) }
    }
}
