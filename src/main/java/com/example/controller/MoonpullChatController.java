package com.example.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.example.dto.MoonpullChatResponseDTO;
import com.example.dto.MoonpullChatRequestDTO;
import com.example.dto.OCRResponse;
import com.example.entity.MoonpullChatSession;
import com.example.service.MoonpullChatSessionService;
import com.example.service.OCRService;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/moonpull-chat")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class MoonpullChatController {
    
    private final RestTemplate restTemplate;
    private final String PYTHON_API_URL = "http://localhost:8765/chat";
    
    @Autowired(required = false)
    private MoonpullChatSessionService moonpullChatSessionService;
    
    @Autowired(required = false)
    private OCRService ocrService;
    
    public MoonpullChatController() {
        this.restTemplate = new RestTemplate();
    }
    
    // 기존 메시지 API - 🆕 sessionId 추가
    @PostMapping("/message")
    public ResponseEntity<?> sendMessage(@RequestBody MoonpullChatRequestDTO request) {
        try {
            String sessionId = null;
            
            if (moonpullChatSessionService != null) {
                sessionId = request.getSessionId();
                if (sessionId == null || sessionId.isEmpty()) {
                    MoonpullChatSession newSession = moonpullChatSessionService.createNewSession(request.getUserId());
                    sessionId = newSession.getSessionId();
                }
                
                moonpullChatSessionService.addMessage(sessionId, request.getMessage(), true);
            }
            
            // 🆕 Python API에 sessionId도 함께 전송
            Map<String, String> requestData = new HashMap<>();
            requestData.put("message", request.getMessage());
            requestData.put("sessionId", sessionId != null ? sessionId : "default"); // 🆕 추가
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/json; charset=utf-8"));
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestData, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    PYTHON_API_URL, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                String botResponse = (String) responseBody.get("response");
                
                if (moonpullChatSessionService != null && sessionId != null) {
                    moonpullChatSessionService.addMessage(sessionId, botResponse, false);
                }
                
                return ResponseEntity.ok(MoonpullChatResponseDTO.success(botResponse, sessionId));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(MoonpullChatResponseDTO.error("챗봇 서버에 문제가 발생했습니다."));
            }
            
        } catch (Exception e) {
            log.error("메시지 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(MoonpullChatResponseDTO.error("Error: " + e.getMessage()));
        }
    }
    
    // OCR 텍스트 추출 API
    @PostMapping(value = "/ocr/extract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OCRResponse> extractTextFromImage(@RequestParam("image") MultipartFile image) {
        try {
            log.info("OCR 요청 받음: 파일명={}, 크기={}bytes", image.getOriginalFilename(), image.getSize());
            
            if (ocrService == null) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(OCRResponse.builder()
                        .success(false)
                        .error("OCR 서비스가 비활성화되어 있습니다.")
                        .build());
            }
            
            if (image.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(OCRResponse.builder()
                        .success(false)
                        .error("이미지 파일이 비어있습니다.")
                        .build());
            }

            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                    .body(OCRResponse.builder()
                        .success(false)
                        .error("이미지 파일만 업로드 가능합니다.")
                        .build());
            }

            if (image.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                    .body(OCRResponse.builder()
                        .success(false)
                        .error("파일 크기는 10MB를 초과할 수 없습니다.")
                        .build());
            }

            long startTime = System.currentTimeMillis();
            String extractedText = ocrService.extractText(image);
            long processingTime = System.currentTimeMillis() - startTime;
            
            log.info("OCR 처리 완료: 추출된 텍스트 길이={}, 소요시간={}ms", 
                extractedText.length(), processingTime);
            
            return ResponseEntity.ok(OCRResponse.builder()
                .success(true)
                .text(extractedText)
                .filename(image.getOriginalFilename())
                .fileSize(image.getSize())
                .processingTime(processingTime)
                .build());

        } catch (Exception e) {
            log.error("OCR 처리 중 오류 발생", e);
            return ResponseEntity.internalServerError()
                .body(OCRResponse.builder()
                    .success(false)
                    .error("이미지 처리 중 오류가 발생했습니다: " + e.getMessage())
                    .build());
        }
    }
    
    // OCR 서비스 상태 확인
    @GetMapping("/ocr/health")
    public ResponseEntity<OCRResponse> checkOCRHealth() {
        try {
            if (ocrService == null) {
                return ResponseEntity.ok(OCRResponse.builder()
                    .success(false)
                    .text("OCR 서비스가 비활성화되어 있습니다.")
                    .build());
            }
            
            boolean isHealthy = ocrService.isServiceHealthy();
            return ResponseEntity.ok(OCRResponse.builder()
                .success(isHealthy)
                .text(isHealthy ? "OCR 서비스가 정상 작동 중입니다." : "OCR 서비스에 문제가 있습니다.")
                .build());
        } catch (Exception e) {
            log.error("OCR 서비스 상태 확인 중 오류", e);
            return ResponseEntity.internalServerError()
                .body(OCRResponse.builder()
                    .success(false)
                    .error("서비스 상태 확인 실패: " + e.getMessage())
                    .build());
        }
    }
    
    // 이미지와 함께 메시지 전송 (OCR + 채팅 통합)
    @PostMapping(value = "/message-with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendMessageWithImage(
            @RequestParam("message") String message,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "sessionId", required = false) String sessionId,
            @RequestParam(value = "userId", defaultValue = "anonymous") String userId) {
        
        try {
            String finalMessage = message;
            
            if (image != null && !image.isEmpty() && ocrService != null) {
                try {
                    String extractedText = ocrService.extractText(image);
                    if (extractedText != null && !extractedText.trim().isEmpty()) {
                        finalMessage = message.isEmpty() ? extractedText : message + "\n\n" + extractedText;
                        log.info("OCR 텍스트 추가됨: {}", extractedText);
                    }
                } catch (Exception e) {
                    log.warn("OCR 처리 실패, 원본 메시지만 사용: {}", e.getMessage());
                }
            }
            
            MoonpullChatRequestDTO chatRequest = new MoonpullChatRequestDTO();
            chatRequest.setMessage(finalMessage);
            chatRequest.setSessionId(sessionId);
            chatRequest.setUserId(userId);
            
            return sendMessage(chatRequest);
            
        } catch (Exception e) {
            log.error("이미지와 메시지 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(MoonpullChatResponseDTO.error("처리 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    // 세션 관리 API들
    @PostMapping("/sessions")
    public ResponseEntity<?> createNewSession(@RequestParam(defaultValue = "anonymous") String userId) {
        try {
            if (moonpullChatSessionService == null) {
                return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                        .body("세션 관리 기능이 비활성화되어 있습니다.");
            }
            
            MoonpullChatSession session = moonpullChatSessionService.createNewSession(userId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            log.error("새 세션 생성 중 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/sessions")
    public ResponseEntity<?> getUserSessions(@RequestParam(defaultValue = "anonymous") String userId) {
        try {
            if (moonpullChatSessionService == null) {
                return ResponseEntity.ok(List.of());
            }
            
            List<MoonpullChatSession> sessions = moonpullChatSessionService.getUserSessions(userId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            log.error("세션 목록 조회 중 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable String sessionId) {
        try {
            if (moonpullChatSessionService == null) {
                return ResponseEntity.notFound().build();
            }
            
            Optional<MoonpullChatSession> session = moonpullChatSessionService.getSession(sessionId);
            if (session.isPresent()) {
                return ResponseEntity.ok(session.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("세션 조회 중 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable String sessionId) {
        try {
            if (moonpullChatSessionService == null) {
                return ResponseEntity.notFound().build();
            }
            
            moonpullChatSessionService.deleteSession(sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("세션 삭제 중 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}