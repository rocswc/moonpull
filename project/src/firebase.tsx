import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAef74zQ5OpMzYEPnjFb7QacrCFa_Z1_lg",
  authDomain: "moonpool-b2fc6.firebaseapp.com",
  projectId: "moonpool-b2fc6",
  storageBucket: "moonpool-b2fc6.appspot.com",   // ✅ 여기 수정
  messagingSenderId: "192091954185",
  appId: "1:192091954185:web:330c6b051ba21a049facd8",
};

// ✅ 이미 초기화된 앱 있으면 재사용
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 브라우저 지원 여부 체크 (Safari 같은 데서 에러 방지)
let messaging: Messaging | null = null;

(async () => {
  if (await isSupported()) {
    messaging = getMessaging(app);
  }
})();

export { messaging };
export default app;
