package com.test.vote.model

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

@Entity
class Post(
    val question: String,
    @Enumerated(EnumType.STRING)
    val category: Category,
    @Column(length = 80)
    val endDate: LocalDate
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0

    val createdDate: LocalDateTime = LocalDateTime.now(ZoneId.of("Asia/Seoul"))

    @OneToOne(mappedBy = "post", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var voteResult: VoteResult? = null

}






