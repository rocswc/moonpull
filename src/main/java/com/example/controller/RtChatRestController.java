package com.example.controller;
import com.example.DAO.MemberRepository;
import com.example.VO.ChatMessage;
import com.example.VO.ChatRequestDtos;
import com.example.VO.ChatRoom;
import com.example.VO.MemberVO;
import com.example.entity.Member;
import com.example.security.CustomUserDetails;
import com.example.service.RtChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.checkerframework.checker.index.qual.SameLen;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rt-chat")
@RequiredArgsConstructor
@Slf4j
public class RtChatRestController {

    private final RtChatService rtChatService;
    private final SimpMessagingTemplate broker;
    private final MemberRepository memberRepository; // 👈 member 테이블 조회
    private final SimpUserRegistry userRegistry;
    
    @GetMapping("/online")
    public ResponseEntity<List<String>> online(@AuthenticationPrincipal CustomUserDetails me) {
        // ✅ 서비스의 실시간 맵 기반 스냅샷
        List<String> ids = rtChatService.getOnlineUserIds();

        // (선택) 본인 제외
        if (me != null) {
            ids = ids.stream()
                     .filter(id -> !id.equals(me.getUsername()))
                     .toList();
        }

        return ResponseEntity.ok()
            .header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            .header("Pragma", "no-cache")
            .header("Expires", "0")
            .body(ids);
    }
    
    @PostMapping("/rooms")
    public ChatRoom createRoom(@RequestParam long me, @RequestParam long other,
                               @RequestParam(required=false) String field) {
        return rtChatService.createRoomIfAbsent(me, other, field);
    }

    @GetMapping("/rooms/{roomId}/messages")
    public List<ChatMessage> page(@PathVariable long roomId,
                                  @RequestParam(required=false) Long beforeId,
                                  @RequestParam(defaultValue = "30") int size) {
        return rtChatService.getMessages(roomId, beforeId, size);
    }
	 
 // CHANGED: 요청 생성
    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(
            @AuthenticationPrincipal CustomUserDetails me,
            @RequestBody ChatRequestDtos.CreateRequest req) {

        if (me == null) {
            System.out.println("❌ [요청 생성] 인증 사용자 없음");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthenticated");
        }

        long fromUserId = me.getUserId();
        long toUserId = req.toUserId();

        System.out.println("✅ [요청 생성] from: " + fromUserId + " → to: " + toUserId);

        Member fromM = memberRepository.findById(fromUserId).orElseThrow(() -> new IllegalArgumentException("fromUser not found: " + fromUserId));
        Member toM = memberRepository.findById(toUserId).orElseThrow(() -> new IllegalArgumentException("toUser not found: " + toUserId));

        MemberVO fromVO = toVO(fromM);
        MemberVO toVO = toVO(toM);

        var payload = new ChatRequestDtos.RequestPushed(
                UUID.randomUUID().toString(),
                fromUserId, toUserId, Instant.now(),
                fromVO, toVO
        );

        System.out.println("📬 [요청 전송] → " + toM.getLoginId());
        broker.convertAndSendToUser(toM.getLoginId(), "/queue/requests", payload);

        return ResponseEntity.ok(payload);
    }

 // CHANGED: 수락
    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> accept(
            @AuthenticationPrincipal CustomUserDetails me,
            @PathVariable String requestId,
            @RequestBody ChatRequestDtos.AcceptRequest body) {

        if (me == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthenticated");

        long fromUserId = body.fromUserId();
        long toUserId   = body.toUserId();

        // 방 생성 (수락 시 방이 없는 경우 새로 생성)
        var room = rtChatService.createRoomIfAbsent(fromUserId, toUserId, null);

        // 회원 정보 조회
        Member fromM = memberRepository.findById(fromUserId).orElseThrow();
        Member toM   = memberRepository.findById(toUserId).orElseThrow();

        // VO 변환
        MemberVO fromVO = toVO(fromM);
        MemberVO toVO   = toVO(toM);

        // RoomOpened DTO 구성
        var opened = new ChatRequestDtos.RoomOpened(
                requestId, room, List.of(fromVO, toVO), List.of()
        );

        // ✅ 요청자와 수락자 모두에게 'request-accepted' 알림 전송
        broker.convertAndSendToUser(fromM.getLoginId(), "/queue/request-accepted", opened);
        log.info("📤 [요청자에게 전송 완료] loginId={}, roomId={}", fromM.getLoginId(), room.getId());

        broker.convertAndSendToUser(toM.getLoginId(), "/queue/request-accepted", opened);
        log.info("📤 [수락자에게 전송 완료] loginId={}, roomId={}", toM.getLoginId(), room.getId());

        // 응답 반환
        return ResponseEntity.ok(opened);
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> reject(
            @AuthenticationPrincipal CustomUserDetails me,
            @PathVariable String requestId,
            @RequestBody ChatRequestDtos.AcceptRequest body) {

        if (me == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthenticated");

        Member fromM = memberRepository.findById(body.fromUserId()).orElseThrow();

        // ✅ loginId 사용
        broker.convertAndSendToUser(fromM.getLoginId(), "/queue/request-rejected", requestId);
        return ResponseEntity.ok().build();
    }

    private static String nvl(String s, String def) {
        return (s == null || s.isBlank()) ? def : s;
    }
    
    private MemberVO toVO(Member e) {
        MemberVO vo = new MemberVO();
        vo.setUserId(e.getUserId() != null ? e.getUserId().intValue() : null);
        vo.setNickname(nvl(e.getNickname(), "이름없음"));
        vo.setMajor(nvl(e.getMajor(), "미지정"));
        return vo;
    }
      
}