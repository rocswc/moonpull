#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# UTF-8 출력 설정
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer)

# PIL ANTIALIAS 문제 해결을 위한 패치
try:
    from PIL import Image
    if not hasattr(Image, 'ANTIALIAS'):
        Image.ANTIALIAS = Image.LANCZOS
except ImportError:
    pass

import easyocr
import numpy as np
import cv2
import logging

# 로깅 설정 - ERROR 레벨로 설정하여 INFO 로그 숨김
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

def extract_text_from_image(image_path):
    """
    이미지에서 텍스트 추출
    """
    try:
        # 파일 존재 확인
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {image_path}")
        
        # EasyOCR 리더 초기화 (한국어 + 영어) - 조용히 초기화
        reader = easyocr.Reader(['ko', 'en'], gpu=False, verbose=False)
        
        # 이미지 처리 시작
        logger.info(f"이미지 처리 시작: {image_path}")
        
        # OpenCV로 이미지 읽기
        image = cv2.imread(image_path)
        
        if image is None:
            # OpenCV로 읽기 실패시 PIL 사용
            from PIL import Image as PILImage
            pil_image = PILImage.open(image_path)
            image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        # BGR을 RGB로 변환
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # OCR 실행
        results = reader.readtext(image_rgb)
        
         # 결과 처리
        extracted_texts = []
        for (bbox, text, confidence) in results:
            if confidence > 0.5:
                text = text.strip()

                # ❌ 특정 로그 패턴 걸러내기 (필요 시 더 추가)
                if (
                    text.startswith("C:\\") or
                    "UserWarning" in text or
                    "warnings.warn" in text or
                    "torch" in text or
                    "dataloader" in text or
                    text.lower().startswith("page") or  # 예: 페이지 작동하지 않습니다
                    text.lower().startswith("traceback")  # 예: 예외 메시지
                ):
                    continue  # 이 텍스트는 제외

                extracted_texts.append(text)

        # 텍스트들을 공백으로 연결
        final_text = ' '.join(extracted_texts)
        
        # 로그 제거
        
        # 결과 출력 (Java에서 읽음) - UTF-8 인코딩 보장
        if final_text:
            print(final_text.encode('utf-8').decode('utf-8'))
        else:
            print("")
        
        return final_text
        
    except Exception as e:
        logger.error(f"OCR 처리 중 오류 발생: {str(e)}")
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

def main():
    """
    메인 함수
    """
    if len(sys.argv) != 2:
        print("사용법: python easyocr_processor.py <이미지_파일_경로>", file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    extract_text_from_image(image_path)

if __name__ == "__main__":
    main()