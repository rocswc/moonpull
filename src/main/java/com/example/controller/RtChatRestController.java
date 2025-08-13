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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rt-chat")
@RequiredArgsConstructor
public class RtChatRestController {

    private final RtChatService rtChatService;
    private final SimpMessagingTemplate broker;
    private final MemberRepository memberRepository; // 👈 member 테이블 조회 
    private final SimpUserRegistry userRegistry;
    
      
 // 현재 온라인인 STOMP 사용자들의 principal name(loginId) 목록
    @GetMapping("/online")
    public ResponseEntity<List<String>> online(@AuthenticationPrincipal CustomUserDetails me) {
        List<String> online = userRegistry.getUsers()
            .stream().map(SimpUser::getName)
            // 내 자신을 빼고 싶으면 아래 라인 유지, 아니면 제거
            .filter(name -> me == null || !name.equals(me.getUsername()))
            .toList();
        return ResponseEntity.ok(online);
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
	 
 // ------------------------
    // 2) 채팅 "요청/수락/거절"
    // ------------------------

 // CHANGED: 요청 생성
    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(
            @AuthenticationPrincipal CustomUserDetails me,
            @RequestBody ChatRequestDtos.CreateRequest req) {

        if (me == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthenticated"); // CHANGED

        long fromUserId = me.getUserId();
        long toUserId   = req.toUserId();

        Member fromM = memberRepository.findById(fromUserId)
                .orElseThrow(() -> new IllegalArgumentException("fromUser not found: " + fromUserId));
        Member toM = memberRepository.findById(toUserId)
                .orElseThrow(() -> new IllegalArgumentException("toUser not found: " + toUserId));

        MemberVO fromVO = toVO(fromM); // CHANGED: 엔티티→VO 변환
        MemberVO toVO   = toVO(toM);

        var payload = new ChatRequestDtos.RequestPushed(
                UUID.randomUUID().toString(),
                fromUserId, toUserId, Instant.now(),
                fromVO, toVO
        );

        // CHANGED: convertAndSendToUser 의 첫 인자는 username(loginId)!
        broker.convertAndSendToUser(toM.getLoginId(), "/queue/requests", payload);

        return ResponseEntity.ok(payload);
    }

 // CHANGED: 수락
    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<?> accept(
            @AuthenticationPrincipal CustomUserDetails me,
            @PathVariable String requestId,
            @RequestBody ChatRequestDtos.AcceptRequest body) {

        if (me == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthenticated"); // CHANGED

        long fromUserId = body.fromUserId();
        long toUserId   = body.toUserId();

        var room = rtChatService.createRoomIfAbsent(fromUserId, toUserId, null);

        Member fromM = memberRepository.findById(fromUserId).orElseThrow();
        Member toM   = memberRepository.findById(toUserId).orElseThrow();

        MemberVO fromVO = toVO(fromM);
        MemberVO toVO   = toVO(toM);

        var opened = new ChatRequestDtos.RoomOpened(
                requestId, room, List.of(fromVO, toVO), List.of()
        );
 
        broker.convertAndSendToUser(fromM.getLoginId(), "/queue/request-accepted", opened);
        broker.convertAndSendToUser(toM.getLoginId(),   "/queue/request-accepted", opened);
        return ResponseEntity.ok(opened);
    }

    // CHANGED: 거절(선택)
    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<?> reject(
            @AuthenticationPrincipal CustomUserDetails me,
            @PathVariable String requestId,
            @RequestBody ChatRequestDtos.AcceptRequest body) {

        if (me == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthenticated"); // CHANGED

        Member fromM = memberRepository.findById(body.fromUserId()).orElseThrow();
        broker.convertAndSendToUser(fromM.getNickname(), "/queue/request-rejected", requestId);
        return ResponseEntity.ok().build();
    }

 // ---- helper: Member 엔티티 → MemberVO (필요한 최소 필드만) ----
    private static String nvl(String s, String def) {
        return (s == null || s.isBlank()) ? def : s;
    }
    
    private MemberVO toVO(Member e) {
        MemberVO vo = new MemberVO();
        // Long -> Integer (null 안전)
        vo.setUserId(e.getUserId() != null ? e.getUserId().intValue() : null);
        // 프론트는 name ?? nickname ?? `user-{id}` 순으로 쓰므로 nickname만 채워도 충분
        vo.setNickname(nvl(e.getNickname(), "이름없음"));
        // 전공(없으면 "미지정")
        vo.setMajor(nvl(e.getMajor(), "미지정"));
        return vo;
    }
    
}