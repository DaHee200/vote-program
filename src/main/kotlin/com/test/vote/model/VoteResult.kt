package com.test.vote.model

import jakarta.persistence.*

@Entity
class VoteResult(
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    val post: Post
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0

    var agreeCount: Long = 0
        protected set

    var disagreeCount: Long = 0
        protected set

    var totalCount: Long = 0
        protected set
}
