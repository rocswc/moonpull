package com.example.VO;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(
    name = "member_social",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_social", columnNames = {"social_type", "social_id"})
    }
)
public class MemberSocialVO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // N:1 (여러 소셜 → 한 멤버)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private MemberVO member;

    @Column(name = "social_type", nullable = false, length = 20)
    private String socialType; // KAKAO, NAVER, GOOGLE

    @Column(name = "social_id", nullable = false, length = 100)
    private String socialId;
}
