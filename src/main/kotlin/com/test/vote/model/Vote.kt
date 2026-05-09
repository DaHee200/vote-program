package com.test.vote.model

import jakarta.persistence.*

@Entity
class Vote(
    val postId: Long,
    
    val ipAddress: String,
    
    var choice: Boolean // true: agree, false: disagree
) {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0

    var isActive: Boolean = true // true: active vote, false: canceled vote
}
