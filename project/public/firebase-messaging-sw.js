// Firebase SDK import
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Firebase 초기화 (프로젝트 설정 값 그대로 사용해야 함)
firebase.initializeApp({
  apiKey: "AIzaSyAef74zQ5OpMzYEPnjFb7QacrCFa_Z1_lg",
  authDomain: "moonpool-b2fc6.firebaseapp.com",
  projectId: "moonpool-b2fc6",
  storageBucket: "moonpool-b2fc6.appspot.com",   // ✅ appspot.com 으로 고정
  messagingSenderId: "192091954185",
  appId: "1:192091954185:web:330c6b051ba21a049facd8",
});

// FCM 인스턴스 가져오기
const messaging = firebase.messaging();

// 백그라운드 메시지 처리 (알림 표시)
messaging.onBackgroundMessage((payload) => {
  console.log("📩 백그라운드 메시지:", payload);

  const notificationTitle = payload.notification?.title || "알림";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
