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
            // POLITICS (정치 - 이지선다)
            PostCommand("내년 대선 투표 기준:\n정책 보고 투표 (👍) vs 인물 보고 투표 (👎)", Category.POLITICS, LocalDate.now().plusDays(30)),
            PostCommand("기본 소득제 도입:\n전 국민 지급 (👍) vs 취약 계층 집중 지급 (👎)", Category.POLITICS, LocalDate.now().plusDays(15)),
            PostCommand("만 18세 선거 연령 제한:\n현행 유지 (👍) vs 만 16세로 추가 인하 (👎)", Category.POLITICS, LocalDate.now().plusDays(45)),
            PostCommand("국회의원 특권 폐지:\n찬성 및 폐지 (👍) vs 유지하되 책임 강화 (👎)", Category.POLITICS, LocalDate.now().minusDays(2)), // 종료된 투표
            PostCommand("주 4일제 도입 시 임금 기준:\n임금 삭감 수용 (👍) vs 임금 보전 필수 (👎)", Category.POLITICS, LocalDate.now().plusDays(10)),

            // ENTERTAINMENT (연예 - 이지선다)
            PostCommand("좋아하는 가수의 콘서트 티켓팅:\n맨 앞 스탠딩 (👍) vs 편안한 지정석 (👎)", Category.ENTERTAINMENT, LocalDate.now().plusDays(60)),
            PostCommand("아이돌 가수의 열애 공개:\n연애는 개인의 자유 (👍) vs 팬들에 대한 예의 부족 (👎)", Category.ENTERTAINMENT, LocalDate.now().plusDays(20)),
            PostCommand("좋아하는 예능 프로그램 유형:\n리얼 야외 버라이어티 (👍) vs 실내 스튜디오 토크쇼 (👎)", Category.ENTERTAINMENT, LocalDate.now().minusDays(5)), // 종료된 투표
            PostCommand("드라마 시청 방식 선호도:\n매주 본방 사수 (👍) vs 한 번에 몰아보기 (👎)", Category.ENTERTAINMENT, LocalDate.now().plusDays(40)),
            PostCommand("연예인 부캐(서브 캐릭터) 활동:\n참신하고 재밌다 (👍) vs 과도한 이미지 소비로 식상하다 (👎)", Category.ENTERTAINMENT, LocalDate.now().plusDays(30))
        )

        mockPosts.forEach { postService.createPost(it) }
    }
}
