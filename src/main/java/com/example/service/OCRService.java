package com.example.service;

import com.example.dto.OCRResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class OCRService {

    @Value("${app.ocr.python-path:/usr/bin/python3}")
    private String pythonPath;

    @Value("${app.ocr.script-path:src/main/resources/ocr/easyocr_processor.py}")
    private String scriptPath;

    @Value("${app.ocr.temp-dir:#{systemProperties['java.io.tmpdir']}}")
    private String tempDir;

    @Value("${app.ocr.timeout:30}")
    private int timeoutSeconds;

    /**
     * 이미지에서 텍스트 추출
     */
    public String extractText(MultipartFile image) throws Exception {
        long startTime = System.currentTimeMillis();
        Path tempFile = null;
        
        try {
            // 임시 파일 생성
            tempFile = createTempFile(image);
            
            // Python OCR 스크립트 실행
            String result = executePythonOCR(tempFile.toString());
            
            long processingTime = System.currentTimeMillis() - startTime;
            log.info("OCR 처리 완료: 소요시간={}ms", processingTime);
            
            return result.trim();
            
        } finally {
            // 임시 파일 정리
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (Exception e) {
                    log.warn("임시 파일 삭제 실패: {}", tempFile, e);
                }
            }
        }
    }

    /**
     * 임시 파일 생성
     */
    private Path createTempFile(MultipartFile image) throws IOException {
        String originalFilename = image.getOriginalFilename();
        String extension = "";
        
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = "ocr_" + UUID.randomUUID().toString() + extension;
        Path tempFile = Paths.get(tempDir, filename);
        
        // 디렉토리 생성
        Files.createDirectories(tempFile.getParent());
        
        // 파일 저장
        try (InputStream is = image.getInputStream()) {
            Files.copy(is, tempFile);
        }
        
        log.debug("임시 파일 생성: {}", tempFile);
        return tempFile;
    }

    /**
     * Python OCR 스크립트 실행
     */
    private String executePythonOCR(String imagePath) throws Exception {
        List<String> command = new ArrayList<>();
        command.add(pythonPath);
        command.add(scriptPath);
        command.add(imagePath);

        log.debug("OCR 명령 실행: {}", String.join(" ", command));

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();
        
        // 타임아웃 설정
        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("OCR 처리 시간 초과 (" + timeoutSeconds + "초)");
        }

        // 결과 읽기
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), "UTF-8"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        int exitCode = process.exitValue();
        if (exitCode != 0) {
            throw new RuntimeException("OCR 스크립트 실행 실패 (exit code: " + exitCode + "): " + output.toString());
        }

        return output.toString();
    }

    /**
     * OCR 서비스 상태 확인
     */
    public boolean isServiceHealthy() {
        try {
            // Python과 필요 라이브러리 설치 상태 확인
            ProcessBuilder processBuilder = new ProcessBuilder(pythonPath, "-c", 
                "import easyocr; print('OK')");
            Process process = processBuilder.start();
            
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return false;
            }
            
            return process.exitValue() == 0;
        } catch (Exception e) {
            log.error("OCR 서비스 상태 확인 실패", e);
            return false;
        }
    }
}