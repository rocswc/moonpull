import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // 백엔드에서 번역 리소스 로드
  .use(Backend)
  // 브라우저 언어 감지
  .use(LanguageDetector)
  // React와 통합
  .use(initReactI18next)
  .init({
    // 기본 언어
    fallbackLng: 'ko',
    lng: 'ko', // 강제로 한국어로 설정
    
    // 지원 언어
    supportedLngs: ['ko', 'en'],
    
    // 백엔드 설정
    backend: {
      // 번역 파일 로드 URL (백엔드 API 엔드포인트)
      loadPath: '/api/translations/{{lng}}',
      // 번역 파일 저장 URL (선택사항)
      addPath: '/api/translations/{{lng}}',
      // 요청 타임아웃
      requestOptions: {
        cache: 'no-store'
      }
    },
    
    // 언어 감지 설정
    detection: {
      // 쿠키에 언어 저장
      caches: ['localStorage', 'cookie'],
      // 쿠키 이름
      lookupCookie: 'i18nextLng',
      // 로컬스토리지 키
      lookupLocalStorage: 'i18nextLng',
      // URL 파라미터
      lookupQuerystring: 'lng',
      // 헤더
      lookupSessionStorage: 'i18nextLng',
      // 기본 언어 - 한국어로 강제 설정
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
    },
    
    // 디버그 모드 (개발 시에만)
    debug: process.env.NODE_ENV === 'development',
    
    // 리소스 로딩 실패 시 처리
    saveMissing: true,
    saveMissingTo: 'all',
    
    // 인터폴레이션 설정
    interpolation: {
      escapeValue: false, // React에서 이미 XSS 방지
    },
    
    // 네임스페이스 (선택사항)
    ns: ['common', 'navigation', 'mentee', 'home'],
    defaultNS: 'common',
    
    // 리소스 로딩 완료 후 콜백
    react: {
      useSuspense: false, // Suspense 사용하지 않음
    }
  });

export default i18n;
