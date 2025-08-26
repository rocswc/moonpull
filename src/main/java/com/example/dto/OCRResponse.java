package com.example.dto;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class OCRResponse {
	
	/**
     * 처리 성공 여부
     */
    private boolean success;
    
    /**
     * 추출된 텍스트
     */
    private String text;
    
    /**
     * 오류 메시지 (실패 시)
     */
    private String error;
    
    /**
     * 원본 파일명
     */
    private String filename;
    
    /**
     * 파일 크기 (bytes)
     */
    private Long fileSize;
    
    /**
     * 처리 시간 (ms)
     */
    private Long processingTime;
    
    /**
     * 상세 OCR 결과 (필요시)
     */
    private List<OCRDetail> details;
    
    /**
     * OCR 세부 결과 정보
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OCRDetail {
        /**
         * 인식된 텍스트
         */
        private String text;
        
        /**
         * 신뢰도 점수 (0.0 ~ 1.0)
         */
        private Float confidence;
        
        /**
         * 텍스트 위치 정보 (선택적)
         */
        private BoundingBox boundingBox;
    }
    
    /**
     * 텍스트 위치 정보
     */
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BoundingBox {
        private Integer x;
        private Integer y;
        private Integer width;
        private Integer height;
    }

}
